'use server';

import { db } from '@/lib/db';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

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
}) {
  try {
    const orders = db.get('orders');
    const products = db.get('products');
    const orderTracking = db.get('order_tracking');
    const logs = db.get('communication_logs');

    const subtotal = data.items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    const shipping = 15.00;
    const total = subtotal + shipping;

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

    // Create Order Record
    const newOrder = {
      id: orderId,
      customer_id: data.customerId,
      status: 'aguardando_confirmacao',
      items: data.items,
      subtotal,
      shipping_amount: shipping,
      discount_amount: 0.00,
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
    syncOrderWithSupabase('orders', orders);

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
    const recipientEmail = userRecord ? userRecord.email : 'cliente@example.com';
    const recipientName = userRecord ? userRecord.name : 'Cliente';

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
    syncOrderWithSupabase('order_tracking', db.get('order_tracking'));

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
    syncOrderWithSupabase('communication_logs', db.get('communication_logs'));

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
