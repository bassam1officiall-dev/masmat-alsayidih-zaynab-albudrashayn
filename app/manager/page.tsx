'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  Calendar,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  Check,
  Share2,
  Trash2,
  Phone,
  MapPin,
  RefreshCw,
  Moon,
  Sun,
} from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types';
import { RESTAURANT_INFO } from '@/lib/menu-data';
import {
  getCairoDateString,
  getCairoNow,
  formatCairoArabicDateTime,
  filterOrdersByShift,
  calculateShiftKPIs,
  generateDailyClosingReport,
} from '@/lib/shift-helpers';
import {
  loadOrdersFromStorage,
  saveOrdersToStorage,
  formatEGP,
} from '@/lib/utils';

export default function AccountManagerPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [includeLateNight, setIncludeLateNight] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [copiedReport, setCopiedReport] = useState(false);

  // Initialize date to Cairo current date & check auth
  useEffect(() => {
    const todayCairo = getCairoDateString();
    setSelectedDate(todayCairo);

    // Check if previously logged in
    const authSession = sessionStorage.getItem('masmat_sz_manager_auth');
    if (authSession === 'true') {
      setIsAuthenticated(true);
    }

    refreshOrders();
  }, []);

  const refreshOrders = () => {
    const loaded = loadOrdersFromStorage();
    setOrders(loaded);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === RESTAURANT_INFO.managerDefaultPin) {
      setIsAuthenticated(true);
      sessionStorage.setItem('masmat_sz_manager_auth', 'true');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('masmat_sz_manager_auth');
    setPinInput('');
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const updated = orders.map((ord) => {
      if (ord.id === orderId) {
        return { ...ord, status: newStatus };
      }
      return ord;
    });
    setOrders(updated);
    saveOrdersToStorage(updated);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (!window.confirm('هل تريد مسح هذا الطلب نهائياً من السجل؟')) return;
    const updated = orders.filter((o) => o.id !== orderId);
    setOrders(updated);
    saveOrdersToStorage(updated);
  };

  // Filter orders by chosen date & 5 AM - 12 AM shift
  const shiftOrders = filterOrdersByShift(orders, selectedDate, includeLateNight);
  const kpis = calculateShiftKPIs(shiftOrders);

  const handleCopyReport = () => {
    const reportText = generateDailyClosingReport(selectedDate, shiftOrders, kpis);
    navigator.clipboard.writeText(reportText).then(() => {
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2500);
    });
  };

  const handleShareReportWhatsApp = () => {
    const reportText = generateDailyClosingReport(selectedDate, shiftOrders, kpis);
    const url = `https://wa.me/?text=${encodeURIComponent(reportText)}`;
    window.open(url, '_blank');
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-white p-6 sm:p-8 border border-hair shadow-md">
          <div className="w-12 h-12 bg-ink text-gold-light mx-auto flex items-center justify-center mb-4">
            <Lock className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-black text-ink text-center mb-1">
            أكونت مانجر مسمط السيدة زينب
          </h2>
          <p className="text-xs text-mute text-center mb-6">
            لوحة الإدارة اليومية وجرد الوردية (الرقم السري الافتراضي: 1234)
          </p>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-ink mb-1.5 text-right">
                أدخل رمز الدخول (PIN)
              </label>
              <input
                type="password"
                maxLength={8}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="1234"
                className="w-full text-center text-xl tracking-widest py-2.5 bg-paper border border-hair font-mono text-ink focus:outline-none focus:border-ink"
                autoFocus
              />
              {pinError && (
                <p className="text-xs text-accent mt-1.5 text-center font-bold">
                  الرمز غير صحيح، حاول مرة أخرى.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-ink hover:bg-accent text-white font-bold text-sm transition-colors"
            >
              دخول اللوحة
            </button>

            <div className="text-center pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-xs text-mute hover:text-ink transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>العودة لصفحة المنيو للزبائن</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink pb-20">
      {/* Top Bar */}
      <header className="bg-ink text-paper border-b border-hair-dark py-3 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-gold-light" />
            <h1 className="text-base sm:text-lg font-bold">
              لوحة الأكونت مانجر — مسمط السيدة زينب (البدرشين)
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs text-hair hover:text-white transition-colors"
            >
              عرض المنيو
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs bg-ink-2 hover:bg-black px-2.5 py-1 text-hair border border-hair-dark transition-colors"
            >
              خروج
            </button>
          </div>
        </div>
      </header>

      {/* Main Shift Filter Controls */}
      <div className="bg-paper-warm border-b border-hair py-4 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Shift Time Badge */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-ink text-gold-light">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-ink">
                  وردية التشغيل الرئيسية (5:00 ص – 12:00 منتصف الليل)
                </span>
                <span className="text-[10px] bg-accent text-white font-bold px-1.5 py-0.2">
                  بتوقيت القاهرة
                </span>
              </div>
              <p className="text-xs text-mute mt-0.5">
                تصفية الطلبات المنفذة داخل نطاق الوردية المعتمد لصاحب المطعم.
              </p>
            </div>
          </div>

          {/* Date Picker & Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center bg-white border border-hair px-2.5 py-1.5 text-xs">
              <Calendar className="w-3.5 h-3.5 text-mute ml-1.5" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-ink font-semibold focus:outline-none"
              />
            </div>

            <button
              onClick={() => setIncludeLateNight(!includeLateNight)}
              className={`px-3 py-1.5 text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                includeLateNight
                  ? 'bg-ink text-white border-ink'
                  : 'bg-white text-ink border-hair hover:border-ink'
              }`}
              title="تفعيل لعرض طلبات السهرة بعد 12 بليل حتى 5 الفجر"
            >
              <Moon className="w-3.5 h-3.5 text-gold-light" />
              <span>طلبات السهرة (بعد 12 بليل)</span>
            </button>

            <button
              onClick={refreshOrders}
              className="p-1.5 bg-white border border-hair hover:border-ink text-ink transition-colors"
              title="تحديث البيانات"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 border border-hair border-r-4 border-r-accent">
            <span className="text-xs text-mute font-medium block">
              المبيعات المؤكدة (الصافي)
            </span>
            <span className="text-2xl sm:text-3xl font-black text-accent-dark tabular-nums block mt-1">
              {formatEGP(kpis.totalConfirmedRevenue)}
            </span>
            <span className="text-[11px] text-mute mt-0.5 block">
              من {kpis.confirmedCount} طلب مؤكد
            </span>
          </div>

          <div className="bg-white p-4 border border-hair border-r-4 border-r-emerald-600">
            <span className="text-xs text-mute font-medium block">
              طلبات مؤكدة
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-700 tabular-nums block mt-1">
              {kpis.confirmedCount}
            </span>
            <span className="text-[11px] text-mute mt-0.5 block">
              تم تسليمها للمطبخ
            </span>
          </div>

          <div className="bg-white p-4 border border-hair border-r-4 border-r-amber-500">
            <span className="text-xs text-mute font-medium block">
              قيد الانتظار
            </span>
            <span className="text-2xl sm:text-3xl font-black text-amber-700 tabular-nums block mt-1">
              {kpis.pendingCount}
            </span>
            <span className="text-[11px] text-mute mt-0.5 block">
              تحتاج تأكيد أو اتصال
            </span>
          </div>

          <div className="bg-white p-4 border border-hair border-r-4 border-r-mute">
            <span className="text-xs text-mute font-medium block">
              إجمالي تعاملات اليوم
            </span>
            <span className="text-2xl sm:text-3xl font-black text-ink tabular-nums block mt-1">
              {kpis.totalOrdersCount}
            </span>
            <span className="text-[11px] text-mute mt-0.5 block">
              منها {kpis.cancelledCount} ملغي
            </span>
          </div>
        </div>

        {/* Report Actions Bar */}
        <div className="bg-white p-4 border border-hair flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-ink flex items-center gap-2">
              <span>تقرير تقفيل اليومية لصاحب المطعم</span>
              <span className="text-xs text-mute font-normal">
                (يحتوي ملخص المبيعات المؤكدة وقائمة أعلى الأصناف)
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyReport}
              className="px-3.5 py-2 bg-ink hover:bg-accent text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              {copiedReport ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>تم نسخ التقرير!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>نسخ تقرير اليومية</span>
                </>
              )}
            </button>

            <button
              onClick={handleShareReportWhatsApp}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>إرسال التقرير لواتساب</span>
            </button>
          </div>
        </div>

        {/* Top-Selling Items Grid */}
        {kpis.topItems.length > 0 && (
          <div className="bg-white border border-hair p-4">
            <h3 className="text-sm font-bold text-ink mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span>أكثر الأصناف طلباً في هذه الوردية</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {kpis.topItems.slice(0, 6).map((item, idx) => (
                <div
                  key={idx}
                  className="bg-paper-warm p-2.5 border border-hair flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-ink text-white font-bold text-[10px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-ink">{item.name}</span>
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-accent-dark tabular-nums">
                      {item.quantity} طلب
                    </span>
                    <span className="text-[11px] text-mute block tabular-nums">
                      {formatEGP(item.revenue)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Table & Details */}
        <div className="bg-white border border-hair">
          <div className="p-4 border-b border-hair flex items-center justify-between">
            <h3 className="text-base font-bold text-ink">
              سجل الطلبات التفصيلي ({shiftOrders.length} طلب)
            </h3>
            <span className="text-xs text-mute">
              اضغط تأكيد أو إلغاء لتحديث حسابات الصافي لحظياً
            </span>
          </div>

          {shiftOrders.length === 0 ? (
            <div className="p-12 text-center text-mute">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 text-hair-dark" />
              <p className="text-sm font-bold text-ink">لا توجد طلبات مسجلة في هذا التاريخ والوردية</p>
              <p className="text-xs text-mute mt-1">
                الطلبات الجديدة التي يرسلها الزبائن عبر المنيو ستظهر هنا فور إرسالها.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-hair">
              {shiftOrders.map((order) => {
                const isConfirmed = order.status === 'confirmed';
                const isCancelled = order.status === 'cancelled';
                const isPending = order.status === 'pending';

                return (
                  <div
                    key={order.id}
                    className={`p-4 transition-colors ${
                      isCancelled ? 'bg-paper-warm/50 opacity-75' : 'hover:bg-paper/40'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      {/* Left Header info */}
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm font-black text-ink">
                            طلب #{order.orderNumber}
                          </span>

                          {/* Status Badge */}
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 ${
                              isConfirmed
                                ? 'bg-emerald-100 text-emerald-800'
                                : isCancelled
                                ? 'bg-rose-100 text-rose-800 line-through'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isConfirmed ? 'مؤكد' : isCancelled ? 'ملغي' : 'قيد الانتظار'}
                          </span>

                          <span className="text-xs text-mute tabular-nums">
                            {order.cairoTimestamp}
                          </span>

                          <span className="text-xs font-semibold px-2 py-0.5 bg-paper-warm border border-hair text-ink-2">
                            {order.orderType === 'delivery' ? 'توصيل 🛵' : 'استلام 🛍️'}
                          </span>
                        </div>

                        {/* Customer Info */}
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-ink-2">
                          <span className="font-bold text-ink">{order.customerName}</span>
                          <span>•</span>
                          <a
                            href={`tel:${order.customerPhone}`}
                            className="text-accent hover:underline flex items-center gap-1 font-mono"
                            dir="ltr"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{order.customerPhone}</span>
                          </a>
                          {order.deliveryAddress && (
                            <>
                              <span>•</span>
                              <span className="text-mute flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-accent shrink-0" />
                                <span>{order.deliveryAddress}</span>
                              </span>
                            </>
                          )}
                        </div>

                        {/* Itemized Order list */}
                        <div className="mt-3 bg-paper p-2.5 border border-hair text-xs space-y-1">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between items-center text-ink-2">
                              <span>
                                {it.quantity} × {it.name}
                                {it.tierLabel && (
                                  <span className="text-accent font-semibold mr-1">
                                    ({it.tierLabel})
                                  </span>
                                )}
                              </span>
                              <span className="tabular-nums font-bold text-ink">
                                {formatEGP(it.unitPrice * it.quantity)}
                              </span>
                            </div>
                          ))}

                          {order.notes && (
                            <div className="pt-1.5 border-t border-hair text-[11px] text-mute">
                              <span className="font-bold">ملاحظات:</span> {order.notes}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Amount & Actions */}
                      <div className="flex lg:flex-col items-center lg:items-end justify-between gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-hair">
                        <div className="text-right">
                          <span className="text-xs text-mute block">الإجمالي:</span>
                          <span className="text-xl font-black text-accent-dark tabular-nums">
                            {formatEGP(order.totalAmount)}
                          </span>
                        </div>

                        {/* Status Buttons */}
                        <div className="flex items-center gap-1.5">
                          {isPending && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}
                              className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors flex items-center gap-1"
                              title="تأكيد الطلب وإضافته لحساب اليوم"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>تأكيد</span>
                            </button>
                          )}

                          {isConfirmed && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'pending')}
                              className="px-2 py-1 bg-paper-warm border border-hair hover:border-ink text-mute text-xs transition-colors"
                              title="إرجاع الطلب إلى قيد الانتظار"
                            >
                              تعديل
                            </button>
                          )}

                          {!isCancelled && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors flex items-center gap-1"
                              title="إلغاء الطلب واستبعاده من إجمالي المبيعات"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>إلغاء</span>
                            </button>
                          )}

                          {isCancelled && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}
                              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors"
                            >
                              إعادة تأكيد
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-1.5 text-mute hover:text-accent transition-colors"
                            title="مسح من السجل"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
