'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { MenuItemRow } from '@/components/MenuItemRow';
import { CartDrawer } from '@/components/CartDrawer';
import { BottomCartBar } from '@/components/BottomCartBar';
import { CheckoutModal } from '@/components/CheckoutModal';
import { CATEGORIES, MENU_ITEMS, RESTAURANT_INFO } from '@/lib/menu-data';
import { MenuItem, CartItem, Order } from '@/lib/types';
import { Facebook } from 'lucide-react';

export default function HomePage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [, setRecentOrderSuccess] = useState<Order | null>(null);

  // Load saved cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('masmat_sz_cart_items');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) setCartItems(parsed);
      }
    } catch (e) {
      console.error('Error reading cart from localStorage', e);
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('masmat_sz_cart_items', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Error saving cart to localStorage', e);
    }
  }, [cartItems]);

  const handleAddToCart = (
    item: MenuItem,
    tierKey?: 'small' | 'medium' | 'large',
    tierLabel?: string,
    price?: number
  ) => {
    const finalPrice = price || item.price || 0;
    const cartItemId = tierKey ? `${item.id}-${tierKey}` : `${item.id}-fixed`;

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((ci) => ci.id === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [
        ...prev,
        {
          id: cartItemId,
          itemId: item.id,
          name: item.name,
          tierKey,
          tierLabel,
          unitPrice: finalPrice,
          quantity: 1,
        },
      ];
    });
  };

  const handleRemoveFromCart = (cartItemId: string) => {
    setCartItems((prev) => {
      const existing = prev.find((ci) => ci.id === cartItemId);
      if (!existing) return prev;
      if (existing.quantity > 1) {
        return prev.map((ci) =>
          ci.id === cartItemId ? { ...ci, quantity: ci.quantity - 1 } : ci
        );
      }
      return prev.filter((ci) => ci.id !== cartItemId);
    });
  };

  const handleUpdateQuantity = (cartItemId: string, delta: number) => {
    setCartItems((prev) => {
      return prev
        .map((ci) => {
          if (ci.id === cartItemId) {
            const newQty = ci.quantity + delta;
            return newQty > 0 ? { ...ci, quantity: newQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleOrderSuccess = (order: Order) => {
    setRecentOrderSuccess(order);
    setCartItems([]);
  };

  return (
    <div className="min-h-screen bg-paper pb-28">
      {/* Branding & Contacts Header with Real Logo & No Admin Link */}
      <Header />

      {/* Main Content: Clean Vertical Stacked Sections with zero horizontal scroll */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-12 divide-y divide-hair">
          {CATEGORIES.map((cat, idx) => {
            const items = MENU_ITEMS.filter((m) => m.category === cat.id);

            return (
              <section
                key={cat.id}
                id={`section-${cat.id}`}
                className={idx > 0 ? 'pt-10' : ''}
              >
                {/* Clean Section Header (No AI badges or item count pills) */}
                <div className="border-b-2 border-ink pb-2 mb-4">
                  <h2 className="text-xl sm:text-2xl font-black text-ink">
                    {cat.title}
                  </h2>
                  {cat.description && (
                    <p className="text-xs sm:text-sm text-mute mt-1 leading-relaxed">
                      {cat.description}
                    </p>
                  )}
                </div>

                {/* Section Items */}
                <div className="divide-y divide-hair">
                  {items.map((item) => (
                    <MenuItemRow
                      key={item.id}
                      item={item}
                      cartItems={cartItems}
                      onAddToCart={handleAddToCart}
                      onRemoveFromCart={handleRemoveFromCart}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      {/* Footer: Clean contact info with zero admin links */}
      <footer className="mt-16 bg-ink text-paper py-10 px-4 border-t border-hair-dark">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-right">
          <div>
            <h3 className="text-lg font-bold text-paper mb-1">
              {RESTAURANT_INFO.name}
            </h3>
            <p className="text-xs text-mute max-w-md">
              {RESTAURANT_INFO.locationDetails}
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-4 mt-3 text-xs">
              <a
                href={`tel:${RESTAURANT_INFO.phone1}`}
                className="hover:text-gold-light transition-colors tabular-nums"
                dir="ltr"
              >
                {RESTAURANT_INFO.phone1}
              </a>
              <span>•</span>
              <a
                href={`tel:${RESTAURANT_INFO.phone2}`}
                className="hover:text-gold-light transition-colors tabular-nums"
                dir="ltr"
              >
                {RESTAURANT_INFO.phone2}
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-end gap-2.5">
            <a
              href={RESTAURANT_INFO.facebookPage}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-hair hover:text-white transition-colors"
            >
              <Facebook className="w-4 h-4 text-blue-400" />
              <span>صفحتنا على فيسبوك ({RESTAURANT_INFO.facebookFollowers})</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Bottom Floating Bar */}
      <BottomCartBar
        cartItems={cartItems}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Checkout & WhatsApp Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onOrderSuccess={handleOrderSuccess}
      />
    </div>
  );
}
