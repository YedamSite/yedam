import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').split(/[\r\n]+/)[0];
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET() {
  const result: any = {};

  result.envUrl = supabaseUrl ? 'ok' : 'missing';
  result.envServiceKey = supabaseServiceKey ? 'ok' : 'missing';
  result.envAnonKey = supabaseAnonKey ? 'ok' : 'missing';

  // Test service key
  if (supabaseUrl && supabaseServiceKey) {
    const c = createClient(supabaseUrl, supabaseServiceKey);
    const testUuid = crypto.randomUUID();
    const testOrder = {
      id: testUuid,
      customer_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      status: 'test_sync', items: [], subtotal: 0,
      shipping_amount: 0, discount_amount: 0, total_amount: 0,
      gateway: 'test', shipping_address: {}, billing_address: {},
      document_type: 'nif', document_number: '0',
      commercial_invoice_url: '/invoices/test.pdf',
      created_at: new Date().toISOString(), updated_at: new Date().toISOString()
    };
    const { error: insErr } = await c.from('cheotnun_orders').upsert(testOrder, { onConflict: 'id' });
    result.serviceInsert = insErr ? 'FAIL: ' + insErr.message : 'OK';

    // Read back
    const { data: readData } = await c.from('cheotnun_orders').select('id').eq('id', testUuid);
    result.serviceRead = readData?.length ? 'OK' : 'NOT FOUND';

    // Clean up
    await c.from('cheotnun_orders').delete().eq('id', testUuid);
  } else {
    result.serviceTest = 'skipped (missing env)';
  }

  // Test anon key
  if (supabaseUrl && supabaseAnonKey) {
    const c = createClient(supabaseUrl, supabaseAnonKey);
    const { data } = await c.from('cheotnun_orders').select('id').limit(1);
    result.anonSelect = data ? `${data.length} rows` : '0 rows (or error)';
  }

  return NextResponse.json(result);
}
