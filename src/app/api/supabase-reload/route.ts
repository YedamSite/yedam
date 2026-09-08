import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').split(/[\r\n]+/)[0];

const TABLE_MAP: Record<string, string> = {
  orders: 'cheotnun_orders',
  order_tracking: 'cheotnun_order_tracking',
  communication_logs: 'cheotnun_communication_logs',
  products: 'cheotnun_products',
  categories: 'cheotnun_categories',
  brands: 'cheotnun_brands',
  blog_posts: 'cheotnun_blog_posts',
  cms_blocks: 'cheotnun_cms_blocks',
  routines: 'cheotnun_routines',
  users: 'cheotnun_users',
  newsletter_subscribers: 'cheotnun_newsletter_subscribers',
  subscriptions: 'cheotnun_subscriptions',
  // Tabelas locais com suporte a Supabase
  coupons: 'cheotnun_coupons',
};

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get('cheotnun_admin_session')?.value === 'true';

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'get') {
      const { tables } = body;
      if (!Array.isArray(tables) || tables.length === 0) {
        return NextResponse.json({ error: 'Provide tables array' }, { status: 400 });
      }
      const supabase = createClient(supabaseUrl, serviceRoleKey);
      const result: Record<string, any[]> = {};
      for (const table of tables) {
        const tableName = TABLE_MAP[table];
        if (!tableName) continue;
        let query = supabase.from(tableName).select('*');
        if (tableName === 'cheotnun_orders') {
          query = query.order('created_at', { ascending: false });
        }
        const { data, error } = await query;
        if (!error && data) {
          result[table] = data;
        } else if (error) {
          console.warn(`Supabase get(${tableName}):`, error.message);
        }
      }
      return NextResponse.json({ success: true, data: result });
    }

    if (action === 'upsert') {
      const { table, records } = body;
      const tableName = TABLE_MAP[table];
      // Se a tabela não está mapeada no Supabase, retorna sucesso silencioso
      // (o dado já foi salvo no localStorage pelo db.save antes desta chamada)
      if (!tableName) {
        return NextResponse.json({ success: true, synced: 0, local_only: true });
      }
      if (!Array.isArray(records)) {
        return NextResponse.json({ error: 'Invalid records' }, { status: 400 });
      }
      const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const valid = records.filter((r: any) => r.id && UUID_RE.test(r.id));
      if (valid.length === 0) {
        return NextResponse.json({ success: true, synced: 0 });
      }
      // Sanitize foreign keys: empty strings or non-UUIDs → null (UUID columns reject empty strings/invalid formats)
      for (const r of valid) {
        for (const key of ['brand_id', 'category_id', 'user_id', 'order_id', 'product_id', 'customer_id']) {
          if (r[key] === '' || (r[key] && typeof r[key] === 'string' && !UUID_RE.test(r[key]))) {
            r[key] = null;
          }
        }
      }
      const supabase = createClient(supabaseUrl, serviceRoleKey);
      const { error } = await supabase.from(tableName).upsert(valid, { onConflict: 'id', ignoreDuplicates: false });
      if (error) {
        // Se a tabela não existe no Supabase (ex: tabela local que não foi migrada),
        // não bloqueia a operação — o dado já está seguro no localStorage
        if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('relation')) {
          console.warn(`Supabase table ${tableName} does not exist, keeping local-only.`);
          return NextResponse.json({ success: true, synced: 0, local_only: true, warning: error.message });
        }
        return NextResponse.json({ success: false, error: error.message, synced: 0 });
      }
      return NextResponse.json({ success: true, synced: valid.length });
    }

    if (action === 'delete') {
      const { table, id } = body;
      const tableName = TABLE_MAP[table];
      // Tabela não mapeada — delete local já foi feito, retorna sucesso silencioso
      if (!tableName) {
        return NextResponse.json({ success: true, local_only: true });
      }
      if (!id) {
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
      }
      const supabase = createClient(supabaseUrl, serviceRoleKey);
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) {
        if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('relation')) {
          return NextResponse.json({ success: true, local_only: true });
        }
        return NextResponse.json({ success: false, error: error.message });
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'deleteImage') {
      const { path } = body;
      if (!path) return NextResponse.json({ error: 'Provide path' }, { status: 400 });
      const supabase = createClient(supabaseUrl, serviceRoleKey);
      const { error } = await supabase.storage.from('cheotnun-images').remove([path]);
      if (error) return NextResponse.json({ success: false, error: error.message });
      return NextResponse.json({ success: true });
    }

    if (action === 'getSettings') {
      const { keys } = body;
      if (!Array.isArray(keys)) return NextResponse.json({ error: 'Provide keys array' }, { status: 400 });
      const supabase = createClient(supabaseUrl, serviceRoleKey);
      const result: Record<string, any> = {};
      for (const key of keys) {
        const { data, error } = await supabase.from('cheotnun_system_settings').select('value').eq('key', key).single();
        if (!error && data) result[key] = data.value;
      }
      return NextResponse.json({ success: true, data: result });
    }

    if (action === 'saveSetting') {
      const { key, value } = body;
      if (!key) return NextResponse.json({ error: 'Provide key' }, { status: 400 });
      const supabase = createClient(supabaseUrl, serviceRoleKey);
      const { error } = await supabase.from('cheotnun_system_settings').upsert({ key, value }, { onConflict: 'key' });
      if (error) return NextResponse.json({ success: false, error: error.message });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
