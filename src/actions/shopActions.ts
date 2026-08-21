'use server';

import { db } from '@/lib/db';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, buildOrderConfirmationHtml, buildAdminNewOrderHtml } from '@/lib/emailSender';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').split(/[\r\n]+/)[0];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function syncOrderWithSupabase(table: string, records: any[]) {
  if (!supabaseUrl || !supabaseServiceKey) return;
  try {
    const client = createClient(supabaseUrl, supabaseServiceKey);
    const tableName = ({
      orders: 'cheotnun_orders',
      order_tracking: 'cheotnun_order_tracking',
      communication_logs: 'cheotnun_communication_logs',
    } as Record<string, string>)[table];
    if (!tableName) return;
    // Filtrar apenas registros com IDs UUID válidos (excluir seed data)
    const valid = records.filter((r: any) => r.id && UUID_RE.test(r.id));
    if (valid.length === 0) return;
    const tb = client.from(tableName) as any;
    const { error } = await tb.upsert(valid, { onConflict: 'id', ignoreDuplicates: false });
    if (error) console.error(`syncOrderWithSupabase(${table}):`, error);
  } catch (e: any) { console.error(`syncOrderWithSupabase(${table}) exception:`, e?.message); }
}

export async function submitOrderAction(data: {
  customerId: string;
  items: { product_id: string; quantity: number; price: number; name: string }[];
  shippingAddress: any;
  billingAddress: any;
  documentType: 'nif' | 'nie' | 'rut' | 'ci';
  documentNumber: string;
  gateway: string;
  shippingAmount: number;
  discountAmount: number;
  locale?: string;
}) {
  try {
    const orders = db.get('orders');
    const products = db.get('products');
    const orderTracking = db.get('order_tracking');
    const logs = db.get('communication_logs');

    let subtotal = 0;
    // Calculate subtotal securely using prices from the database
    data.items.forEach((item: any) => {
      const product = products.find((p: any) => p.id === item.product_id);
      if (product) {
        // Calculate the actual price based on the currency/locale
        const realPrice = data.locale === 'pt' ? (product.price_brl || product.price * 5) : product.price;
        // Also update the item price in the array so it reflects the real price in the order record
        item.price = realPrice;
        subtotal += (realPrice * item.quantity);
      }
    });

    const shipping = data.shippingAmount || 0;
    const discount = data.discountAmount || 0;
    const total = Math.max(0, subtotal + shipping - discount);

    const orderId = crypto.randomUUID();

    // Verify and decrement stock
    for (const item of data.items) {
      const pIdx = products.findIndex((p: any) => p.id === item.product_id);
      if (pIdx !== -1) {
        if (products[pIdx].stock < item.quantity) {
          return { success: false, error: `Estoque insuficiente para o produto: ${item.name}` };
        }
        products[pIdx].stock -= item.quantity;
      }
    }
    db.save('products', products);

    // Create Order Record with initial pendente_pagamento status (until Stripe payment is completed)
    const newOrder = {
      id: orderId,
      customer_id: data.customerId,
      status: 'pendente_pagamento',
      items: data.items,
      subtotal,
      shipping_amount: shipping,
      discount_amount: discount,
      total_amount: total,
      gateway: data.gateway,
      shipping_address: data.shippingAddress,
      billing_address: data.billingAddress,
      document_type: data.documentType,
      document_number: data.documentNumber,
      carrier: null,
      tracking_code: null,
      commercial_invoice_url: `/invoices/cheotnun-inv-${orderId.substring(0, 8)}.pdf`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    orders.push(newOrder);
    db.save('orders', orders);

    // Sync order to Supabase immediately
    await syncOrderWithSupabase('orders', orders);

    // Save dynamic address to address list if it does not already exist
    const addresses = db.get('addresses') || [];
    const addrExists = addresses.some((a: any) => a.user_id === data.customerId && a.street === data.shippingAddress.street);
    if (!addrExists) {
      addresses.push({
        id: crypto.randomUUID(),
        user_id: data.customerId,
        address_type: 'shipping',
        first_name: data.shippingAddress.first_name,
        last_name: data.shippingAddress.last_name,
        street: data.shippingAddress.street,
        number: data.shippingAddress.number || 'S/N',
        complement: data.shippingAddress.complement || '',
        city: data.shippingAddress.city,
        state: data.shippingAddress.state || data.shippingAddress.country,
        postal_code: data.shippingAddress.postal_code,
        country: data.shippingAddress.country,
        phone: data.shippingAddress.phone,
        document_type: data.documentType,
        document_number: data.documentNumber
      });
      db.save('addresses', addresses);
    }

    // Resolve dynamic user name and email for logs
    const users = db.get('users') || [];
    const userRecord = users.find((u: any) => u.id === data.customerId);
    const recipientEmail = userRecord?.email || data.shippingAddress?.email || 'cliente@example.com';
    const recipientName = userRecord?.name || data.shippingAddress?.first_name || 'Cliente';

    // Create Order tracking log
    orderTracking.push({
      id: crypto.randomUUID(),
      order_id: orderId,
      status: 'aguardando_confirmacao',
      tracking_code: null,
      carrier: null,
      notes: 'Pedido recebido com sucesso. Pagamento confirmado. Aguardando confirmação da loja (prazo de até 48 horas úteis para preparação do envio).',
      updated_at: new Date().toISOString()
    });
    db.save('order_tracking', orderTracking);
    await syncOrderWithSupabase('order_tracking', db.get('order_tracking'));

    // Create transactional communication email log (Pedido Recebido)
    logs.push({
      id: crypto.randomUUID(),
      order_id: orderId,
      type: 'email',
      status: 'sent',
      recipient: recipientEmail,
      subject: 'Confirmación de Pedido - Cheotnun K-Beauty',
      content: `Hola ${recipientName}, tu pedido con ID ${orderId.substring(0, 8)} ha sido recibido con éxito. El pago ha sido confirmado y tu pedido está en "Aguardando Confirmación de la Tienda". Recibirás una actualización cuando tu pedido esté siendo preparado para envío. El plazo máximo es de 48 horas (72 horas en feriados coreanos).`,
      created_at: new Date().toISOString()
    });
    db.save('communication_logs', logs);
    await syncOrderWithSupabase('communication_logs', db.get('communication_logs'));

    // === REAL EMAIL SENDING ===
    const currency = data.locale === 'pt' ? 'R$' : 'US$';

    // 1. Send confirmation email to customer
    const customerHtml = buildOrderConfirmationHtml({
      orderId,
      customerName: recipientName,
      items: data.items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
      subtotal,
      shippingAmount: shipping,
      discountAmount: discount,
      totalAmount: total,
      shippingAddress: { country: data.shippingAddress?.country, city: data.shippingAddress?.city },
      currency,
    });
    await sendEmail({
      to: recipientEmail,
      subject: `✨ Pedido #${orderId.substring(0, 8).toUpperCase()} recibido — Cheotnun K-Beauty`,
      html: customerHtml,
    });

    // 2. Send new order notification to admin
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'sac@cheotnun.com';
    const adminHtml = buildAdminNewOrderHtml({
      orderId,
      customerName: recipientName,
      customerEmail: recipientEmail,
      items: data.items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
      subtotal,
      shippingAmount: shipping,
      totalAmount: total,
      shippingAddress: data.shippingAddress,
      currency,
    });
    await sendEmail({
      to: adminEmail,
      subject: `🛒 Novo Pedido #${orderId.substring(0, 8).toUpperCase()} — ${recipientName}`,
      html: adminHtml,
    });

    return { success: true, order: newOrder };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}


export async function toggleFavoriteAction(userId: string, productId: string) {
  try {
    const favorites = db.get('favorites');
    const idx = favorites.findIndex((f: any) => f.user_id === userId && f.product_id === productId);

    if (idx !== -1) {
      favorites.splice(idx, 1);
      db.save('favorites', favorites);
      return { success: true, isFavorite: false };
    } else {
      favorites.push({
        id: crypto.randomUUID(),
        user_id: userId,
        product_id: productId,
        created_at: new Date().toISOString()
      });
      db.save('favorites', favorites);
      return { success: true, isFavorite: true };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateProductStockAction(productId: string, stock: number) {
  try {
    const products = db.get('products');
    const idx = products.findIndex((p: any) => p.id === productId);
    if (idx !== -1) {
      products[idx].stock = stock;
      products[idx].updated_at = new Date().toISOString();
      db.save('products', products);
      return { success: true, product: products[idx] };
    }
    return { success: false, error: 'Product not found' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function serverSupabaseUpsert(table: string, records: any[]) {
  if (!supabaseUrl || !supabaseServiceKey) return { success: false };
  try {
    const client = createClient(supabaseUrl, supabaseServiceKey);
    const tableName = ({
      orders: 'cheotnun_orders',
      order_tracking: 'cheotnun_order_tracking',
      communication_logs: 'cheotnun_communication_logs',
    } as Record<string, string>)[table];
    if (!tableName) return { success: false };
    const valid = records.filter((r: any) => r.id && UUID_RE.test(r.id));
    if (valid.length === 0) return { success: true };
    const { error } = await client.from(tableName).upsert(valid, { onConflict: 'id', ignoreDuplicates: false });
    if (error) console.error(`serverSupabaseUpsert(${table}):`, error);
    return { success: !error };
  } catch (e: any) {
    console.error(`serverSupabaseUpsert(${table}) exception:`, e?.message);
    return { success: false };
  }
}

export async function deleteOrderFromSupabase(orderId: string) {
  if (!supabaseUrl || !supabaseServiceKey) return { success: false, error: 'Supabase not configured' };
  try {
    const client = createClient(supabaseUrl, supabaseServiceKey);
    // orders: delete by id; tracking & logs: delete by order_id
    const { error: err1 } = await client.from('cheotnun_orders').delete().eq('id', orderId);
    if (err1) { console.error('deleteOrder orders:', err1); return { success: false, error: err1.message }; }
    const { error: err2 } = await client.from('cheotnun_order_tracking').delete().eq('order_id', orderId);
    if (err2) console.error('deleteOrder tracking:', err2);
    const { error: err3 } = await client.from('cheotnun_communication_logs').delete().eq('order_id', orderId);
    if (err3) console.error('deleteOrder logs:', err3);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Unknown error' };
  }
}

export async function fetchCustomerOrdersAction(customerId: string) {
  if (!supabaseUrl || !supabaseServiceKey) return { success: false, data: { orders: [], subscriptions: [] } };
  try {
    const client = createClient(supabaseUrl, supabaseServiceKey);
    const { data: orders } = await client.from('cheotnun_orders').select('*').eq('customer_id', customerId);
    const { data: subscriptions } = await client.from('cheotnun_subscriptions').select('*').eq('customer_id', customerId);
    
    return { 
      success: true, 
      data: {
        orders: orders || [],
        subscriptions: subscriptions || []
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message, data: { orders: [], subscriptions: [] } };
  }
}

export async function cancelOrderAction(orderId: string) {
  try {
    const orders = db.get('orders');
    const products = db.get('products');
    
    const oIdx = orders.findIndex((o: any) => o.id === orderId);
    if (oIdx === -1) return { success: false, error: 'Order not found' };
    
    const order = orders[oIdx];
    if (order.status === 'cancelado') return { success: true, message: 'Already cancelled' };

    // Return stock
    for (const item of order.items) {
      const pIdx = products.findIndex((p: any) => p.id === item.product_id);
      if (pIdx !== -1) {
        products[pIdx].stock += item.quantity;
      }
    }
    db.save('products', products);

    // Update order status
    orders[oIdx].status = 'cancelado';
    orders[oIdx].updated_at = new Date().toISOString();
    db.save('orders', orders);

    // Sync to Supabase
    await syncOrderWithSupabase('orders', orders);

    // Add tracking log
    const orderTracking = db.get('order_tracking') || [];
    orderTracking.push({
      id: crypto.randomUUID(),
      order_id: orderId,
      status: 'cancelado',
      tracking_code: null,
      carrier: null,
      notes: 'Pedido cancelado pelo cliente ou sessão de pagamento expirada. Estoque retornado.',
      updated_at: new Date().toISOString()
    });
    db.save('order_tracking', orderTracking);
    await syncOrderWithSupabase('order_tracking', db.get('order_tracking'));

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function confirmOrderPaymentAction(orderId: string) {
  try {
    const orders = db.get('orders');
    const oIdx = orders.findIndex((o: any) => o.id === orderId);
    if (oIdx !== -1) {
      orders[oIdx].status = 'aguardando_confirmacao';
      orders[oIdx].updated_at = new Date().toISOString();
      db.save('orders', orders);
      await syncOrderWithSupabase('orders', orders);

      // Send payment approved email to customer and admin
      try {
        const order = orders[oIdx];
        const users = db.get('users') || [];
        const user = users.find((u: any) => u.id === order.customer_id);
        const recipientEmail = user?.email || order.shipping_address?.email || '';
        const recipientName = user?.name || order.shipping_address?.first_name || 'Cliente';
        const orderShort = orderId.substring(0, 8).toUpperCase();

        if (recipientEmail) {
          const paymentApprovedHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:40px 20px;">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
<tr><td style="background:#08152F;padding:32px 40px;text-align:center;">
  <h1 style="color:#C9C9C9;font-size:22px;margin:0;letter-spacing:2px;">✅ PAGO CONFIRMADO</h1>
  <p style="color:#fff;font-size:13px;margin:8px 0 0;opacity:0.8;">Cheotnun K-Beauty</p>
</td></tr>
<tr><td style="padding:32px 40px;">
  <p style="color:#333;font-size:15px;margin:0 0 16px;">Hola <strong>${recipientName}</strong>,</p>
  <p style="color:#555;font-size:13px;line-height:1.6;">Tu pago ha sido confirmado con éxito. Tu pedido <strong>#${orderShort}</strong> está ahora en proceso de preparación. Recibirás otro e-mail cuando sea enviado con el código de seguimiento.</p>
  <div style="background:#f9f9f9;border-left:4px solid #22c55e;padding:12px 20px;margin:20px 0;border-radius:8px;">
    <p style="margin:0;font-size:13px;color:#333;"><strong>Status:</strong> Aguardando Confirmação da Loja (48h úteis)</p>
  </div>
  <p style="color:#555;font-size:12px;line-height:1.6;">Qualquer dúvida, entre em contato pelo e-mail <a href="mailto:sac@cheotnun.com" style="color:#08152F;">sac@cheotnun.com</a>.</p>
</td></tr>
<tr><td style="background:#f9f9f9;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
  <p style="color:#999;font-size:11px;margin:0;">CHEOTNUN K-BEAUTY — Maeum global agency Ltda</p>
</td></tr>
</table></td></tr></table>
</body></html>`;

          await sendEmail({
            to: recipientEmail,
            subject: `✅ Pago confirmado — Pedido #${orderShort} — Cheotnun K-Beauty`,
            html: paymentApprovedHtml,
          });
        }

        // Notify admin
        const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'sac@cheotnun.com';
        await sendEmail({
          to: adminEmail,
          subject: `💳 Pagamento Confirmado — Pedido #${orderShort} — ${recipientName}`,
          html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:Arial,sans-serif;padding:32px;background:#f4f4f4;">
<div style="max-width:500px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
<h2 style="color:#08152F;margin:0 0 16px;">💳 Pagamento Confirmado pelo Stripe</h2>
<p style="color:#555;font-size:13px;">Pedido: <strong>#${orderShort}</strong></p>
<p style="color:#555;font-size:13px;">Cliente: <strong>${recipientName}</strong> (${recipientEmail})</p>
<p style="color:#555;font-size:13px;">Status atualizado para: <strong>Aguardando Confirmação da Loja</strong></p>
<a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cheotnun.com'}/dashboard/admin" style="display:inline-block;margin-top:16px;background:#08152F;color:#C9C9C9;text-decoration:none;padding:12px 28px;border-radius:40px;font-size:13px;font-weight:bold;">Acessar Painel</a>
</div></body></html>`,
        });
      } catch (emailErr) {
        console.error('[confirmOrderPaymentAction] email send failed:', emailErr);
      }
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
