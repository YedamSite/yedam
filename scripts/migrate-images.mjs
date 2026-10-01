#!/usr/bin/env node
/**
 * ============================================================================
 *  MIGRAÇÃO DAS IMAGENS: base64 no Postgres  ->  arquivo no Supabase Storage
 * ============================================================================
 *
 *  POR QUE
 *    As imagens estão embutidas como texto base64 dentro das colunas de imagem
 *    (cheotnun_products.image, cheotnun_categories.image, cheotnun_brands.logo_url).
 *    Cada leitura do catálogo baixa ~6,25 MB de JSON, o que consumiu 1,2x a cota
 *    mensal de egress do plano gratuito (6,817 GB de 5 GB) e bloqueou o projeto.
 *
 *  O QUE ESTE SCRIPT FAZ (e o que ele NÃO faz)
 *    ✅ Lê as imagens atuais
 *    ✅ Faz backup de TODAS elas em disco, antes de qualquer escrita
 *    ✅ Sobe cada imagem como arquivo no bucket, e BAIXA DE VOLTA para conferir
 *       que os bytes gravados são idênticos aos originais (SHA-256)
 *    ✅ Atualiza a linha na banco SOMENTE para imagens já verificadas
 *    ✅ Grava um log de tudo, inclusive do que falhou
 *    ❌ NÃO altera nome, preço, descrição, categoria, marca, estoque, traduções
 *    ❌ NÃO toca em nenhuma outra tabela
 *    ❌ NÃO re-comprime nem converte as imagens (os bytes são idênticos)
 *
 *  MODOS
 *    node scripts/migrate-images.js --dry-run     (padrão) só analisa, não escreve
 *    node scripts/migrate-images.js --execute     executa a migração
 *    node scripts/migrate-images.js --verify      confere o resultado
 *    node scripts/migrate-images.js --rollback    restaura do backup
 *
 *  REQUISITOS
 *    - O projeto não pode estar bloqueado (HTTP 402). Teste antes.
 *    - As policies de storage precisam existir (ver supabase_storage_setup.sql).
 *
 *  IDEMPOTÊNCIA
 *    O caminho no bucket é determinístico (migrated/<tabela>/<id>.jpg), então
 *    rodar duas vezes sobrescreve o mesmo arquivo em vez de duplicar.
 * ============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BACKUP_DIR = path.join(ROOT, 'backups', 'images');
const LOG_FILE = path.join(BACKUP_DIR, 'migration.log');
const BUCKET = 'cheotnun-images';

// Tabelas e colunas de imagem conhecidas. Nada fora desta lista é tocado.
const ALVOS = [
  { tabela: 'cheotnun_products',   coluna: 'image' },
  { tabela: 'cheotnun_categories', coluna: 'image' },
  { tabela: 'cheotnun_brands',     coluna: 'logo_url' },
];

const MODO = process.argv.includes('--execute') ? 'execute'
  : process.argv.includes('--verify') ? 'verify'
  : process.argv.includes('--rollback') ? 'rollback'
  : 'dry-run';

// ───────────────────────────── env ─────────────────────────────
function lerEnv() {
  const out = {};
  for (const nome of ['.env', '.env.local']) {
    const p = path.join(ROOT, nome);
    if (!fs.existsSync(p)) continue;
    for (const linha of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
      const m = linha.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m) out[m[1]] = m[2].split(/[\r\n]/)[0].trim();
    }
  }
  return out;
}
const env = lerEnv();
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('FATAL: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausente em .env/.env.local');
  process.exit(1);
}
const HEADERS = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
};

function log(...a) {
  const linha = a.join(' ');
  console.log(linha);
  try {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] ${linha}\n`);
  } catch {}
}

const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const stamp = () => new Date().toISOString().replace(/[:.]/g, '-');

// ─────────────────────── verificações de guarda ───────────────────────
/**
 * Erro de guarda: projeto bloqueado por quota. Registra a mensagem e sinaliza
 * o código de saída sem chamar process.exit.
 */
class ProjetoBloqueado extends Error {
  constructor(status, corpo) { super(`projeto bloqueado (HTTP ${status})`); this.status = status; this.corpo = corpo; }
}

