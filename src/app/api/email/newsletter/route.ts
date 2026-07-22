import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/emailSender';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'sac@cheotnun.com';

    const emailSubject = 'Novo subscritor na Newsletter!';
    const emailHtml = `<!DOCTYPE html><html><body><h1>Novo Subscritor</h1><p>Email: ${email}</p></body></html>`;

    const emailResult = await sendEmail({
      to: adminEmail,
      subject: emailSubject,
      html: emailHtml,
    });

    if (!emailResult.success) {
      return NextResponse.json({ success: false, error: emailResult.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
