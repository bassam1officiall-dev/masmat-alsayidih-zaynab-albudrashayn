export type CategoryId = 'meals' | 'family' | 'sandwiches' | 'plates' | 'sides' | 'drinks';

export interface PriceTier {
  key: 'small' | 'medium' | 'large';
  label: string; // e.g. "صغير", "وسط", "كبير"
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: CategoryId;
  description?: string;
  pricingType: 'fixed' | 'tiered';
  price?: number;
  tiers?: PriceTier[];
  unitLabel?: string; // e.g. "للكيلو", "وجبة"
  isAvailable?: boolean;
}

export interface CartItem {
  id: string; // unique cart entry id (e.g. itemId + tierKey)
  itemId: string;
  name: string;
  tierKey?: 'small' | 'medium' | 'large';
  tierLabel?: string;
  unitPrice: number;
  quantity: number;
  notes?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'cancelled';
export type OrderType = 'delivery' | 'pickup';

export interface Order {
  id: string;
  orderNumber: number;
  customerName: string;
  customerPhone: string;
  orderType: OrderType;
  deliveryAddress?: string;
  notes?: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string; // ISO string in UTC or client
  cairoTimestamp: string; // formatted Cairo local date/time string
  cairoHour: number; // hour in Cairo 0..23
  cairoDateStr: string; // YYYY-MM-DD in Cairo
}

export interface ShiftKPIs {
  totalConfirmedRevenue: number;
  confirmedCount: number;
  pendingCount: number;
  cancelledCount: number;
  totalOrdersCount: number;
  topItems: { name: string; quantity: number; revenue: number }[];
}
