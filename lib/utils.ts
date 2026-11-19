import { z } from 'zod';
import { CartItem, Order, OrderType } from './types';
import { MENU_ITEMS, RESTAURANT_INFO } from './menu-data';
import { getCairoDateString, getCairoHour, formatCairoArabicDateTime } from './shift-helpers';

export const EgyptianPhoneRegex = /^01[0125][0-9]{8}$/;

export const CheckoutSchema = z.object({
  customerName: z
    .string()
    .min(2, { message: 'برجاء كتابة الاسم بالكامل (حرفين على الأقل)' })
    .max(50, { message: 'الاسم طويل جداً' }),
  customerPhone: z
    .string()
    .regex(EgyptianPhoneRegex, { message: 'رقم هاتف مصري غير صحيح (مثال: 01012345678)' }),
  orderType: z.enum(['delivery', 'pickup']),
  deliveryAddress: z.string().optional(),
  notes: z.string().max(250, { message: 'الملاحظات يجب ألا تتجاوز 250 حرف' }).optional(),
}).refine(
  (data) => {
    if (data.orderType === 'delivery') {
      return Boolean(data.deliveryAddress && data.deliveryAddress.trim().length >= 5);
    }
    return true;
  },
  {
    message: 'برجاء كتابة عنوان التوصيل بالتفصيل (اسم الشارع ورقم العقار أو علامة مميزة)',
    path: ['deliveryAddress'],
  }
);

export type CheckoutFormData = z.infer<typeof CheckoutSchema>;

/**
 * Format price in Egyptian Pounds with tabular styling
 */
export function formatEGP(price: number): string {
  return `${price.toLocaleString('ar-EG')} ج.م`;
}

/**
 * Re-calculate order total deterministically from the canonical menu data
 * to prevent client tampering
 */
export function calculateOrderTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => {
    const menuItem = MENU_ITEMS.find((m) => m.id === item.itemId);
    if (!menuItem) {
      return sum + item.unitPrice * item.quantity;
    }

    let verifiedPrice = item.unitPrice;
    if (menuItem.pricingType === 'fixed' && menuItem.price) {
      verifiedPrice = menuItem.price;
    } else if (menuItem.pricingType === 'tiered' && menuItem.tiers) {
      const tier = menuItem.tiers.find((t) => t.key === item.tierKey);
      if (tier) {
        verifiedPrice = tier.price;
      }
    }

    return sum + verifiedPrice * item.quantity;
  }, 0);
}

const ORDERS_STORAGE_KEY = 'masmat_sz_orders_v1';
const CART_STORAGE_KEY = 'masmat_sz_cart_v1';

/**
 * Safe local storage read
 */
export function loadOrdersFromStorage(): Order[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!data) return getInitialDemoOrders();
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load orders from localStorage:', err);
    return getInitialDemoOrders();
  }
}

/**
 * Safe local storage write
 */
