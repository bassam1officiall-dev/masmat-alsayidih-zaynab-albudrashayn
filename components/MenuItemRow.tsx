'use client';

import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { MenuItem, CartItem } from '@/lib/types';
import { formatEGP } from '@/lib/utils';

interface Props {
  item: MenuItem;
  cartItems: CartItem[];
  onAddToCart: (item: MenuItem, tierKey?: 'small' | 'medium' | 'large', tierLabel?: string, price?: number) => void;
  onRemoveFromCart: (cartItemId: string) => void;
}

export const MenuItemRow: React.FC<Props> = ({
  item,
  cartItems,
  onAddToCart,
  onRemoveFromCart,
}) => {
  if (item.pricingType === 'fixed') {
    const fixedCartId = `${item.id}-fixed`;
    const cartEntry = cartItems.find((ci) => ci.id === fixedCartId);
    const quantity = cartEntry?.quantity || 0;

    return (
      <div className="py-4 border-b border-hair hover:bg-paper-warm/40 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 pr-1">
            <h3 className="text-base sm:text-lg font-bold text-ink">
              {item.name}
            </h3>
            {item.description && (
              <p className="text-xs sm:text-sm text-mute mt-1 leading-relaxed">
                {item.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
            <span className="text-base sm:text-lg font-bold text-accent-dark tabular-nums">
              {formatEGP(item.price || 0)}
            </span>

            {quantity === 0 ? (
              <button
                onClick={() => onAddToCart(item, undefined, undefined, item.price)}
                className="inline-flex items-center gap-1 bg-ink hover:bg-accent text-white px-3.5 py-1.5 text-xs sm:text-sm font-bold transition-colors"
                aria-label={`أضف ${item.name} إلى السلة`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>أضف للسلة</span>
              </button>
            ) : (
              <div className="flex items-center border border-hair bg-white">
                <button
                  onClick={() => onRemoveFromCart(fixedCartId)}
                  className="p-1.5 hover:bg-accent-wash text-accent transition-colors"
                  aria-label="إنقاص الكمية"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-7 text-center font-bold text-xs sm:text-sm tabular-nums text-ink">
                  {quantity}
                </span>
                <button
                  onClick={() => onAddToCart(item, undefined, undefined, item.price)}
                  className="p-1.5 hover:bg-accent-wash text-accent transition-colors"
                  aria-label="زيادة الكمية"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Tiered Pricing: clean size selector buttons
  return (
    <div className="py-4 border-b border-hair hover:bg-paper-warm/40 transition-colors">
      <div className="flex flex-col gap-2.5">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-ink">
            {item.name}
          </h3>
          {item.description && (
            <p className="text-xs sm:text-sm text-mute mt-0.5 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        {/* Tier Buttons */}
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {item.tiers?.map((tier) => {
            const tierCartId = `${item.id}-${tier.key}`;
            const cartEntry = cartItems.find((ci) => ci.id === tierCartId);
            const quantity = cartEntry?.quantity || 0;

            return (
              <div
                key={tier.key}
                className={`flex items-center border text-xs sm:text-sm transition-colors ${
                  quantity > 0
                    ? 'border-accent bg-accent-wash'
                    : 'border-hair bg-white hover:border-ink hover:bg-paper'
                }`}
              >
                <button
                  onClick={() => onAddToCart(item, tier.key, tier.label, tier.price)}
                  className="px-3 py-1.5 flex items-center gap-1.5 font-bold text-ink hover:text-accent transition-colors"
                  title={`أضف حجم ${tier.label}`}
                >
                  <span>{tier.label}</span>
                  <span className="text-accent-dark tabular-nums font-black">
                    {formatEGP(tier.price)}
                  </span>
                  {quantity === 0 && <Plus className="w-3 h-3 text-mute" />}
                </button>

                {quantity > 0 && (
                  <div className="flex items-center border-r border-accent/30 pr-1 pl-1 bg-white">
                    <button
                      onClick={() => onRemoveFromCart(tierCartId)}
                      className="p-1 hover:text-accent transition-colors"
                      title="إنقاص"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-1.5 font-bold tabular-nums text-accent-dark text-xs">
                      {quantity}
                    </span>
                    <button
                      onClick={() => onAddToCart(item, tier.key, tier.label, tier.price)}
                      className="p-1 hover:text-accent transition-colors"
                      title="زيادة"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
