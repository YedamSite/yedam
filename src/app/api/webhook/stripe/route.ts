import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

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
              status: 'pagamento_aprovado',
              stripe_session_id: session.id,
              updated_at: new Date().toISOString(),
            })
            .eq('id', orderId);

          // Add a tracking log for payment confirmation
          await supabase.from('cheotnun_order_tracking').insert({
            id: crypto.randomUUID(),
            order_id: orderId,
            status: 'pagamento_aprovado',
            notes: 'Pagamento via Stripe confirmado com sucesso.',
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
