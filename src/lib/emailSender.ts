import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').split(/[\r\n]+/)[0];

async function createTransporter() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || '587');
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    const t = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
      tls: { rejectUnauthorized: false },
    });
    await t.verify();
    return t;
  }

  // Fallback: try loading from DB settings
  if (supabaseUrl && serviceRoleKey) {
    try {
      const supabase = createClient(supabaseUrl, serviceRoleKey);
      const { data } = await supabase
        .from('cheotnun_system_settings')
        .select('value')
        .eq('key', 'smtp')
        .single();
      if (data?.value?.server && data?.value?.user) {
        const dbPort = data.value.port || 587;
        const t = nodemailer.createTransport({
          host: data.value.server,
          port: dbPort,
          secure: dbPort === 465,
          auth: { user: data.value.user, pass: data.value.pass || smtpPass },
          tls: { rejectUnauthorized: false },
        });
        await t.verify();
        return t;
      }
    } catch { /* ignore */ }
  }

  return null;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail(options: SendEmailOptions) {
  let t: nodemailer.Transporter | null = null;

  try {
    t = await createTransporter();
  } catch (err: any) {
    console.error('[emailSender] Failed to create transporter:', err.message);
    return { success: false, error: `SMTP connection failed: ${err.message}` };
  }

  if (!t) {
    console.warn('[emailSender] SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS env vars.');
    return { success: false, error: 'SMTP not configured — missing SMTP_HOST, SMTP_USER, SMTP_PASS' };
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@cheotnun.com';
  const fromName = process.env.SMTP_FROM_NAME || 'Cheotnun K-Beauty';

  try {
    const info = await t.sendMail({
      from: `"${fromName}" <${from}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
    });
    console.log(`[emailSender] Email sent to ${options.to}: ${options.subject} (messageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error('[emailSender] Failed to send email:', err);
    return { success: false, error: err.message };
  }
}

export async function testEmailConfig(to: string) {
  const result = await sendEmail({
    to,
    subject: '🧪 Teste de configuração SMTP — Cheotnun',
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="margin:0;padding:20px;font-family:Arial,sans-serif;">
        <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
          <h1 style="color:#08152F;font-size:18px;margin:0 0 16px;">✅ SMTP OK</h1>
          <p style="color:#555;font-size:13px;line-height:1.6;">Esta é uma mensagem de teste para confirmar que a configuração SMTP do Cheotnun está funcionando corretamente.</p>
          <p style="color:#555;font-size:13px;line-height:1.6;">Se você recebeu este e-mail, o envio de notificações do chat está operacional.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
          <p style="color:#999;font-size:11px;margin:0;">CHEOTNUN K-BEAUTY</p>
        </div>
      </body>
      </html>`,
  });
  return result;
}

export interface ChatMessageInfo {
  content: string;
  created_at: string;
  sender_name?: string;
  sender_email?: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export function buildOrderConfirmationHtml(opts: {
  orderId: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  shippingAddress?: { country?: string; city?: string };
  currency?: string;
}) {
  const { orderId, customerName, items, subtotal, shippingAmount, discountAmount, totalAmount, currency = 'US$' } = opts;
  const adminUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cheotnun.com'}/dashboard/cliente`;
  const orderShort = orderId.substring(0, 8).toUpperCase();

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding:8px 0;color:#333;font-size:13px;border-bottom:1px solid #f0f0f0;">${item.name}</td>
      <td style="padding:8px 0;color:#555;font-size:13px;text-align:center;border-bottom:1px solid #f0f0f0;">x${item.quantity}</td>
      <td style="padding:8px 0;color:#333;font-size:13px;text-align:right;border-bottom:1px solid #f0f0f0;font-weight:bold;">${currency} ${(item.price * item.quantity).toFixed(2)}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <tr><td style="background:#08152F;padding:32px 40px;text-align:center;">
          <h1 style="color:#C9C9C9;font-size:22px;margin:0;letter-spacing:2px;text-transform:uppercase;">✨ CHEOTNUN K-BEAUTY</h1>
          <p style="color:#fff;font-size:13px;margin:8px 0 0;opacity:0.8;">Confirmación de Pedido</p>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <p style="color:#333;font-size:15px;margin:0 0 16px;">Hola <strong>${customerName}</strong>,</p>
          <p style="color:#555;font-size:13px;line-height:1.6;">¡Gracias por tu compra! Tu pedido ha sido recibido y el pago confirmado. Aquí está el resumen:</p>
          <div style="background:#f9f9f9;border-left:4px solid #C9C9C9;padding:12px 20px;margin:20px 0;border-radius:8px;">
            <p style="margin:0;font-size:13px;color:#333;"><strong>Número de Pedido:</strong> #${orderShort}</p>
          </div>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
            <thead>
              <tr>
                <th style="text-align:left;font-size:11px;color:#999;text-transform:uppercase;padding-bottom:8px;border-bottom:2px solid #eee;">Producto</th>
                <th style="text-align:center;font-size:11px;color:#999;text-transform:uppercase;padding-bottom:8px;border-bottom:2px solid #eee;">Cant.</th>
                <th style="text-align:right;font-size:11px;color:#999;text-transform:uppercase;padding-bottom:8px;border-bottom:2px solid #eee;">Total</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
            <tr><td style="font-size:13px;color:#555;padding:4px 0;">Subtotal</td><td style="font-size:13px;color:#333;text-align:right;padding:4px 0;">${currency} ${subtotal.toFixed(2)}</td></tr>
            <tr><td style="font-size:13px;color:#555;padding:4px 0;">Envío</td><td style="font-size:13px;color:#333;text-align:right;padding:4px 0;">${currency} ${shippingAmount.toFixed(2)}</td></tr>
            ${discountAmount > 0 ? `<tr><td style="font-size:13px;color:#16a34a;padding:4px 0;">Descuento</td><td style="font-size:13px;color:#16a34a;text-align:right;padding:4px 0;">- ${currency} ${discountAmount.toFixed(2)}</td></tr>` : ''}
            <tr><td style="font-size:15px;font-weight:bold;color:#08152F;padding:12px 0 4px;border-top:2px solid #eee;">TOTAL</td><td style="font-size:15px;font-weight:bold;color:#08152F;text-align:right;padding:12px 0 4px;border-top:2px solid #eee;">${currency} ${totalAmount.toFixed(2)}</td></tr>
          </table>
          <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:16px 20px;margin:24px 0;">
            <p style="margin:0;font-size:12px;color:#664d03;line-height:1.6;"><strong>⏱ Plazo de Validación (48-72h):</strong> Como operamos con envíos directos desde Corea del Sur, tu pedido está en fase de validación de disponibilidad y documentación. Recibirás una actualización cuando el pedido sea confirmado por nuestro equipo.</p>
          </div>
          <table cellpadding="0" cellspacing="0" style="margin-top:24px;">
            <tr><td align="center">
              <a href="${adminUrl}" style="display:inline-block;background:#08152F;color:#C9C9C9;text-decoration:none;font-size:13px;font-weight:bold;padding:14px 32px;border-radius:40px;letter-spacing:1px;text-transform:uppercase;">Ver mis pedidos</a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background:#f9f9f9;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
          <p style="color:#999;font-size:11px;margin:0;">CHEOTNUN K-BEAUTY — Maeum global agency Ltda</p>
          <p style="color:#bbb;font-size:10px;margin:4px 0 0;">sac@cheotnun.com | +82 01024836078</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function buildAdminNewOrderHtml(opts: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  shippingAmount: number;
  totalAmount: number;
  shippingAddress?: any;
  currency?: string;
}) {
  const { orderId, customerName, customerEmail, items, subtotal, shippingAmount, totalAmount, shippingAddress, currency = 'US$' } = opts;
  const adminUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cheotnun.com'}/dashboard/admin`;
  const orderShort = orderId.substring(0, 8).toUpperCase();

  const itemsHtml = items.map(item => `<li style="font-size:13px;color:#333;padding:4px 0;">${item.name} x${item.quantity} — ${currency} ${(item.price * item.quantity).toFixed(2)}</li>`).join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <tr><td style="background:#08152F;padding:28px 40px;text-align:center;">
          <h1 style="color:#C9C9C9;font-size:18px;margin:0;letter-spacing:2px;text-transform:uppercase;">🛒 NOVO PEDIDO RECEBIDO</h1>
          <p style="color:#fff;font-size:12px;margin:8px 0 0;opacity:0.8;">Painel Administrativo — Cheotnun K-Beauty</p>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <p style="font-size:14px;color:#333;margin:0 0 20px;">Um novo pedido foi realizado e o pagamento confirmado:</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border-radius:8px;padding:16px;margin-bottom:20px;">
            <tr><td style="font-size:13px;color:#555;padding:4px 0;"><strong>Pedido #:</strong> ${orderShort}</td></tr>
            <tr><td style="font-size:13px;color:#555;padding:4px 0;"><strong>Cliente:</strong> ${customerName}</td></tr>
            <tr><td style="font-size:13px;color:#555;padding:4px 0;"><strong>E-mail:</strong> ${customerEmail}</td></tr>
            ${shippingAddress ? `<tr><td style="font-size:13px;color:#555;padding:4px 0;"><strong>Destino:</strong> ${shippingAddress.city || ''}, ${shippingAddress.country || ''}</td></tr>` : ''}
          </table>
          <p style="font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Itens do Pedido:</p>
          <ul style="padding-left:20px;margin:0 0 20px;">${itemsHtml}</ul>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-top:2px solid #eee;padding-top:12px;margin-top:4px;">
            <tr><td style="font-size:13px;color:#555;">Subtotal</td><td style="text-align:right;font-size:13px;color:#333;">${currency} ${subtotal.toFixed(2)}</td></tr>
            <tr><td style="font-size:13px;color:#555;">Frete</td><td style="text-align:right;font-size:13px;color:#333;">${currency} ${shippingAmount.toFixed(2)}</td></tr>
            <tr><td style="font-size:15px;font-weight:bold;color:#08152F;padding-top:8px;">TOTAL</td><td style="text-align:right;font-size:15px;font-weight:bold;color:#08152F;padding-top:8px;">${currency} ${totalAmount.toFixed(2)}</td></tr>
          </table>
          <table cellpadding="0" cellspacing="0" style="margin-top:28px;">
            <tr><td>
              <a href="${adminUrl}" style="display:inline-block;background:#08152F;color:#C9C9C9;text-decoration:none;font-size:13px;font-weight:bold;padding:14px 32px;border-radius:40px;letter-spacing:1px;text-transform:uppercase;">Acessar Painel Admin</a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background:#f9f9f9;padding:16px 40px;text-align:center;border-top:1px solid #eee;">
          <p style="color:#999;font-size:11px;margin:0;">Este e-mail foi enviado automaticamente pelo sistema Cheotnun.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function buildChatNotificationHtml(sessionId: string, messages: ChatMessageInfo[]) {
  const lastMsg = messages[messages.length - 1];
  const preview = lastMsg?.content?.substring(0, 200) || '(sem mensagem)';
  const clientName = messages.find(m => m.sender_name)?.sender_name || '';
  const clientEmail = messages.find(m => m.sender_email)?.sender_email || '';
  const adminUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cheotnun.com'}/dashboard/admin`;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#08152F;padding:32px 40px;text-align:center;">
              <h1 style="color:#C9C9C9;font-size:20px;margin:0;letter-spacing:2px;text-transform:uppercase;">💬 CHEOTNUN</h1>
              <p style="color:#ffffff;font-size:13px;margin:8px 0 0;opacity:0.8;">Nova mensagem do chat</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <p style="color:#333;font-size:14px;line-height:1.6;">Um cliente enviou uma nova mensagem no chat:</p>
              ${clientName ? `<p style="color:#333;font-size:13px;line-height:1.6;"><strong>Cliente:</strong> ${clientName}</p>` : ''}
              ${clientEmail ? `<p style="color:#333;font-size:13px;line-height:1.6;"><strong>E-mail:</strong> ${clientEmail}</p>` : ''}
              <div style="background:#f9f9f9;border-left:4px solid #C9C9C9;padding:16px 20px;margin:16px 0;border-radius:8px;">
                <p style="color:#555;font-size:13px;line-height:1.5;margin:0;font-style:italic;">"${preview}"</p>
                <p style="color:#999;font-size:11px;margin:8px 0 0;">${new Date(lastMsg?.created_at || Date.now()).toLocaleString('pt-BR')}</p>
              </div>
              <p style="color:#333;font-size:13px;line-height:1.6;">Sessão: <code style="background:#f0f0f0;padding:2px 6px;border-radius:4px;font-size:12px;">${sessionId}</code></p>
              <table cellpadding="0" cellspacing="0" style="margin-top:24px;">
                <tr>
                  <td align="center">
                    <a href="${adminUrl}" style="display:inline-block;background:#08152F;color:#C9C9C9;text-decoration:none;font-size:13px;font-weight:bold;padding:14px 32px;border-radius:40px;letter-spacing:1px;text-transform:uppercase;">Responder no Painel</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#f9f9f9;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
              <p style="color:#999;font-size:11px;margin:0;">CHEOTNUN K-BEAUTY — Atendimento ao Cliente</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