export function saveOrdersToStorage(orders: Order[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (err) {
    console.error('Failed to save orders to localStorage:', err);
  }
}

/**
 * Save new order
 */
export function createAndSaveOrder(
  formData: CheckoutFormData,
  items: CartItem[]
): Order {
  const existingOrders = loadOrdersFromStorage();
  const now = new Date();
  const isoString = now.toISOString();
  const cairoDate = getCairoDateString(now);
  const cairoHour = getCairoHour(isoString);
  const cairoFormatted = formatCairoArabicDateTime(isoString);

  // Generate readable order number like 101, 102...
  const nextNumber = existingOrders.length > 0 
    ? Math.max(...existingOrders.map(o => o.orderNumber || 100)) + 1 
    : 101;

  const newOrder: Order = {
    id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    orderNumber: nextNumber,
    customerName: formData.customerName.trim(),
    customerPhone: formData.customerPhone.trim(),
    orderType: formData.orderType,
    deliveryAddress: formData.deliveryAddress?.trim(),
    notes: formData.notes?.trim(),
    items,
    totalAmount: calculateOrderTotal(items),
    status: 'pending',
    createdAt: isoString,
    cairoTimestamp: cairoFormatted,
    cairoHour,
    cairoDateStr: cairoDate,
  };

  const updatedOrders = [newOrder, ...existingOrders];
  saveOrdersToStorage(updatedOrders);
  return newOrder;
}

/**
 * Build clean WhatsApp message URL
 */
export function buildWhatsAppOrderUrl(order: Order): string {
  const isDelivery = order.orderType === 'delivery';
  const lines = [
    `*طلب جديد من مسمط السيدة زينب (البدرشين)*`,
    `رقم الطلب: #${order.orderNumber}`,
    `التاريخ: ${order.cairoTimestamp}`,
    `━━━━━━━━━━━━━━━━━━`,
    `*بيانات العميل:*`,
    `الاسم: ${order.customerName}`,
    `الهاتف: ${order.customerPhone}`,
    `نوع الاستلام: ${isDelivery ? 'توصيل دليفري 🛵' : 'استلام من المطعم (تيك أواي) 🛍️'}`,
  ];

  if (isDelivery && order.deliveryAddress) {
    lines.push(`العنوان: ${order.deliveryAddress}`);
  }

  lines.push(`━━━━━━━━━━━━━━━━━━`);
  lines.push(`*الأصناف المطلوبة:*`);

  order.items.forEach((item, idx) => {
    const tierText = item.tierLabel ? ` [${item.tierLabel}]` : '';
    const itemTotal = item.unitPrice * item.quantity;
    lines.push(`${idx + 1}. ${item.name}${tierText}`);
    lines.push(`   الكمية: ${item.quantity} × ${item.unitPrice} ج.م = *${itemTotal} ج.م*`);
    if (item.notes) {
      lines.push(`   ملاحظة: ${item.notes}`);
    }
  });

  lines.push(`━━━━━━━━━━━━━━━━━━`);
  lines.push(`*الإجمالي المطلوب:* *${order.totalAmount} ج.م*`);

  if (order.notes) {
    lines.push(`ملاحظات عامة: ${order.notes}`);
  }

  lines.push(`\nشكراً، في انتظار تأكيد تجهيز الطلب.`);

  const messageText = lines.join('\n');
  return `https://wa.me/${RESTAURANT_INFO.whatsappNumber}?text=${encodeURIComponent(messageText)}`;
}

/**
 * Demo seed orders for realistic testing
 */
function getInitialDemoOrders(): Order[] {
  const today = getCairoDateString();
  return [
    {
      id: 'demo-1',
      orderNumber: 101,
      customerName: 'حسام عبد المنعم',
      customerPhone: '01012345678',
      orderType: 'delivery',
      deliveryAddress: 'شارع النيل السعيد أمام صيدلية السلام، البدرشين',
      notes: 'مع زيادة طحينة وعيش',
      items: [
        {
          id: 'meal-1-def',
          itemId: 'meal-1',
          name: 'وجبة ممبار ولحمة ومشكل مشبعة',
          unitPrice: 250,
          quantity: 1,
        },
        {
          id: 'sde-9-small',
          itemId: 'sde-9',
          name: 'علبة شوربة مسمط دسمة',
          tierKey: 'small',
          tierLabel: 'صغير',
          unitPrice: 10,
          quantity: 2,
        },
      ],
      totalAmount: 270,
      status: 'confirmed',
      createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      cairoTimestamp: 'اليوم، 1:30 م',
      cairoHour: 13,
      cairoDateStr: today,
    },
    {
      id: 'demo-2',
      orderNumber: 102,
      customerName: 'محمد طارق',
      customerPhone: '01123456789',
      orderType: 'pickup',
      notes: 'استلام خلال ثلث ساعة',
      items: [
        {
          id: 'fam-1-def',
          itemId: 'fam-1',
          name: 'كيلو مشكل مسمط',
          unitPrice: 350,
          quantity: 1,
        },
        {
          id: 'snd-1-large',
          itemId: 'snd-1',
          name: 'رغيف مشكل',
          tierKey: 'large',
          tierLabel: 'كبير',
          unitPrice: 50,
          quantity: 2,
        },
      ],
      totalAmount: 450,
      status: 'confirmed',
      createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
      cairoTimestamp: 'اليوم، 3:15 م',
      cairoHour: 15,
      cairoDateStr: today,
    },
    {
      id: 'demo-3',
      orderNumber: 103,
      customerName: 'عمر الشريف',
      customerPhone: '01234567890',
      orderType: 'delivery',
      deliveryAddress: 'أول البدرشين بجوار جامع النور',
      items: [
        {
          id: 'meal-2-def',
          itemId: 'meal-2',
          name: 'وجبة كوارع مسمط مخصوص',
          unitPrice: 110,
          quantity: 1,
        },
      ],
      totalAmount: 110,
      status: 'pending',
      createdAt: new Date().toISOString(),
      cairoTimestamp: 'اليوم، الآن',
      cairoHour: 16,
      cairoDateStr: today,
    },
  ];
}