async function exigirProjetoAtivo() {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/cheotnun_products?select=id&limit=1`, { headers: HEADERS });
  const corpo = await r.text().catch(() => '');
  if (r.status === 402 || r.status === 423) throw new ProjetoBloqueado(r.status, corpo);
  if (!r.ok) throw new Error(`leitura de cheotnun_products falhou (HTTP ${r.status}): ${corpo.slice(0, 200)}`);
}

async function api(url, opts = {}) {
  const r = await fetch(`${SUPABASE_URL}${url}`, { ...opts, headers: { ...HEADERS, ...(opts.headers || {}) } });
  if (!r.ok) throw new Error(`${opts.method || 'GET'} ${url} -> HTTP ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return r.status === 204 ? null : r.json();
}

// ───────────────────────────── backup ─────────────────────────────
async function fazerBackup() {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const dump = { gerado_em: stamp(), project_url: SUPABASE_URL, registros: {} };
  for (const { tabela, coluna } of ALVOS) {
    const linhas = await api(`/rest/v1/${tabela}?select=id,${coluna}`);
    dump.registros[tabela] = linhas.map((l) => ({ id: l.id, coluna, valor: l[coluna] ?? null }));
    log(`  backup ${tabela}: ${linhas.length} linha(s)`);
  }
  const arquivo = path.join(BACKUP_DIR, `imagens-backup-${stamp()}.json`);
  fs.writeFileSync(arquivo, JSON.stringify(dump, null, 1));
  fs.writeFileSync(path.join(BACKUP_DIR, 'ultimo-backup.json'), JSON.stringify(dump));
  log(`  → ${path.relative(ROOT, arquivo)} (${(fs.statSync(arquivo).size / 1024 / 1024).toFixed(2)} MB)`);
  return dump;
}

