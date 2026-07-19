import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, buildChatNotificationHtml } from '@/lib/emailSender';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').split(/[\r\n]+/)[0];
const NOTIFICATION_COOLDOWN_MS = 5 * 60 * 1000;

function getClient() {
  return createClient(supabaseUrl, serviceRoleKey);
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
    const { sessionId, sender, content, senderName, senderEmail, userId } = body;

    if (!sessionId || !sender || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newMsg: Record<string, any> = {
      id: crypto.randomUUID(),
      order_id: sessionId,
      type: 'chat',
      sender,
      content,
      created_at: new Date().toISOString(),
    };

    if (senderName) newMsg.sender_name = senderName;
    if (senderEmail) newMsg.sender_email = senderEmail;
    if (userId) newMsg.user_id = userId;

    const supabase = getClient();
    const { error } = await supabase.from('cheotnun_communication_logs').insert(newMsg);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If client sent the message, send email notification to admin
    if (sender === 'client') {
      // Check cooldown: only notify if last client message was > 5 min ago
      const fiveMinAgo = new Date(Date.now() - NOTIFICATION_COOLDOWN_MS).toISOString();

      const { data: recentMsgs } = await supabase
        .from('cheotnun_communication_logs')
        .select('id')
        .eq('order_id', sessionId)
        .eq('type', 'chat')
        .eq('sender', 'client')
        .gte('created_at', fiveMinAgo)
        .order('created_at', { ascending: false })
        .limit(2);

      // Only notify if this is the first client message in the cooldown window
      const shouldNotify = !recentMsgs || recentMsgs.length <= 1;

      if (shouldNotify) {
        const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'sac@cheotnun.com';

        // Get recent messages for context (last 3)
        const { data: contextMsgs } = await supabase
          .from('cheotnun_communication_logs')
          .select('content, created_at, sender_name, sender_email')
          .eq('order_id', sessionId)
          .eq('type', 'chat')
          .order('created_at', { ascending: false })
          .limit(3);

        const orderedMsgs = (contextMsgs || []).reverse();

        const clientName = orderedMsgs.find(m => (m as any).sender_name)?.sender_name || '';
        const emailSubject = clientName
          ? `💬 Nova mensagem de ${clientName} — ${sessionId.substring(0, 8)}...`
          : `💬 Nova mensagem no chat — ${sessionId.substring(0, 8)}...`;

        sendEmail({
          to: adminEmail,
          subject: emailSubject,
          html: buildChatNotificationHtml(sessionId, orderedMsgs),
          replyTo: adminEmail,
        }).then(result => {
          if (!result.success) {
            console.error('[chat] Failed to send notification email:', result.error);
          }
        });
      }
    }

    return NextResponse.json({ success: true, message: newMsg });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
