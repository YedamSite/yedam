import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/emailSender';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').split(/[\r\n]+/)[0];

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Invalid signature: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const type = session.metadata?.type;

    // Product purchase - update order with Stripe session ID
    if (type === 'product_purchase') {
      const orderId = session.metadata?.order_id;
      if (orderId && supabaseUrl && supabaseServiceKey) {
        try {
          const supabase = createClient(supabaseUrl, supabaseServiceKey);
          await supabase
            .from('cheotnun_orders')
            .update({
              status: 'aguardando_confirmacao',
              stripe_session_id: session.id,
              updated_at: new Date().toISOString(),
            })
            .eq('id', orderId);

          // Add a tracking log for payment confirmation
          await supabase.from('cheotnun_order_tracking').insert({
            id: crypto.randomUUID(),
            order_id: orderId,
            status: 'aguardando_confirmacao',
            notes: 'Pagamento via Stripe confirmado com sucesso. Pedido aguardando confirmação da loja.',
            updated_at: new Date().toISOString()
          });

          // Add an email log for payment confirmation
          await supabase.from('cheotnun_communication_logs').insert({
            id: crypto.randomUUID(),
            order_id: orderId,
            type: 'email',
            status: 'sent',
            recipient: session.customer_email || 'cliente@example.com',
            subject: 'Pago Confirmado - Cheotnun K-Beauty',
            content: `Hola, el pago de tu pedido #${orderId.substring(0, 8)} ha sido confirmado. En breve comenzaremos a preparar tu paquete.`,
            created_at: new Date().toISOString()
          });

          // Send real emails via SMTP
          const customerEmail = session.customer_email;
          const customerName = session.metadata?.customer_name || 'Cliente';
          const orderShort = orderId.substring(0, 8).toUpperCase();
          const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'sac@cheotnun.com';

          if (customerEmail) {
            await sendEmail({
              to: customerEmail,
              subject: `✅ Pago confirmado — Pedido #${orderShort} — Cheotnun K-Beauty`,
              html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;">
<tr><td style="background:#08152F;padding:32px 40px;text-align:center;">
  <h1 style="color:#C9C9C9;font-size:22px;margin:0;letter-spacing:2px;">✅ PAGO CONFIRMADO</h1>
  <p style="color:#fff;font-size:13px;margin:8px 0 0;">Cheotnun K-Beauty</p>
</td></tr>
<tr><td style="padding:32px 40px;">
  <p style="color:#333;font-size:15px;">Hola <strong>${customerName}</strong>,</p>
  <p style="color:#555;font-size:13px;line-height:1.6;">Tu pago para el pedido <strong>#${orderShort}</strong> fue procesado con éxito por Stripe. Tu pedido está en preparación y recibirás el código de seguimiento en breve.</p>
  <div style="background:#f9f9f9;border-left:4px solid #22c55e;padding:12px 20px;margin:20px 0;border-radius:8px;">
    <p style="margin:0;font-size:13px;color:#333;"><strong>Pedido #${orderShort}</strong> — Aguardando preparação</p>
  </div>
  <p style="color:#555;font-size:12px;">Dúvidas? Escreva para <a href="mailto:sac@cheotnun.com">sac@cheotnun.com</a></p>
</td></tr>
<tr><td style="background:#f9f9f9;padding:16px 40px;text-align:center;border-top:1px solid #eee;">
  <p style="color:#999;font-size:11px;margin:0;">CHEOTNUN K-BEAUTY — Maeum global agency Ltda | +82 01024836078</p>
</td></tr>
</table></td></tr></table></body></html>`,
            }).catch(e => console.error('[webhook] customer email failed:', e));
          }

          await sendEmail({
            to: adminEmail,
            subject: `💳 Stripe: Pagamento Confirmado — Pedido #${orderShort} — ${customerName}`,
            html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:Arial,sans-serif;padding:32px;background:#f4f4f4;">
<div style="max-width:500px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;">
<h2 style="color:#08152F;">💳 Pagamento Confirmado via Stripe</h2>
<p><strong>Pedido:</strong> #${orderShort}</p>
<p><strong>Cliente:</strong> ${customerName} (${customerEmail || 'N/A'})</p>
<p><strong>Stripe Session:</strong> ${session.id}</p>
<a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cheotnun.com'}/dashboard/admin" style="display:inline-block;margin-top:16px;background:#08152F;color:#C9C9C9;text-decoration:none;padding:12px 28px;border-radius:40px;font-size:13px;font-weight:bold;">Acessar Painel</a>
</div></body></html>`,
          }).catch(e => console.error('[webhook] admin email failed:', e));

        } catch (e) {
          console.error('Webhook: failed to update order:', e);
        }
      }
    }

    // Club subscription - save to Supabase
    if (type === 'club_subscription') {
      const planName = session.metadata?.plan_name || 'Premium Box';
      const customerId = session.metadata?.customer_id;
      const subscriptionId = session.subscription as string;
      if (customerId && supabaseUrl && supabaseServiceKey) {
        try {
          const supabase = createClient(supabaseUrl, supabaseServiceKey);
          const nextDate = new Date();
          nextDate.setMonth(nextDate.getMonth() + 1);
          await supabase.from('cheotnun_subscriptions').upsert({
            user_id: customerId,
            plan_name: planName,
            price: (session.amount_total || 2990) / 100,
            status: 'active',
            next_billing: nextDate.toISOString().split('T')[0],
            stripe_subscription_id: subscriptionId,
            history: JSON.stringify([{
              date: new Date().toISOString().split('T')[0],
              amount: (session.amount_total || 2990) / 100,
              status: 'paid'
            }]),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'stripe_subscription_id' });
        } catch (e) {
          console.error('Webhook: failed to save subscription:', e);
        }
      }
    }
  }

  if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
    const session = event.data.object;
    const type = session.metadata?.type;
    
    if (type === 'product_purchase') {
      const orderId = session.metadata?.order_id;
      if (orderId && supabaseUrl && supabaseServiceKey) {
        try {
          const supabase = createClient(supabaseUrl, supabaseServiceKey);
          
          // 1. Update order status to cancelado
          await supabase
            .from('cheotnun_orders')
            .update({
              status: 'cancelado',
              updated_at: new Date().toISOString(),
            })
            .eq('id', orderId);

          // 2. We can't safely return stock to db.ts from here because this runs serverless, 
          // but we log it. Supabase inventory logic would go here when fully migrated.
          await supabase.from('cheotnun_order_tracking').insert({
            id: crypto.randomUUID(),
            order_id: orderId,
            status: 'cancelado',
            notes: 'Sessão de pagamento do Stripe expirou ou falhou. Pedido cancelado.',
            updated_at: new Date().toISOString()
          });
        } catch (e) {
          console.error('Webhook: failed to handle expired session:', e);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
