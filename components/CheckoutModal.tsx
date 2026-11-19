'use client';

import React, { useState } from 'react';
import { X, Send, MapPin, Phone, User, FileText, CheckCircle2 } from 'lucide-react';
import { CartItem, Order } from '@/lib/types';
import {
  CheckoutSchema,
  CheckoutFormData,
  formatEGP,
  calculateOrderTotal,
  createAndSaveOrder,
  buildWhatsAppOrderUrl,
} from '@/lib/utils';
import { RESTAURANT_INFO } from '@/lib/menu-data';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<Props> = ({
  isOpen,
  onClose,
  cartItems,
  onOrderSuccess,
}) => {
  const [formData, setFormData] = useState<CheckoutFormData>({
    customerName: '',
    customerPhone: '',
    orderType: 'delivery',
    deliveryAddress: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const totalAmount = calculateOrderTotal(cartItems);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = CheckoutSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const path = err.path[0] as string;
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create order and save to LocalStorage (for Owner Account Manager shift)
      const newOrder = createAndSaveOrder(result.data, cartItems);
      setSubmittedOrder(newOrder);

      // 2. Generate WhatsApp link
      const whatsappUrl = buildWhatsAppOrderUrl(newOrder);

      // 3. Open WhatsApp in new tab/app
      window.open(whatsappUrl, '_blank');

      // 4. Notify parent
      onOrderSuccess(newOrder);
    } catch (err) {
      console.error('Error submitting order:', err);
      alert('حدث خطأ أثناء حفظ الطلب، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-xs">
      <div className="bg-paper w-full max-w-lg border border-hair shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-paper-warm border-b border-hair flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-ink">تأكيد الطلب وإرسال لواتساب</h3>
            <p className="text-xs text-mute mt-0.5">
              سيتم حفظ الطلب فوراً وفتح محادثة واتساب مع مطعم السيدة زينب
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-mute hover:text-ink transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedOrder ? (
          /* Success Screen */
          <div className="p-6 text-center space-y-4 overflow-y-auto">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center rounded-full">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-xl font-black text-ink">
                تم تسجيل طلبك بنجاح! رقم #{submittedOrder.orderNumber}
              </h4>
              <p className="text-xs sm:text-sm text-mute mt-1">
                تم فتح تطبيق واتساب لإرسال تفاصيل الفاتورة، يمكنك الضغط على الزر أدناه إذا لم يفتح تلقائياً.
              </p>
            </div>

            <div className="bg-white p-4 border border-hair text-right text-xs space-y-1.5">
              <div className="flex justify-between font-bold">
                <span>العميل:</span>
                <span>{submittedOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>رقم الهاتف:</span>
                <span dir="ltr">{submittedOrder.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span>نوع الاستلام:</span>
                <span>{submittedOrder.orderType === 'delivery' ? 'توصيل دليفري' : 'استلام من المطعم'}</span>
              </div>
              <div className="flex justify-between font-bold text-accent-dark pt-1 border-t border-hair">
                <span>الإجمالي:</span>
                <span>{formatEGP(submittedOrder.totalAmount)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <a
                href={buildWhatsAppOrderUrl(submittedOrder)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>إعادة فتح رسالة واتساب</span>
              </a>
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-paper-warm border border-hair hover:border-ink text-ink font-semibold text-xs transition-colors"
              >
                العودة للمنيو
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Order Type Toggle */}
            <div className="grid grid-cols-2 gap-2 bg-paper-warm p-1 border border-hair">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, orderType: 'delivery' }))}
                className={`py-2 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors ${
                  formData.orderType === 'delivery'
                    ? 'bg-ink text-white shadow-xs'
                    : 'text-ink-2 hover:bg-white'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>توصيل دليفري</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, orderType: 'pickup' }))}
                className={`py-2 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors ${
                  formData.orderType === 'pickup'
                    ? 'bg-ink text-white shadow-xs'
                    : 'text-ink-2 hover:bg-white'
                }`}
              >
                <span>استلام تيك أواي</span>
              </button>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-ink mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-accent" />
                <span>الاسم بالكامل *</span>
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData((prev) => ({ ...prev, customerName: e.target.value }))}
                placeholder="مثال: أحمد محمود"
                className={`w-full p-2.5 bg-white border text-sm text-ink focus:outline-none focus:border-ink ${
                  errors.customerName ? 'border-accent' : 'border-hair'
                }`}
              />
              {errors.customerName && (
                <p className="text-[11px] text-accent mt-1">{errors.customerName}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-ink mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-accent" />
                <span>رقم الموبايل المصري *</span>
              </label>
              <input
                type="tel"
                dir="ltr"
                value={formData.customerPhone}
                onChange={(e) => setFormData((prev) => ({ ...prev, customerPhone: e.target.value }))}
                placeholder="01012345678"
                className={`w-full p-2.5 bg-white border text-sm text-ink text-right focus:outline-none focus:border-ink ${
                  errors.customerPhone ? 'border-accent' : 'border-hair'
                }`}
              />
              {errors.customerPhone && (
                <p className="text-[11px] text-accent mt-1">{errors.customerPhone}</p>
              )}
            </div>

            {/* Address (If delivery) */}
            {formData.orderType === 'delivery' && (
              <div>
                <label className="block text-xs font-bold text-ink mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-accent" />
                  <span>عنوان التوصيل في البدرشين أو جوارها *</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.deliveryAddress || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, deliveryAddress: e.target.value }))
                  }
                  placeholder="اسم الشارع، رقم العمارة أو علامة مميزة قريبة..."
                  className={`w-full p-2.5 bg-white border text-sm text-ink focus:outline-none focus:border-ink ${
                    errors.deliveryAddress ? 'border-accent' : 'border-hair'
                  }`}
                />
                {errors.deliveryAddress && (
                  <p className="text-[11px] text-accent mt-1">{errors.deliveryAddress}</p>
                )}
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-ink mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-mute" />
                <span>ملاحظات خاصة للأكل (اختياري)</span>
              </label>
              <input
                type="text"
                value={formData.notes || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="مثال: زيادة ليمون، شطة خفيفة، عيش زيادة..."
                className="w-full p-2.5 bg-white border border-hair text-sm text-ink focus:outline-none focus:border-ink"
              />
            </div>

            {/* Order Brief Summary */}
            <div className="bg-paper-warm p-3 border border-hair text-xs space-y-1">
              <div className="flex justify-between text-mute">
                <span>عدد الأصناف بالسلة:</span>
                <span className="font-bold tabular-nums">
                  {cartItems.reduce((acc, it) => acc + it.quantity, 0)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm text-ink pt-1 border-t border-hair">
                <span>المبلغ الإجمالي للأصناف:</span>
                <span className="text-accent-dark tabular-nums font-black">
                  {formatEGP(totalAmount)}
                </span>
              </div>
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-accent hover:bg-accent-dark text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-md disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'جاري التجهيز...' : 'تأكيد وحفظ الطلب وإرسال عبر واتساب'}</span>
              </button>
              <p className="text-[10px] text-center text-mute mt-2">
                بالضغط هنا سيتم تسجيل طلبك مباشرة وإرسال رسالة جاهزة لرقم المطعم الرسمي ({RESTAURANT_INFO.phone1}).
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
