import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseAuth';

/**
 * API para envio de e-mails transacionais
 * POST /api/email/send
 * Body: { to, subject, html, type, metadata }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, html, type = 'custom', metadata = {} } = body;

    if (!to || !subject || !html) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    // Inserir registro na tabela de logs de e-mail
    const { error: insertError } = await supabase
      .from('cheotnun_email_logs')
      .insert({
        email: to,
        type,
        subject,
        status: 'sent',
        sent_at: new Date().toISOString(),
        metadata: {
          html,
          ...metadata
        }
      });

    if (insertError) {
      console.error('Error logging email:', insertError);
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      );
    }

    // TODO: Integrar com serviço de e-mail real (SendGrid, Resend, etc.)
    // Por enquanto, apenas logamos no banco de dados
    // Quando configurar o serviço de e-mail, adicione o envio aqui

    console.log('Email logged for:', to, 'Subject:', subject);
    
    return NextResponse.json({
      success: true,
      message: 'Email logged successfully. Ready to send when email service is configured.',
      emailId: crypto.randomUUID()
    });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/email/logs
 * Retorna logs de e-mails enviados
 */
export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type');

    let query = supabase
      .from('cheotnun_email_logs')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(limit);

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching email logs:', error);
      return NextResponse.json(
        { success: false, error: error.message, data: [] },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error('Error fetching email logs:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Unknown error', data: [] },
      { status: 500 }
    );
  }
}