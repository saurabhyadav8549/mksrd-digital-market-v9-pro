"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Check,
  Search,
  Lock,
  Package,
  Bell,
  Calendar,
  RefreshCw,
  Layers,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  Truck,
} from "lucide-react";
import { useShop } from "@/lib/store/shop-store";
import { APP_CONFIG } from "@/lib/config/app-config";
import type { OrderRecord, OrderStatus } from "@/lib/types";

export default function AdminPage() {
  const { products, loading, updateProductAdmin } = useShop();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  const [activeTab, setActiveTab] = useState<"orders" | "catalog">("orders");

  const [editedPrices, setEditedPrices] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState("");
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>("ALL");

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const prevOrdersLengthRef = useRef<number>(0);

  useEffect(() => {
    try {
      const auth = sessionStorage.getItem("mksrd_admin_auth");
      if (auth === "true") {
        setIsAuthenticated(true);
      }
    } catch {}
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === APP_CONFIG.admin.password) {
      setIsAuthenticated(true);
      setAuthError("");
      try {
        sessionStorage.setItem("mksrd_admin_auth", "true");
      } catch {}
    } else {
      setAuthError("Incorrect Admin Password!");
    }
  };

  const playAlertSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio play error:", e);
    }
  };

  const fetchOrders = async (isBackground = false) => {
    if (!isBackground) setOrdersLoading(true);
    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const fetchedOrders: OrderRecord[] = data.orders || [];

        if (prevOrdersLengthRef.current > 0 && fetchedOrders.length > prevOrdersLengthRef.current) {
          playAlertSound();
        }
        prevOrdersLengthRef.current = fetchedOrders.length;
        setOrders(fetchedOrders);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      if (!isBackground) setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      const interval = setInterval(() => {
        fetchOrders(true);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleStatusChange = async (receiptId: string, status: OrderStatus) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receipt_id: receiptId, status }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.receipt_id === receiptId ? { ...o, status } : o))
        );
      }
    } catch (err) {
      console.error("Failed to update order status:", err);
    }
  };

  const handlePriceChange = (id: string | number, val: string) => {
    const stringId = String(id);
    setEditedPrices((prev) => ({ ...prev, [stringId]: val }));
  };

  const handleSavePrice = async (id: string | number, currentPrice: number) => {
    const stringId = String(id);
    const raw = editedPrices[stringId];
    const parsed = raw !== undefined ? parseFloat(raw) : currentPrice;
    if (Number.isNaN(parsed) || parsed < 0) return;

    setSavingId(stringId);
    const ok = await updateProductAdmin(stringId, { price_per_kg: parsed });
    setSavingId(null);
    if (ok) {
      setSavedId(stringId);
      setTimeout(() => setSavedId(null), 1500);
    }
  };

  const handleToggleStock = async (id: string | number, currentStock: boolean) => {
    const stringId = String(id);
    setSavingId(stringId);
    await updateProductAdmin(stringId, { in_stock: !currentStock });
    setSavingId(null);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(filterQuery.trim().toLowerCase())
  );

  const getOrderDateKey = (order: OrderRecord): string => {
    if (order.order_date) return order.order_date;
    if (order.timestamp) {
      const parts = order.timestamp.split(",");
      if (parts.length >= 2) {
        return parts[0].trim();
      }
      return order.timestamp.substring(0, 12).trim();
    }
    return "Today";
  };

  const ordersByDate = orders.reduce((acc, order) => {
    const dateKey = getOrderDateKey(order);
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(order);
    return acc;
  }, {} as Record<string, OrderRecord[]>);

  const availableDates = Object.keys(ordersByDate);
  const displayedDates =
    selectedDateFilter === "ALL"
      ? availableDates
      : availableDates.filter((d) => d === selectedDateFilter);

  const pendingCount = orders.filter((o) => o.status === "Pending").length;
  const outForDeliveryCount = orders.filter((o) => o.status === "Out for Delivery").length;
  const deliveredCount = orders.filter((o) => o.status === "Delivered").length;
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.grand_total || o.total_amount || 0), 0);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-accent text-green-950 font-black text-2xl shadow-sm">
            <Lock className="h-7 w-7" />
          </div>
          <div className="text-center mb-6">
            <h1 className="text-xl font-black text-gray-900">Secure Admin Portal</h1>
            <p className="text-xs text-gray-500 mt-1">
              {APP_CONFIG.brand.name}
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Admin Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter admin password (mksrd@123)"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-3 text-xs font-bold focus:border-brand-green focus:outline-none"
              />
            </div>
            {authError && <p className="text-xs font-bold text-red-600">{authError}</p>}
            <button
              type="submit"
              className="w-full rounded-xl bg-brand-green py-3 text-xs font-extrabold text-white hover:bg-brand-dark transition shadow-md"
            >
              Sign In to Dashboard
            </button>
            <div className="text-center pt-2">
              <Link href="/" className="text-xs font-semibold text-gray-500 hover:underline">
                Back to Storefront
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <header className="sticky top-0 z-20 bg-slate-900 text-white border-b border-slate-800 px-4 py-3.5 shadow-md">
        <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
            >
              <ArrowLeft className="h-4 w-4" /> Store
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                  MKSRD Seller Console
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                  <Bell className="h-3 w-3 animate-pulse" /> Audio Chime Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Date-Wise Order Ledger & Rate Manager
              </p>
            </div>
          </div>

          <div className="flex rounded-xl bg-slate-800 p-1 border border-slate-700">
            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-extrabold transition ${
                activeTab === "orders"
                  ? "bg-brand-green text-white shadow-xs"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Package className="h-4 w-4" />
              <span>Order Ledger ({orders.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("catalog")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-extrabold transition ${
                activeTab === "catalog"
                  ? "bg-brand-green text-white shadow-xs"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Rate & Stock Catalog</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 mt-6">
        {activeTab === "orders" ? (
          <div className="space-y-6">
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Total Business Volume
                  </span>
                  <span className="text-xl font-black text-slate-900">
                    Rs. {totalRevenue.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="h-8 w-px bg-slate-200 hidden sm:block" />

                <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 text-blue-800 px-3 py-1.5 border border-blue-200/60">
                    <Clock className="h-3.5 w-3.5 text-blue-600" />
                    Pending: {pendingCount}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 text-amber-800 px-3 py-1.5 border border-amber-200/60">
                    <Truck className="h-3.5 w-3.5 text-amber-600" />
                    In Transit: {outForDeliveryCount}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 text-emerald-800 px-3 py-1.5 border border-emerald-200/60">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Completed: {deliveredCount}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <div className="relative">
                  <select
                    aria-label="Filter orders by date"
                    value={selectedDateFilter}
                    onChange={(e) => setSelectedDateFilter(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-800 focus:border-brand-green focus:bg-white focus:outline-none"
                  >
                    <option value="ALL">All Dates ({availableDates.length} Days)</option>
                    {availableDates.map((d) => (
                      <option key={d} value={d}>
                        {d} ({ordersByDate[d].length} Orders)
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => fetchOrders(false)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Sync</span>
                </button>
              </div>
            </div>

            {ordersLoading ? (
              <div className="rounded-2xl bg-white p-12 text-center border border-slate-200">
                <p className="text-xs font-bold text-slate-500">Loading order ledger...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="rounded-2xl bg-white p-14 text-center border border-slate-200 shadow-xs">
                <Package className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-700">No Customer Orders Yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  When customers place orders, they will appear here organized date-wise.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {displayedDates.map((dateStr) => {
                  const dateOrders = ordersByDate[dateStr] || [];
                  const dayTotalSale = dateOrders.reduce((sum, o) => sum + Number(o.grand_total || o.total_amount || 0), 0);
                  const dayDeliveredSale = dateOrders
                    .filter((o) => o.status === "Delivered")
                    .reduce((sum, o) => sum + Number(o.grand_total || o.total_amount || 0), 0);
                  return (
                    <section
                      key={dateStr}
                      className="overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-xs"
                    >
                      <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <Calendar className="h-4 w-4 text-brand-accent" />
                          <span className="text-sm font-black tracking-wide">{dateStr}</span>
                          <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-bold text-slate-300 border border-slate-700">
                            {dateOrders.length} {dateOrders.length === 1 ? "Order" : "Orders"}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs">
                          <div className="text-slate-300">
                            Day Booked:{" "}
                            <strong className="text-white font-extrabold">
                              Rs. {dayTotalSale.toLocaleString("en-IN")}
                            </strong>
                          </div>
                          <span className="text-slate-600">|</span>
                          <div className="text-emerald-300">
                            Settled Cash:{" "}
                            <strong className="font-extrabold">
                              Rs. {dayDeliveredSale.toLocaleString("en-IN")}
                            </strong>
                          </div>
                        </div>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {dateOrders.map((order) => (
                          <div key={order.receipt_id} className="p-5 hover:bg-slate-50/50 transition">
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                              <div className="flex items-center gap-2.5">
                                <span className="rounded-lg bg-green-50 border border-green-200 px-2.5 py-1 font-mono text-xs font-black text-brand-green">
                                  #{order.receipt_id}
                                </span>
                                <span className="text-xs font-medium text-slate-400">
                                  {order.timestamp}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                <select
                                  aria-label={`Order status for ${order.receipt_id}`}
                                  value={order.status}
                                  onChange={(e) =>
                                    handleStatusChange(order.receipt_id, e.target.value as OrderStatus)
                                  }
                                  className={`rounded-xl px-3 py-1.5 text-xs font-extrabold border focus:outline-none cursor-pointer ${
                                    order.status === "Delivered"
                                      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                      : order.status === "Out for Delivery"
                                      ? "bg-amber-50 text-amber-800 border-amber-300"
                                      : "bg-blue-50 text-blue-800 border-blue-300"
                                  }`}
                                >
                                  <option value="Pending">Status: Pending (Packing)</option>
                                  <option value="Out for Delivery">Status: Out for Delivery</option>
                                  <option value="Delivered">Status: Delivered</option>
                                </select>

                                <div className="text-right min-w-[80px]">
                                  <span className="block text-[10px] font-bold uppercase text-slate-400">
                                    Bill Total
                                  </span>
                                  <span className="text-sm font-black text-slate-900">
                                    Rs. {Number(order.grand_total || order.total_amount || 0)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs">
                              <div className="md:col-span-5 space-y-1">
                                <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
                                  <span>{order.customer_name}</span>
                                  <span className="inline-flex items-center gap-1 text-slate-500 font-semibold">
                                    <Phone className="h-3 w-3" /> {order.customer_phone}
                                  </span>
                                </p>
                                <p className="text-slate-600 flex items-start gap-1">
                                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                                  <span>
                                    {order.customer_address} ({order.distance_km} km)
                                  </span>
                                </p>
                              </div>

                              <div className="md:col-span-7 flex flex-wrap gap-1.5">
                                {order.items.map((it: any, idx: number) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-slate-700 border border-slate-200 shadow-2xs"
                                  >
                                    {it.product?.name || it.name || "Product"}:{" "}
                                    <span className="text-brand-green ml-1">
                                      {it.weight_kg < 1
                                        ? `${Math.round(it.weight_kg * 1000)}g`
                                        : `${it.weight_kg}kg`}
                                    </span>
                                    <span className="text-slate-400 mx-1">|</span>
                                    <span>Rs. {it.total_price || it.line_total || 0}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Mandi Rate & Stock Manager</h2>
                <p className="text-xs text-slate-500">
                  Update per-kg prices or toggle item availability in real time.
                </p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter catalog items..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs focus:border-brand-green focus:outline-none bg-white"
                />
              </div>
            </div>

            {loading ? (
              <p className="text-xs text-slate-600">Loading catalog...</p>
            ) : (
              <div className="overflow-hidden rounded-2xl bg-white shadow-xs border border-slate-200">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-900 text-white text-xs font-bold uppercase">
                    <tr>
                      <th className="py-3.5 px-4">Product</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Rate (Rs. / kg)</th>
                      <th className="py-3.5 px-4">Availability</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((product) => {
                      const productIdStr = String(product.id);
                      const priceInput =
                        editedPrices[productIdStr] !== undefined
                          ? editedPrices[productIdStr]
                          : String(product.price_per_kg);

                      return (
                        <tr key={product.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-brand-green font-black text-xs shrink-0">
                              {product.category === "fruit" ? "FRT" : "VEG"}
                            </div>
                            <span className="font-bold text-slate-900">
                              {product.name}
                            </span>
                          </td>
                          <td className="py-3 px-4 capitalize text-slate-600 font-medium">
                            {product.category}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="1"
                                step="1"
                                value={priceInput}
                                onChange={(e) =>
                                  handlePriceChange(product.id, e.target.value)
                                }
                                className="w-20 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:border-brand-green focus:outline-none"
                              />
                              <button
                                type="button"
                                disabled={savingId === productIdStr}
                                onClick={() =>
                                  handleSavePrice(product.id, product.price_per_kg)
                                }
                                className="inline-flex items-center gap-1 rounded-lg bg-brand-green px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-dark disabled:opacity-50"
                              >
                                {savedId === productIdStr ? (
                                  <>
                                    <Check className="h-3.5 w-3.5" /> Saved
                                  </>
                                ) : (
                                  <>
                                    <Save className="h-3.5 w-3.5" /> Save
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              disabled={savingId === productIdStr}
                              onClick={() =>
                                handleToggleStock(product.id, product.in_stock)
                              }
                              className={`rounded-full px-3 py-1 text-xs font-extrabold transition ${
                                product.in_stock
                                  ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                  : "bg-red-100 text-red-700 hover:bg-red-200"
                              }`}
                            >
                              {product.in_stock ? "In Stock" : "Out of Stock"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}