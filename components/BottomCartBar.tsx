'use client';

import React from 'react';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { CartItem } from '@/lib/types';
import { formatEGP, calculateOrderTotal } from '@/lib/utils';

interface Props {
  cartItems: CartItem[];
  onOpenCart: () => void;
}

export const BottomCartBar: React.FC<Props> = ({ cartItems, onOpenCart }) => {
  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  if (totalItemCount === 0) return null;

  const totalAmount = calculateOrderTotal(cartItems);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-paper/90 backdrop-blur-md border-t border-hair shadow-lg">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-10 h-10 bg-ink text-white flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-gold-light" />
            </div>
            <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-paper tabular-nums">
              {totalItemCount}
            </span>
          </div>

          <div className="text-right">
            <div className="text-xs text-mute font-medium">إجمالي السلة:</div>
            <div className="text-base sm:text-lg font-black text-ink tabular-nums">
              {formatEGP(totalAmount)}
            </div>
          </div>
        </div>

        <button
          onClick={onOpenCart}
          className="py-2.5 px-4 sm:px-6 bg-accent hover:bg-accent-dark text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors shadow-sm"
        >
          <span>عرض السلة وإرسال الطلب</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
