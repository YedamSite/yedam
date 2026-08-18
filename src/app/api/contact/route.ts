import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/emailSender';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: 'Campos obligatorios faltantes' }, { status: 400 });
    }

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'sac@cheotnun.com';
    const emailSubject = `[Contacto Cheotnun] ${subject || 'Nuevo Mensaje'}`;
    const emailHtml = `
      <div style="font-family: sans-serif; color: #1c2838; max-w-[600px]; padding: 20px;">
        <h2 style="color: #1c2838; border-bottom: 2px solid #EAE4DC; padding-bottom: 10px;">Nuevo mensaje de contacto</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>E-mail:</strong> ${email}</p>
        <p><strong>Asunto:</strong> ${subject || 'No especificado'}</p>
        <div style="background-color: #FDF9F4; padding: 15px; border-radius: 8px; margin-top: 20px; white-space: pre-wrap;">
          ${message}
        </div>
      </div>
    `;

    const emailResult = await sendEmail({
      to: adminEmail,
      subject: emailSubject,
      html: emailHtml,
      replyTo: email,
    });

    if (!emailResult.success) {
      console.error('[contact API] Failed to send email:', emailResult.error);
      return NextResponse.json({ success: false, error: 'No se pudo enviar el correo' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[contact API] Exception:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
