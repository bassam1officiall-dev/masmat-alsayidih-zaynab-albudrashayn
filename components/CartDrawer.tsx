'use client';

import React from 'react';
import { X, Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { CartItem } from '@/lib/types';
import { formatEGP, calculateOrderTotal } from '@/lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOpenCheckout,
}) => {
  if (!isOpen) return null;

  const totalAmount = calculateOrderTotal(cartItems);
  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/60 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-md bg-paper h-full flex flex-col shadow-2xl border-r border-hair animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="p-4 bg-paper-warm border-b border-hair flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold text-ink">سلة الطلبات</h2>
            <span className="text-xs bg-ink text-white px-2 py-0.5 rounded-none font-bold tabular-nums">
              {totalItemCount} {totalItemCount === 1 ? 'صنف' : 'أصناف'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-mute hover:text-ink transition-colors"
            aria-label="إغلاق السلة"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-mute">
              <ShoppingBag className="w-12 h-12 stroke-[1.2] mb-3 text-hair-dark" />
              <p className="text-base font-bold text-ink mb-1">السلة فاضية حتى الآن</p>
              <p className="text-xs text-mute max-w-xs">
                اختار الأصناف والوجبات اللي تعجبك من المنيو واضغط أضف للسلة عشان تجمع طلبك.
              </p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white p-3.5 border border-hair flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-ink">
                      {item.name}
                    </h4>
                    {item.tierLabel && (
                      <span className="text-xs text-accent font-semibold">
                        حجم: {item.tierLabel}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-mute hover:text-accent p-1 transition-colors"
                    title="حذف من السلة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-hair/60">
                  <span className="text-sm font-bold text-accent-dark tabular-nums">
                    {formatEGP(item.unitPrice * item.quantity)}
                    <span className="text-[11px] font-normal text-mute mr-1">
                      ({formatEGP(item.unitPrice)} للواحد)
                    </span>
                  </span>

                  <div className="flex items-center border border-hair bg-paper">
                    <button
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="p-1 hover:bg-accent-wash text-accent transition-colors"
                      title="إنقاص"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-7 text-center text-xs font-bold tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="p-1 hover:bg-accent-wash text-accent transition-colors"
                      title="زيادة"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-4 bg-paper-warm border-t border-hair space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-mute font-medium">إجمالي الحساب:</span>
              <span className="text-xl font-black text-accent-dark tabular-nums">
                {formatEGP(totalAmount)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClearCart}
                className="px-3 py-2.5 text-xs font-semibold text-mute hover:text-accent border border-hair bg-white hover:border-accent transition-colors"
              >
                تفريغ السلة
              </button>
              <button
                onClick={() => {
                  onClose();
                  onOpenCheckout();
                }}
                className="flex-1 py-3 px-4 bg-accent hover:bg-accent-dark text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <span>متابعة الطلب عبر واتساب</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
