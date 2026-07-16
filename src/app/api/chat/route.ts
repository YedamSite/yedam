import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').split(/[\r\n]+/)[0];

function getClient() {
  return createClient(supabaseUrl, serviceRoleKey || supabaseKey);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');

  try {
    const supabase = getClient();
    let query = supabase
      .from('cheotnun_communication_logs')
      .select('*')
      .eq('type', 'chat')
      .order('created_at', { ascending: true });

    if (sessionId) {
      query = query.eq('order_id', sessionId);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ messages: data || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, sender, content } = body;

    if (!sessionId || !sender || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newMsg = {
      id: crypto.randomUUID(),
      order_id: sessionId,
      type: 'chat',
      sender,
      content,
      created_at: new Date().toISOString(),
    };

    const supabase = getClient();
    const { error } = await supabase.from('cheotnun_communication_logs').insert(newMsg);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: newMsg });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