function lerUltimoBackup() {
  const p = path.join(BACKUP_DIR, 'ultimo-backup.json');
  if (!fs.existsSync(p)) {
    console.error('FATAL: nenhum backup encontrado em backups/images/ultimo-backup.json');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

// ─────────────────────────── upload + verificação ───────────────────────────
/** Sobe os bytes e BAIXA DE VOLTA para provar que o que gravou é o que foi enviado. */
async function subirEVerificar(bytes, destino) {
  const up = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${destino}`, {
    method: 'POST',
    headers: { ...HEADERS, 'Content-Type': 'image/jpeg', 'x-upsert': 'true', Prefer: 'return=representation' },
    body: bytes,
  });
  if (!up.ok) return { ok: false, motivo: `upload HTTP ${up.status}` };

  // confere o arquivo realmente gravado
  const back = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${destino}`, { headers: HEADERS });
  if (!back.ok) return { ok: false, motivo: `download de verificacao HTTP ${back.status}` };
  const baixado = Buffer.from(await back.arrayBuffer());
  if (baixado.length !== bytes.length) return { ok: false, motivo: `tamanho divergente (${baixado.length} != ${bytes.length})` };
  if (sha256(baixado) !== sha256(bytes)) return { ok: false, motivo: 'sha256 divergente' };

  const pub = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${destino}`;
  const head = await fetch(pub, { method: 'HEAD' });
  if (!head.ok) return { ok: false, motivo: `URL publica nao responde (HTTP ${head.status})` };

  return { ok: true, url: pub, bytes: bytes.length };
}

function extrairBase64(valor) {
  if (typeof valor !== 'string') return null;
  const i = valor.indexOf(',');
  if (!valor.startsWith('data:') || i < 0) return null;
  return Buffer.from(valor.slice(i + 1), 'base64');
}

// ───────────────────────────── modos ─────────────────────────────
async function dryRun() {
  console.log('\n═════ SIMULAÇÃO (nada será escrito) ═════\n');
  await exigirProjetoAtivo();
  let totalB64 = 0, totalBytes = 0, jaUrl = 0, semImagem = 0, suspicious = 0;

  for (const { tabela, coluna } of ALVOS) {
    const linhas = await api(`/rest/v1/${tabela}?select=id,${coluna}`);
    let b = 0, u = 0, s = 0, by = 0;
    for (const l of linhas) {
      const buf = extrairBase64(l[coluna]);
      if (buf) {
        b++; by += buf.length;
        const jpegOk = buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF;
        const jpegFim = buf[buf.length - 2] === 0xFF && buf[buf.length - 1] === 0xD9;
        if (!jpegOk || !jpegFim) { suspicious++; log(`  ⚠ JPEG suspeito: ${tabela}/${l.id}`); }
      } else if (l[coluna]) { u++; }
      else { s++; }
    }
    totalB64 += b; totalBytes += by; jaUrl += u; semImagem += s;
    console.log(`  ${tabela.padEnd(22)} ${String(b).padStart(3)} em base64  ${String(u).padStart(3)} já URL  ${String(s).padStart(3)} sem imagem  ${(by / 1024 / 1024).toFixed(2)} MB`);
  }

  const cat = await api('/rest/v1/cheotnun_products?select=id,image');
  const payload = JSON.stringify(cat).length;
  const depois = JSON.stringify(cat.map((p) => ({ id: p.id, image: '<url ~110 bytes>' }))).length;

  console.log(`\n  total a migrar ......... ${totalB64} imagens (${(totalBytes / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`  imagens suspeitas ...... ${suspicious}`);
  console.log(`  payload de products .... ${(payload / 1024 / 1024).toFixed(2)} MB  ->  ~${(depois / 1024).toFixed(0)} KB`);
  console.log(`  redução ................. ~${Math.round((1 - depois / payload) * 100)}%`);
  console.log(`\n  NADA FOI ESCRITO. Para migrar: node scripts/migrate-images.js --execute`);
}

async function execute() {
  console.log('\n═════ MIGRAÇÃO ═════\n');
  await exigirProjetoAtivo();

  log('--- FASE 1/4: backup ---');
  const dump = await fazerBackup();
  const total = Object.values(dump.registros).reduce((s, r) => s + r.length, 0);
  log(`  ${total} registro(s) salvos. Se qualquer coisa der errado, o rollback usa este arquivo.`);
  log('');

  log('--- FASE 2/4: upload com verificação ---');
  const prontas = new Map(); // `${tabela}:${id}` -> url publica
  const jaErlidas = [];
  let ok = 0, pulou = 0, falhou = 0;

  for (const { tabela, coluna } of ALVOS) {
    const linhas = dump.registros[tabela];
    for (const { id, valor } of linhas) {
      const bytes = extrairBase64(valor);
      if (!bytes) {
        if (valor) { jaErlidas.push({ tabela, id, valor }); }
        pulou++;
        continue;
      }
      const destino = `migrated/${tabela}/${id}.jpg`;
      const r = await subirEVerificar(bytes, destino);
      if (r.ok) {
        prontas.set(`${tabela}:${id}`, { url: r.url, coluna, tabela });
        ok++;
        process.stdout.write(`\r  verificadas: ${ok}  |  falhas: ${falhou}  |  ignoradas: ${pulado}   `);
      } else {
        falhou++;
        log(`  ✗ FALHOU ${tabela}/${id}: ${r.motivo}  (linhamantida como estava)`);
      }
    }
    process.stdout.write('\n');
  }
  log(`  upload: ${ok} verificada(s), ${falhou} falha(s), ${pulado} sem alteracao`);

  if (ok === 0) {
    log('  nada verificado: ABORTADO, o banco não foi tocado.');
    return;
  }
  log('');

  log('--- FASE 3/4: atualizando o banco (somente linhas verificadas) ---');
  let atualizadas = 0;
  for (const [chave, info] of prontas) {
    const { tabela, url, coluna } = info;
    try {
      await api(`/rest/v1/${tabela}?id=eq.${encodeURIComponent(chave.split(':')[1])}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ [coluna]: url }),
      });
      atualizadas++;
      process.stdout.write(`\r  atualizadas: ${atualizadas}/${prontas.size}   `);
    } catch (e) {
      log(`  ✗ PATCH falhou ${chave}: ${e.message}  (imagem ja esta no storage, valor antigo mantido)`);
    }
  }
  process.stdout.write('\n');
  log(`  ${atualizadas} linha(s) atualizada(s)`);
  log('');

  log('--- FASE 4/4: verificacao final ---');
  let ruins = 0;
  for (const { tabela, coluna } of ALVOS) {
    const linhas = await api(`/rest/v1/${tabela}?select=id,${coluna}`);
    for (const l of linhas) {
      const v = l[coluna];
      if (v && v.startsWith('data:')) { ruins++; log(`  ✗ ${tabela}/${l.id} ainda em base64`); }
      else if (v && v.startsWith('http')) {
        const head = await fetch(v, { method: 'HEAD' });
        if (!head.ok) { ruins++; log(`  ✗ ${tabela}/${l.id} URL quebrada (HTTP ${head.status})`); }
      }
    }
  }
  const cat = await api('/rest/v1/cheotnun_products?select=id,image');
  log(`  problemas: ${ruins}`);
  log(`  payload de products agora: ${(JSON.stringify(cat).length / 1024).toFixed(0)} KB (era 5,59 MB)`);
  log(`\n  FIM. Log completo em ${path.relative(ROOT, LOG_FILE)}`);
  log(`  Para desfazer: node scripts/migrate-images.js --rollback`);
}

async function verify() {
  console.log('\n═════ VERIFICAÇÃO ═════\n');
  await exigirProjetoAtivo();
  let ok = 0, base64 = 0, quebrada = 0;
  for (const { tabela, coluna } of ALVOS) {
    const linhas = await api(`/rest/v1/${tabela}?select=id,${coluna}`);
    for (const l of linhas) {
      const v = l[coluna];
      if (!v) continue;
      if (v.startsWith('data:')) { base64++; log(`  base64 restante: ${tabela}/${l.id}`); }
      else if (v.startsWith('http')) {
        const h = await fetch(v, { method: 'HEAD' });
        if (h.ok) ok++; else { quebrada++; log(`  quebrada: ${tabela}/${l.id}`); }
      }
    }
  }
  console.log(`\n  URL validas: ${ok} | ainda base64: ${base64} | quebradas: ${quebrada}`);
}

async function rollback() {
  console.log('\n═════ ROLLBACK ═════\n');
  await exigirProjetoAtivo();
  const dump = lerUltimoBackup();
  log(`  restaurando de ${dump.gerado_em}`);
  let n = 0;
  for (const [tabela, registros] of Object.entries(dump.registros)) {
    for (const { id, coluna, valor } of registros) {
      try {
        await api(`/rest/v1/${tabela}?id=eq.${encodeURIComponent(id)}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({ [coluna]: valor }),
        });
        n++;
        process.stdout.write(`\r  restauradas: ${n}   `);
      } catch (e) { log(`  ✗ ${tabela}/${id}: ${e.message}`); }
    }
  }
  process.stdout.write('\n');
  log(`  ${n} valor(es) restaurado(s) ao estado original.`);
}

const modos = { 'dry-run': dryRun, execute, verify, rollback };
console.log(`\nmodo: ${MODO}`);

// Sem process.exit(): no Windows, encerrar o processo com sockets undici abertos
// dispara "Assertion failed" do libuv e devolve um codigo de saida de crash, o que
// faria uma migracao bem-sucedida parecer falha. O encadeamento abaixo apenas
// registra o resultado e deixa o Node sair naturalmente.
modos[MODO]().catch((e) => {
  if (e instanceof ProjetoBloqueado) {
    console.error('\n==============================================================');
    console.error(`  PROJETO SUPABASE BLOQUEADO (HTTP ${e.status})`);
    console.error('  Nada foi lido e nada foi escrito.');
    console.error('  Libere o plano no Dashboard do Supabase e rode de novo.');
    console.error('  Resposta: ' + e.corpo.slice(0, 300));
    console.error('==============================================================\n');
    process.exitCode = 2;
    return;
  }
  console.error('\nFATAL:', e.message);
  process.exitCode = 1;
});
