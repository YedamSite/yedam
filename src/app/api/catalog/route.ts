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

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const result: Record<string, any> = {};

    // Run all table fetches in parallel (the previous sequential loop made every page load wait
    // for all Supabase round-trips, adding noticeable latency before fresh content appeared).
    const fetchers = requestedTables.map(async (table) => {
      if (table === 'coupons' || table === 'site_content') {
        // Coupons and site_content live in cheotnun_system_settings (key = table) — the same
        // table used for theme/shipping, so it is guaranteed to exist. site_content carries the
        // section visibility toggles (rutinas/experiencias) and must reach every shopper browser,
        // otherwise a fresh visit would show the default disabled state.
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

    return NextResponse.json(
      { success: true, data: result },
      {
        headers: {
          // Disable caching so mobile devices instantly see new products
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
