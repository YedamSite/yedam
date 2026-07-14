import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const TABLES = [
  'cheotnun_categories',
  'cheotnun_brands',
  'cheotnun_products',
  'cheotnun_blog_posts',
  'cheotnun_site_content',
  'cheotnun_cms_blocks',
  'cheotnun_routines',
  'cheotnun_system_settings',
  'cheotnun_newsletter_subscribers',
  'cheotnun_users',
  'cheotnun_orders',
];

export async function GET() {
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Supabase environment variables not configured' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const results: Record<string, any> = {};
  let hasError = false;

  for (const table of TABLES) {
    const { error } = await supabase.from(table).select('id').limit(1);
    results[table] = error ? error.message : 'ok';
    if (error && error.code !== 'PGRST116') hasError = true;
  }

  return NextResponse.json({
    status: hasError ? 'incomplete' : 'ready',
    tables: results,
    message: hasError
      ? 'Algumas tabelas não existem. Execute o SQL de migração no Supabase Dashboard.'
      : 'Todas as tabelas estão prontas!',
  });
}
