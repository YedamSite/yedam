import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

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
};

export async function POST(req: Request) {
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
        const { data, error } = await supabase.from(tableName).select('*');
        if (!error && data) result[table] = data;
      }
      return NextResponse.json({ success: true, data: result });
    }

    if (action === 'upsert') {
      const { table, records } = body;
      const tableName = TABLE_MAP[table];
      if (!tableName || !Array.isArray(records)) {
        return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
      }
      const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const valid = records.filter((r: any) => r.id && UUID_RE.test(r.id));
      if (valid.length === 0) {
        return NextResponse.json({ success: true, synced: 0 });
      }
      const supabase = createClient(supabaseUrl, serviceRoleKey);
      const { error } = await supabase.from(tableName).upsert(valid, { onConflict: 'id', ignoreDuplicates: false });
      if (error) {
        return NextResponse.json({ success: false, error: error.message, synced: 0 });
      }
      return NextResponse.json({ success: true, synced: valid.length });
    }

    if (action === 'delete') {
      const { table, id } = body;
      const tableName = TABLE_MAP[table];
      if (!tableName || !id) {
        return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
      }
      const supabase = createClient(supabaseUrl, serviceRoleKey);
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) {
        return NextResponse.json({ success: false, error: error.message });
      }
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
