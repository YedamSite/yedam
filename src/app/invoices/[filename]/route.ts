import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const match = filename.match(/yedam-inv-(.+)\.pdf/);
  if (!match) {
    return new NextResponse('Invalid Invoice Filename', { status: 400 });
  }

  const orderIdPrefix = match[1];

  const orders = db.get('orders') || [];
  const order = orders.find((o: any) => o.id.startsWith(orderIdPrefix) || o.id === orderIdPrefix);

  if (!order) {
    // Fallback search matching standard seed orders if dynamic list is empty
    return new NextResponse('Invoice not found', { status: 404 });
  }

  // Create jsPDF instance
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('COMMERCIAL INVOICE', 15, 20);

  doc.setFontSize(8);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Invoice Number: YEDAM-INV-${order.id.substring(0, 8).toUpperCase()}`, 15, 26);
  doc.text(`Date of Issue: ${new Date(order.created_at).toLocaleDateString('en-US')}`, 15, 30);

  // Divider
  doc.setDrawColor(200);
  doc.line(15, 35, 195, 35);

  // Exporter & Importer Info
  doc.setTextColor(0);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('EXPORTER (SELLER):', 15, 42);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  const company = db.get('system_settings')?.company_details || {
    name: 'Yedam K-Beauty S.L.',
    address: 'Calle Gran Vía 12, Madrid, España',
    phone: '+34 912 345 678',
    email: 'hola@yedambeauty.com'
  };
  doc.text(company.name || 'Yedam K-Beauty S.L.', 15, 47);
  doc.text(company.address || 'Calle Gran Vía 12, Madrid, España', 15, 51);
  doc.text(`Phone: ${company.phone || '+34 912 345 678'}`, 15, 55);
  doc.text(`Email: ${company.email || 'hola@yedambeauty.com'}`, 15, 59);

  // Importer info
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('IMPORTER (BUYER):', 110, 42);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  const addr = order.shipping_address;
  doc.text(`${addr.first_name} ${addr.last_name}`, 110, 47);
  doc.text(`${addr.street}, ${addr.number || 'S/N'}`, 110, 51);
  if (addr.complement) {
    doc.text(addr.complement, 110, 55);
  }
  doc.text(`${addr.city}, ${addr.state}`, 110, 59);
  doc.text(`${addr.country} - CP: ${addr.postal_code}`, 110, 63);
  doc.text(`Phone: ${addr.phone}`, 110, 67);
  doc.text(`Tax ID (${order.document_type.toUpperCase()}): ${order.document_number}`, 110, 71);

  // Divider
  doc.line(15, 77, 195, 77);

  // Products Table Header
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Description of Goods (English)', 15, 83);
  doc.text('HS Code', 95, 83);
  doc.text('Weight', 120, 83);
  doc.text('Qty', 145, 83);
  doc.text('Unit Price', 160, 83);
  doc.text('Total (USD)', 180, 83);

  doc.line(15, 86, 195, 86);

  // Products list
  doc.setFont('Helvetica', 'normal');
  let y = 92;
  const items = order.items || [];
  const allProds = db.get('products') || [];

  items.forEach((item: any) => {
    const prod = allProds.find((p: any) => p.id === item.product_id || p.name === item.name);
    const descEn = prod?.description_en || item.name || 'K-Beauty Cosmetic';
    const hsCode = prod?.hs_code || '3304.99.90';
    const weight = prod?.weight ? `${(prod.weight * item.quantity).toFixed(2)} kg` : '0.15 kg';

    doc.text(descEn.length > 45 ? descEn.substring(0, 42) + '...' : descEn, 15, y);
    doc.text(hsCode, 95, y);
    doc.text(weight, 120, y);
    doc.text(item.quantity.toString(), 145, y);
    doc.text(`$${item.price.toFixed(2)}`, 160, y);
    doc.text(`$${(item.price * item.quantity).toFixed(2)}`, 180, y);
    y += 6;
  });

  // Table bottom line
  doc.line(15, y - 2, 195, y - 2);

  // Totals block
  y += 4;
  doc.setFont('Helvetica', 'normal');
  doc.text('Subtotal:', 145, y);
  doc.text(`$${order.subtotal.toFixed(2)}`, 180, y);

  y += 5;
  doc.text('Shipping & Handling:', 145, y);
  doc.text(`$${order.shipping_amount.toFixed(2)}`, 180, y);

  if (order.discount_amount > 0) {
    y += 5;
    doc.text('Discount:', 145, y);
    doc.text(`-$${order.discount_amount.toFixed(2)}`, 180, y);
  }

  y += 6;
  doc.setFont('Helvetica', 'bold');
  doc.text('GRAND TOTAL (USD):', 145, y);
  doc.text(`$${order.total_amount.toFixed(2)}`, 180, y);

  // Terms and Signature
  y += 15;
  doc.setFontSize(7);
  doc.setTextColor(120);
  doc.setFont('Helvetica', 'normal');
  doc.text('Declaration: We declare that this commercial invoice shows the actual value of the goods described', 15, y);
  doc.text('and that all particulars are true and correct.', 15, y + 3.5);

  y += 15;
  doc.setTextColor(0);
  doc.setFont('Helvetica', 'bold');
  doc.text('Authorized Signature / Exporter stamp:', 145, y);
  doc.line(145, y + 8, 195, y + 8);

  const pdfArrayBuffer = doc.output('arraybuffer');

  return new NextResponse(Buffer.from(pdfArrayBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  });
}
