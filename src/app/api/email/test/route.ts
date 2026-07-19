import { NextRequest, NextResponse } from 'next/server';
import { testEmailConfig } from '@/lib/emailSender';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const to = searchParams.get('to') || process.env.ADMIN_NOTIFICATION_EMAIL || 'sac@cheotnun.com';

  try {
    const result = await testEmailConfig(to);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${to}`,
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        hint: 'Check Vercel env vars. SMTP_FROM must be an email owned by the SMTP_USER (e.g. SMTP_FROM=sac@cheotnun.com). Hostinger: SMTP_HOST=smtp.hostinger.com, SMTP_PORT=465, SMTP_USER=sac@cheotnun.com.',
      }, { status: 500 });
    }
  } catch (e: any) {
    return NextResponse.json({
      success: false,
      error: e.message,
    }, { status: 500 });
  }
}
