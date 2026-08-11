import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').split(/[\r\n]+/)[0];

// Allowed tables for public read (no admin required)
const PUBLIC_TABLE_MAP: Record<string, string> = {
  products: 'cheotnun_products',
  categories: 'cheotnun_categories',
  brands: 'cheotnun_brands',
};

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
    const result: Record<string, any[]> = {};

    for (const table of requestedTables) {
      const tableName = PUBLIC_TABLE_MAP[table];
      if (!tableName) continue; // Skip tables not in public whitelist

      const { data, error } = await supabase.from(tableName).select('*');
      if (!error && data) {
        result[table] = data;
      }
    }

    return NextResponse.json(
      { success: true, data: result },
      {
        headers: {
          // Cache for 30 seconds on CDN, 60 seconds stale-while-revalidate
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
