'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, X } from 'lucide-react';

export default function FloatingCart() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const updateCart = () => {
    if (typeof window === 'undefined') return;
    const cart = localStorage.getItem('yedam_cart');
    const parsed = cart ? JSON.parse(cart) : [];
    setCartItems(parsed);
    setIsVisible(parsed.length > 0);
  };

  useEffect(() => {
    updateCart();
    const interval = setInterval(updateCart, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalItems = cartItems.reduce((acc: number, item: any) => acc + item.quantity, 0);
  const totalPrice = cartItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 md:hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
      {/* Mini Cart Preview */}
      <div className="group relative">
        {/* Mini dropdown on hover/tap */}
        <div className="absolute bottom-full right-0 mb-3 w-72 bg-[#07101E] border border-white/10 rounded-2xl p-4 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
          <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
            <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Carrinho</span>
            <span className="text-[10px] text-muted-foreground">{totalItems} itens</span>
          </div>
          <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
            {cartItems.slice(0, 3).map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between gap-2 text-xs">
                <span className="text-white truncate flex-1">{item.name}</span>
                <span className="text-accent font-heading font-bold shrink-0">
                  {item.quantity}x US$ {item.price.toFixed(2)}
                </span>
              </div>
            ))}
            {cartItems.length > 3 && (
              <span className="text-[10px] text-muted-foreground text-center">
                +{cartItems.length - 3} mais itens
              </span>
            )}
          </div>
          <div className="border-t border-white/5 mt-3 pt-3 flex items-center justify-between">
            <span className="text-[10px] font-bold text-white uppercase">Total</span>
            <span className="text-xs font-bold text-accent font-heading">US$ {totalPrice.toFixed(2)}</span>
          </div>
          <Link href="/tienda/carrinho">
            <div className="w-full bg-accent hover:bg-accentHover text-background text-[10px] font-bold text-center py-2.5 rounded-xl mt-3 uppercase tracking-wider transition-all">
              Ver Carrinho
            </div>
          </Link>
        </div>

        {/* Floating Button */}
        <Link
          href="/tienda/carrinho"
          className="relative flex items-center gap-2 bg-accent hover:bg-accentHover text-background px-5 py-3.5 rounded-full shadow-2xl shadow-accent/30 transition-all hover:scale-105 active:scale-95"
        >
          <ShoppingBag strokeWidth={2} className="h-5 w-5" />
          <span className="font-bold text-xs">{totalItems}</span>
          {totalItems > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-pulse">
              {totalItems > 9 ? '9+' : totalItems}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}
