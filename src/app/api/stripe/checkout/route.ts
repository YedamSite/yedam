import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // === SUBSCRIPTION FLOW (Club Cheotnun) ===
    if (body.mode === 'subscription') {
      const { planName, customerEmail, customerName, customerId } = body;
      
      const VALID_PLANS: Record<string, number> = {
        'Lover': 15.00,
        'Addict': 25.00,
        'Obsessed': 50.00
      };
      
      const realPrice = VALID_PLANS[planName];
      if (!planName || !realPrice) {
        return NextResponse.json({ error: 'Invalid or missing plan info' }, { status: 400 });
      }

      const session = await getStripe().checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: planName,
              description: `Assinatura mensal - ${planName}`,
            },
            unit_amount: Math.round(realPrice * 100),
            recurring: { interval: 'month' },
          },
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: `${origin}/dashboard/cliente?tab=suscripciones&subscription=success&plan=${encodeURIComponent(planName)}&price=${realPrice}`,
        cancel_url: `${origin}/dashboard/cliente?tab=suscripciones`,
        customer_email: customerEmail,
        metadata: {
          type: 'club_subscription',
          plan_name: planName,
          customer_id: customerId || '',
        },
      });

      return NextResponse.json({ url: session.url });
    }

    // === ONE-TIME PAYMENT FLOW (Product purchase) ===
    const { orderId, customerEmail, customerName, items, locale } = body;
    if (!orderId) {
      return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
    }
    
    // Fetch real order total from Supabase directly to prevent frontend tampering
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').split(/[\r\n]+/)[0];
    
    let realTotalAmount = 0;
    
    if (supabaseUrl && supabaseServiceKey) {
       const supabase = createClient(supabaseUrl, supabaseServiceKey);
       const { data: order } = await supabase.from('cheotnun_orders').select('total_amount').eq('id', orderId).single();
       if (!order) return NextResponse.json({ error: 'Order not found in DB' }, { status: 404 });
       realTotalAmount = order.total_amount;
    } else {
      // Fallback for local testing if Supabase is down
      const { db } = await import('@/lib/db');
      const order = db.get('orders').find((o: any) => o.id === orderId);
      if (!order) return NextResponse.json({ error: 'Order not found locally' }, { status: 404 });
      realTotalAmount = order.total_amount;
    }

    const currency = locale === 'pt' ? 'brl' : 'usd';

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency,
          product_data: {
            name: `Pedido #${orderId.substring(0, 8)} - Cheotnun K-Beauty`,
            description: items
              ? items.map((i: any) => `${i.name} x${i.quantity}`).join(', ')
              : 'Produtos Cheotnun K-Beauty',
          },
          unit_amount: Math.round(realTotalAmount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${origin}/tienda/carrinho?success=true&order_id=${orderId}`,
      cancel_url: `${origin}/tienda/carrinho?canceled=true&order_id=${orderId}`,
      customer_email: customerEmail,
      metadata: {
        type: 'product_purchase',
        order_id: orderId,
        customer_name: customerName || '',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
