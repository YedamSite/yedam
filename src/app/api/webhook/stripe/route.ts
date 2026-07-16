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
              stripe_session_id: session.id,
              updated_at: new Date().toISOString(),
            })
            .eq('id', orderId);
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

  return NextResponse.json({ received: true });
}
