import { Order, ShiftKPIs } from './types';

/**
 * Returns the current date and time in Cairo timezone
 */
export function getCairoNow(): Date {
  const now = new Date();
  // Get time in Africa/Cairo
  const cairoString = now.toLocaleString('en-US', { timeZone: 'Africa/Cairo' });
  return new Date(cairoString);
}

/**
 * Returns formatted Cairo date string YYYY-MM-DD
 */
export function getCairoDateString(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Cairo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
  return parts; // Returns YYYY-MM-DD
}

/**
 * Returns formatted Arabic human readable date and time in Cairo
 */
export function formatCairoArabicDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('ar-EG', {
      timeZone: 'Africa/Cairo',
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return isoString;
  }
}

/**
 * Extracts Cairo hour (0-23) from a date or ISO string
 */
export function getCairoHour(isoString: string): number {
  try {
    const d = new Date(isoString);
    const hourStr = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Africa/Cairo',
      hour: 'numeric',
      hour12: false,
    }).format(d);
    return parseInt(hourStr, 10);
  } catch {
    return new Date().getHours();
  }
}

/**
 * Checks whether an order falls into the main shift:
 * 05:00 AM to 12:00 AM (midnight) of the given shift date
 */
export function isOrderInMainShift(order: Order, targetDateStr: string): boolean {
  // If order was placed on targetDateStr and hour is >= 5
  if (order.cairoDateStr === targetDateStr && order.cairoHour >= 5) {
    return true;
  }
  return false;
}

/**
 * Checks whether an order is late night (00:00 to 04:59 AM)
 */
export function isOrderLateNight(order: Order, targetDateStr: string): boolean {
  // Late night for targetDate is next day early hours (00:00 - 04:59)
  // Or current day early hours if viewing next day
  if (order.cairoHour >= 0 && order.cairoHour < 5) {
    return true;
  }
  return false;
}

/**
 * Filters orders for the Owner Account Manager shift
 */
export function filterOrdersByShift(
  orders: Order[],
  selectedDateStr: string,
  includeLateNight: boolean
): Order[] {
  return orders.filter((order) => {
    const isMain = isOrderInMainShift(order, selectedDateStr);
    if (isMain) return true;

    if (includeLateNight) {
      // Check if this order happened in early morning of the following day or same night
      const orderDate = new Date(order.cairoDateStr);
      const selectedDate = new Date(selectedDateStr);
      const diffDays = Math.round((orderDate.getTime() - selectedDate.getTime()) / (1000 * 3600 * 24));

      // Same day late night (00:00 to 04:59) or next day early morning
      if (diffDays === 1 && order.cairoHour < 5) {
        return true;
      }
      if (diffDays === 0 && order.cairoHour < 5) {
        return true;
      }
    }

    return false;
  });
}

/**
 * Computes Shift KPIs for Account Manager
 */
export function calculateShiftKPIs(orders: Order[]): ShiftKPIs {
  let totalConfirmedRevenue = 0;
  let confirmedCount = 0;
  let pendingCount = 0;
  let cancelledCount = 0;

  const itemMap = new Map<string, { quantity: number; revenue: number }>();

  orders.forEach((order) => {
    if (order.status === 'confirmed') {
      totalConfirmedRevenue += order.totalAmount;
      confirmedCount++;

      order.items.forEach((item) => {
        const itemFullName = item.tierLabel ? `${item.name} (${item.tierLabel})` : item.name;
        const current = itemMap.get(itemFullName) || { quantity: 0, revenue: 0 };
        current.quantity += item.quantity;
        current.revenue += item.unitPrice * item.quantity;
        itemMap.set(itemFullName, current);
      });
    } else if (order.status === 'pending') {
      pendingCount++;
    } else if (order.status === 'cancelled') {
      cancelledCount++;
    }
  });

  const topItems = Array.from(itemMap.entries())
    .map(([name, data]) => ({
      name,
      quantity: data.quantity,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.quantity - a.quantity);

  return {
    totalConfirmedRevenue,
    confirmedCount,
    pendingCount,
    cancelledCount,
    totalOrdersCount: orders.length,
    topItems,
  };
}

/**
 * Generates plain-text daily closing WhatsApp report for restaurant owner
 */
export function generateDailyClosingReport(
  dateStr: string,
  orders: Order[],
  kpis: ShiftKPIs
): string {
  const top3 = kpis.topItems.slice(0, 3);
  let topItemsText = '';
  if (top3.length > 0) {
    topItemsText = '\n⭐ أعلى الأصناف طلباً:\n' +
      top3.map((it, idx) => `  ${idx + 1}. ${it.name} (${it.quantity} طلب - ${it.revenue} ج.م)`).join('\n');
  }

  return `📊 تقرير تقفيل الوردية اليومية (5 ص - 12 منتصف الليل)
🏢 مسمط السيدة زينب - البدرشين
📅 التاريخ: ${dateStr}
⏰ وقت التقرير: ${formatCairoArabicDateTime(new Date().toISOString())}
━━━━━━━━━━━━━━━━━━
💰 إجمالي المبيعات المؤكدة: ${kpis.totalConfirmedRevenue.toLocaleString('ar-EG')} ج.م
✅ عدد الطلبات المؤكدة: ${kpis.confirmedCount} طلب
⏳ طلبات قيد الانتظار: ${kpis.pendingCount}
❌ طلبات ملغاة: ${kpis.cancelledCount}
📦 إجمالي المعاملات: ${kpis.totalOrdersCount}${topItemsText}
━━━━━━━━━━━━━━━━━━
تم الاستخراج من لوحة أكونت مانجر مسمط السيدة زينب`;
}
