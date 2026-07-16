import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').split(/[\r\n]+/)[0];

export async function POST(req: NextRequest) {
  try {
    const { orderId, customerEmail, customerName, totalAmount, items } = await req.json();

    if (!orderId || !totalAmount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

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
