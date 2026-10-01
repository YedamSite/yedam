import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').split(/[\r\n]+/)[0];

// Allowed tables for public read (no admin required)
const PUBLIC_TABLE_MAP: Record<string, string> = {
  products: 'cheotnun_products',
  categories: 'cheotnun_categories',
  brands: 'cheotnun_brands',
  coupons: 'cheotnun_coupons',
};

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const tablesParam = searchParams.get('tables');

  if (!tablesParam) {
    return NextResponse.json({ error: 'Provide tables query param' }, { status: 400 });
  }

  const requestedTables = tablesParam.split(',').map(t => t.trim()).filter(Boolean);

  // ───────────────────────────────────────────────────────────────────────────
  // CACHE DE EGRESS
  // ───────────────────────────────────────────────────────────────────────────
  // Esta rota é pública e devolve o catálogo para TODA aba que abre o site, e o
  // cliente a chama a cada ~20s (live sync). Sem cache, cada chamada multiplica o
  // volume de saída do Supabase: são ~6 MB por resposta. Com várias abas/visitantes
  // isso consome a cota de egress do plano gratuito em horas — o projeto chegou a
  // ser bloqueado com "exceed_egress_quota".
  //
  // Duas camadas:
  //  1) TTL em memória por instância, para não repetir a consulta ao Supabase;
  //  2) s-maxage/stale-while-revalidate, para o CDN/proxy compartilhado também
  //     absorver as requisições entre instâncias.
  // Só dados públicos (catálogo + conteúdo do site) são cacheados.
  // ───────────────────────────────────────────────────────────────────────────
  const CACHE_TTL_MS = 60_000;
  const cache = new Map<string, { data: Record<string, any>; expiresAt: number }>();
  // uma única entrada em voo por chave, para várias abas simultâneas não dispararem
  // N consultas iguais ao mesmo tempo (cache stampede)
  const inFlight = new Map<string, Promise<Record<string, any>>>();

  try {
    const cacheKey = requestedTables.slice().sort().join(',');
    const hit = cache.get(cacheKey);
    if (hit && hit.expiresAt > Date.now()) {
      return NextResponse.json(
        { success: true, data: hit.data },
        { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600' } },
      );
    }

    let pending = inFlight.get(cacheKey);
    if (!pending) {
      pending = (async () => {
        const supabase = createClient(supabaseUrl, serviceRoleKey);
        const result: Record<string, any> = {};

        // Run all table fetches in parallel (the previous sequential loop made every page load wait
        // for all Supabase round-trips, adding noticeable latency before fresh content appeared).
        const fetchers = requestedTables.map(async (table) => {
          // System settings stored in cheotnun_system_settings: coupons, site_content, shipping_zones
          if (table === 'coupons' || table === 'site_content' || table === 'shipping_zones') {
            const { data: setting, error: err } = await supabase
              .from('cheotnun_system_settings')
              .select('value')
              .eq('key', table)
              .single();
            return { table, value: (!err && setting?.value) ? (typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value) : undefined };
          }
          const tableName = PUBLIC_TABLE_MAP[table];
          if (!tableName) return { table, value: undefined }; // Skip tables not in public whitelist
          const { data, error } = await supabase.from(tableName).select('*');
          return { table, value: (!error && data) ? data : undefined };
        });

        const settled = await Promise.all(fetchers);
        for (const { table, value } of settled) {
          if (value !== undefined) result[table] = value;
        }
        return result;
      })().finally(() => inFlight.delete(cacheKey));
      inFlight.set(cacheKey, pending);
    }

    const data = await pending;
    cache.set(cacheKey, { data, expiresAt: Date.now() + CACHE_TTL_MS });
    // Mantém o mapa pequeno: no máximo as algumas combinações de tabelas em uso.
    if (cache.size > 12) cache.delete(cache.keys().next().value as string);

    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          // `s-maxage` é o que o proxy compartilhado respeita; `no-store` no browser
          // foi removido de propósito para que o CDN também absorva as requisições.
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
          'CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
        },
      }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
