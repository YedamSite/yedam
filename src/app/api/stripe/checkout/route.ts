import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // === SUBSCRIPTION FLOW (Club Cheotnun) ===
    if (body.mode === 'subscription') {
      const { planName, planPrice, customerEmail, customerName, customerId } = body;
      if (!planName || !planPrice) {
        return NextResponse.json({ error: 'Missing plan info' }, { status: 400 });
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
            unit_amount: Math.round(planPrice * 100),
            recurring: { interval: 'month' },
          },
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: `${origin}/dashboard/cliente?tab=suscripciones&subscription=success&plan=${encodeURIComponent(planName)}&price=${planPrice}`,
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
    const { orderId, totalAmount, customerEmail, customerName, items } = body;
    if (!orderId || !totalAmount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Pedido #${orderId.substring(0, 8)} - Cheotnun K-Beauty`,
            description: items
              ? items.map((i: any) => `${i.name} x${i.quantity}`).join(', ')
              : 'Produtos Cheotnun K-Beauty',
          },
          unit_amount: Math.round(totalAmount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${origin}/tienda/carrinho?success=true&order_id=${orderId}`,
      cancel_url: `${origin}/tienda/carrinho?canceled=true`,
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
