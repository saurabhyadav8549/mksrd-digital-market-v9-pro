"use client";

import Link from "next/link";
import { ShoppingBag, Search, Zap, Settings, X, PackageCheck, User } from "lucide-react";
import { useShop } from "@/lib/store/shop-store";
import { APP_CONFIG } from "@/lib/config/app-config";
import { useState } from "react";

export function Header() {
  const {
    cart,
    cartGrandTotal,
    setIsCartOpen,
    setIsAccountOpen,
    currentUser,
    userOrders,
    searchQuery,
    setSearchQuery,
    trackOrder,
    setActiveReceipt,
  } = useShop();

  const [trackIdInput, setTrackIdInput] = useState("");
  const [showTrackerModal, setShowTrackerModal] = useState(false);
  const [trackError, setTrackError] = useState("");
  const [trackingLoading, setTrackingLoading] = useState(false);

  const totalItems = cart.length;
  const activeOrdersCount = userOrders.filter((o) => o.status !== "Delivered").length;

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackIdInput.trim()) return;
    setTrackingLoading(true);
    setTrackError("");

    const order = await trackOrder(trackIdInput.trim());
    setTrackingLoading(false);
    if (!order) {
      setTrackError("Order ID not found. Please check your Order ID (e.g. MKSRD-123456).");
      return;
    }
    setActiveReceipt(order);
    setShowTrackerModal(false);
    setTrackIdInput("");
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-accent text-green-950 font-black text-xl shadow-sm group-hover:scale-105 transition">
                  M
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-gray-900 leading-tight">
                    {APP_CONFIG.brand.name}
                  </h1>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-green">
                    <Zap className="h-3.5 w-3.5 fill-brand-green" />
                    <span>{APP_CONFIG.brand.tagline}</span>
                  </div>
                </div>
              </Link>
            </div>

            <div className="relative flex-1 max-w-md min-w-[220px] order-3 md:order-2 w-full md:w-auto">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search "Aloo", "Apple", "Tamatar"...'
                className="w-full rounded-xl bg-gray-100 pl-10 pr-9 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 order-2 md:order-3">
              <button
                type="button"
                onClick={() => setShowTrackerModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-green-50 px-3 py-2.5 text-xs font-bold text-brand-green hover:bg-green-100 transition"
                title="Track Order by ID"
              >
                <PackageCheck className="h-4 w-4" />
                <span className="hidden lg:inline">Track Order</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAccountOpen(true)}
                className="relative flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-200/80 px-3 py-2.5 text-xs font-extrabold text-amber-950 hover:bg-amber-100 transition"
                title="My Account & Order History"
              >
                <User className="h-4 w-4 text-brand-green" />
                <span className="max-w-[90px] truncate">
                  {currentUser ? currentUser.name.split(" ")[0] : "Login / Account"}
                </span>
                {activeOrdersCount > 0 && (
                  <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-green text-[10px] font-black text-white">
                    {activeOrdersCount}
                  </span>
                )}
              </button>

              <Link
                href="/admin"
                className="flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-200 transition"
                title="Secure Admin Panel"
              >
                <Settings className="h-4 w-4 text-gray-600" />
                <span className="hidden sm:inline">Admin</span>
              </Link>

              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-2.5 rounded-xl bg-brand-green px-4 py-2.5 text-white shadow-sm hover:bg-brand-dark active:scale-95 transition"
              >
                <ShoppingBag className="h-5 w-5" />
                {totalItems === 0 ? (
                  <span className="text-sm font-bold">My Cart</span>
                ) : (
                  <div className="flex flex-col items-start leading-none text-left">
                    <span className="text-[11px] font-medium opacity-90">
                      {totalItems} {totalItems === 1 ? "item" : "items"}
                    </span>
                    <span className="text-sm font-extrabold">Rs. {cartGrandTotal}</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {showTrackerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowTrackerModal(false)}
              className="absolute right-4 top-4 rounded-full bg-gray-100 p-1.5 text-gray-500 hover:bg-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mb-4">
              <h3 className="text-base font-black text-gray-900">Track Order by ID</h3>
              <p className="text-xs text-gray-500">
                Enter the Order ID (e.g. MKSRD-123456) shown in your Account or Digital Rashid.
              </p>
            </div>
            <form onSubmit={handleTrackSubmit} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Enter Order ID (e.g., MKSRD-849201)"
                value={trackIdInput}
                onChange={(e) => setTrackIdInput(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-mono font-bold focus:border-brand-green focus:outline-none"
              />
              {trackError && <p className="text-xs font-semibold text-red-600">{trackError}</p>}
              <button
                type="submit"
                disabled={trackingLoading}
                className="w-full rounded-xl bg-brand-green py-2.5 text-xs font-extrabold text-white hover:bg-brand-dark transition disabled:opacity-50"
              >
                {trackingLoading ? "Searching..." : "Track Live Status"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
