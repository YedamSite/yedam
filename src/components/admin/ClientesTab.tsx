'use client';

import React, { useState, useMemo } from 'react';
import { Users, Search, Mail, Phone, MapPin, FileText, ShoppingBag, DollarSign, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/db';
import { useLanguage } from '@/context/LanguageContext';

export default function ClientesTab() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Aggregate all customers from users, addresses, and orders
  const customers = useMemo(() => {
    const allUsers = (db.get('users') as any[]) || [];
    const allOrders = (db.get('orders') as any[]) || [];
    const allAddresses = (db.get('addresses') as any[]) || [];

    const map = new Map<string, any>();

    // 1. Registered Users
    for (const u of allUsers) {
      const email = (u.email || '').toLowerCase().trim();
      if (!email) continue;

      const userAddrs = allAddresses.filter((a: any) => a.user_id === u.id);
      const mainAddr = userAddrs[0] || {};

      map.set(email, {
        id: u.id,
        name: u.name || `${mainAddr.first_name || ''} ${mainAddr.last_name || ''}`.trim() || u.email.split('@')[0],
        email: u.email,
        phone: u.phone || mainAddr.phone || '-',
        country: u.country || mainAddr.country || 'Brasil',
        city: mainAddr.city || '-',
        street: mainAddr.street || '-',
        postal_code: u.postal_code || mainAddr.postal_code || '-',
        document_type: u.document_type || mainAddr.document_type || 'cpf',
        document_number: u.document_number || mainAddr.document_number || '-',
        created_at: u.created_at || new Date().toISOString(),
        orders_count: 0,
        total_spent: 0,
        is_registered: true
      });
    }

    // 2. Orders (Include guest checkouts & update metrics)
    for (const o of allOrders) {
      if (o.status === 'pendente_pagamento') continue;

      const addr = o.shipping_address || {};
      const customerId = o.customer_id;
      const orderEmail = (o.email || addr.email || '').toLowerCase().trim();

      let targetKey = orderEmail;
      if (!targetKey && customerId) {
        const foundUser = allUsers.find((u: any) => u.id === customerId);
        if (foundUser) targetKey = (foundUser.email || '').toLowerCase().trim();
      }

      if (!targetKey) {
        targetKey = `guest-${o.id}`;
      }

      const existing = map.get(targetKey);
      const orderTotal = Number(o.total_amount || 0);

      if (existing) {
        existing.orders_count += 1;
        existing.total_spent += orderTotal;
        if (!existing.phone || existing.phone === '-') existing.phone = addr.phone || existing.phone;
        if (!existing.country || existing.country === '-') existing.country = addr.country || existing.country;
        if (!existing.city || existing.city === '-') existing.city = addr.city || existing.city;
        if (!existing.street || existing.street === '-') existing.street = addr.street || existing.street;
        if (!existing.document_number || existing.document_number === '-') {
          existing.document_type = o.document_type || existing.document_type;
          existing.document_number = o.document_number || existing.document_number;
        }
      } else {
        map.set(targetKey, {
          id: customerId || o.id,
          name: `${addr.first_name || ''} ${addr.last_name || ''}`.trim() || orderEmail || 'Cliente Guest',
          email: orderEmail || 'guest@cheotnun.com',
          phone: addr.phone || '-',
          country: addr.country || 'Brasil',
          city: addr.city || '-',
          street: addr.street || '-',
          postal_code: addr.postal_code || '-',
          document_type: o.document_type || 'cpf',
          document_number: o.document_number || '-',
          created_at: o.created_at || new Date().toISOString(),
          orders_count: 1,
          total_spent: orderTotal,
          is_registered: false
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, []);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers;
    const term = search.toLowerCase().trim();
    return customers.filter((c: any) =>
      (c.name || '').toLowerCase().includes(term) ||
      (c.email || '').toLowerCase().includes(term) ||
      (c.phone || '').toLowerCase().includes(term) ||
      (c.country || '').toLowerCase().includes(term) ||
      (c.city || '').toLowerCase().includes(term) ||
      (c.document_number || '').toLowerCase().includes(term)
    );
  }, [customers, search]);

  // Metrics
  const totalCustomers = customers.length;
  const activeBuyers = customers.filter(c => c.orders_count > 0).length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.total_spent, 0);
  const avgTicket = activeBuyers > 0 ? totalRevenue / activeBuyers : 0;

  const handleCopyData = (c: any) => {
    const text = `Nome: ${c.name}\nE-mail: ${c.email}\nTelefone: ${c.phone}\nPaís: ${c.country}\nEndereço: ${c.street}, ${c.city} (CP: ${c.postal_code})\nDocumento (${(c.document_type || '').toUpperCase()}): ${c.document_number}`;
    navigator.clipboard.writeText(text);
    setCopiedId(c.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[9px] font-bold text-accent uppercase tracking-widest">{t('CRM & Gestão Empresarial')}</span>
          <h2 className="font-heading text-2xl font-light text-white">{t('Base de Clientes')}</h2>
        </div>
        <div className="flex items-center gap-2 bg-secondary/40 border border-white/10 px-4 py-2 rounded-2xl text-xs text-white">
          <Users className="h-4 w-4 text-accent" />
          <span>{totalCustomers} {t('Clientes Registrados')}</span>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-white/5 rounded-2xl p-5 bg-secondary/30 flex items-center justify-between">
          <div>
            <p className="text-[9px] uppercase font-bold text-muted-foreground">{t('Total de Clientes')}</p>
            <p className="text-xl font-bold text-white font-mono mt-1">{totalCustomers}</p>
          </div>
          <span className="p-3 bg-accent/10 border border-accent/20 rounded-xl text-accent">
            <Users className="h-5 w-5" />
          </span>
        </div>

        <div className="border border-white/5 rounded-2xl p-5 bg-secondary/30 flex items-center justify-between">
          <div>
            <p className="text-[9px] uppercase font-bold text-muted-foreground">{t('Compradores Ativos')}</p>
            <p className="text-xl font-bold text-green-400 font-mono mt-1">{activeBuyers}</p>
          </div>
          <span className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400">
            <ShoppingBag className="h-5 w-5" />
          </span>
        </div>

        <div className="border border-white/5 rounded-2xl p-5 bg-secondary/30 flex items-center justify-between">
          <div>
            <p className="text-[9px] uppercase font-bold text-muted-foreground">{t('Receita Total de Clientes')}</p>
            <p className="text-xl font-bold text-accent font-mono mt-1">US$ {totalRevenue.toFixed(2)}</p>
          </div>
          <span className="p-3 bg-accent/10 border border-accent/20 rounded-xl text-accent">
            <DollarSign className="h-5 w-5" />
          </span>
        </div>

        <div className="border border-white/5 rounded-2xl p-5 bg-secondary/30 flex items-center justify-between">
          <div>
            <p className="text-[9px] uppercase font-bold text-muted-foreground">{t('Ticket Médio por Cliente')}</p>
            <p className="text-xl font-bold text-white font-mono mt-1">US$ {avgTicket.toFixed(2)}</p>
          </div>
          <span className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
            <FileText className="h-5 w-5" />
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card border border-white/5 rounded-2xl p-4 shadow-lg">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-white/40" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('Buscar cliente por nome, e-mail, telefone, CPF/Documento ou país...')}
            className="pl-9 bg-background border-white/10 text-white rounded-xl text-xs h-10 w-full"
          />
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">
          {filteredCustomers.length} {t('resultado(s) encontrado(s)')}
        </span>
      </div>

      {/* Customers List / Table */}
      <div className="bg-card border border-white/5 rounded-3xl p-6 shadow-xl overflow-hidden">
        {filteredCustomers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[9px] uppercase font-bold text-accent tracking-wider">
                  <th className="pb-3 px-3">{t('Cliente')}</th>
                  <th className="pb-3 px-3">{t('Contato')}</th>
                  <th className="pb-3 px-3">{t('País / Localización')}</th>
                  <th className="pb-3 px-3">{t('Documento Fiscal')}</th>
                  <th className="pb-3 px-3 text-center">{t('Pedidos')}</th>
                  <th className="pb-3 px-3 text-right">{t('Total Gasto')}</th>
                  <th className="pb-3 px-3 text-center">{t('Ações')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCustomers.map((c: any) => (
                  <tr key={c.id} className="hover:bg-white/5 transition-all">
                    {/* Name & Account Type */}
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold uppercase text-xs shrink-0">
                          {(c.name || 'C')[0]}
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs">{c.name}</p>
                          <span className={`inline-block text-[8px] font-bold uppercase px-1.5 py-0.5 rounded mt-0.5 ${c.is_registered ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-gray-500/20 text-muted-foreground'}`}>
                            {c.is_registered ? t('Conta Registrada') : t('Checkout Guest')}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Email & Phone */}
                    <td className="py-4 px-3">
                      <div className="flex flex-col gap-1">
                        <a href={`mailto:${c.email}`} className="text-white hover:text-accent flex items-center gap-1.5 font-mono text-[11px] truncate max-w-[180px]">
                          <Mail className="h-3 w-3 text-accent shrink-0" />
                          <span className="truncate">{c.email}</span>
                        </a>
                        <span className="text-muted-foreground flex items-center gap-1.5 font-mono text-[11px]">
                          <Phone className="h-3 w-3 text-white/40 shrink-0" />
                          <span>{c.phone}</span>
                        </span>
                      </div>
                    </td>

                    {/* Country & Location */}
                    <td className="py-4 px-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-white flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-accent shrink-0" />
                          {c.country}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                          {c.city} {c.postal_code !== '-' && `(${c.postal_code})`}
                        </span>
                      </div>
                    </td>

                    {/* Tax Document */}
                    <td className="py-4 px-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] uppercase font-bold text-accent">
                          {(c.document_type || 'CPF').toUpperCase()}
                        </span>
                        <span className="font-mono text-white text-[11px] font-medium">
                          {c.document_number}
                        </span>
                      </div>
                    </td>

                    {/* Orders Count */}
                    <td className="py-4 px-3 text-center">
                      <span className="font-mono text-xs font-bold bg-secondary/50 border border-white/10 px-2.5 py-1 rounded-lg text-white">
                        {c.orders_count}
                      </span>
                    </td>

                    {/* Total Spent */}
                    <td className="py-4 px-3 text-right">
                      <span className="font-mono text-xs font-bold text-accent">
                        US$ {c.total_spent.toFixed(2)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-3 text-center">
                      <Button
                        onClick={() => handleCopyData(c)}
                        variant="outline"
                        className="border-white/10 hover:bg-white/10 text-white font-bold text-[9px] h-7 px-2.5 rounded-lg flex items-center gap-1.5"
                      >
                        {copiedId === c.id ? (
                          <>
                            <Check className="h-3 w-3 text-green-400" />
                            <span className="text-green-400">{t('Copiado!')}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 text-accent" />
                            <span>{t('Copiar Ficha')}</span>
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border border-dashed border-white/10 rounded-2xl p-12 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
            <Users className="h-8 w-8 text-white/20" />
            <span>{t('Nenhum cliente encontrado com os filtros atuais.')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
