"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { useShop } from "@/lib/store/shop-store";
import { APP_CONFIG } from "@/lib/config/app-config";
import { Truck, Sparkles, Leaf, Apple, LayoutGrid, ShieldCheck } from "lucide-react";

const filters = [
  { id: "all", label: "All Items", icon: LayoutGrid },
  { id: "vegetable", label: "Fresh Vegetables", icon: Leaf },
  { id: "fruit", label: "Fresh Fruits", icon: Apple },
] as const;

export function ProductGrid() {
  const { products, loading, searchQuery } = useShop();
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");

  const visible = useMemo(() => {
    if (!products) return [];

    return products.filter((item) => {
      const categoryName = (item.category || "").toLowerCase();
      const filterName = filter.toLowerCase();
      const matchesCategory = filter === "all" || categoryName.includes(filterName);

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || item.name.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [products, filter, searchQuery]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-green-900 via-brand-green to-emerald-700 p-4 sm:p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-accent px-2.5 py-0.5 text-[11px] font-extrabold uppercase text-green-950 mb-2">
              <Sparkles className="h-3 w-3" /> 0% Image Mismatch Guarantee
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Farm-Fresh Mandi Produce at Wholesale Rates!
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-green-100 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-brand-accent" /> Custom weights starting from just <strong>250 grams</strong> with Customer Account & Live Tracking.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-white/15 backdrop-blur-sm p-3 border border-white/20">
            <Truck className="h-8 w-8 text-brand-accent shrink-0" />
            <div className="text-xs leading-relaxed">
              <p className="font-bold text-white">Smart Delivery Promise:</p>
              <p>- Under {APP_CONFIG.deliveryRules.freeDistanceThresholdKm} km: <strong>FREE Delivery</strong></p>
              <p>- Order &gt; Rs. {APP_CONFIG.deliveryRules.freeOrderSubtotalThresholdRs}: <strong>FREE Delivery</strong></p>
              <p>- Otherwise: <strong>Just Rs. {APP_CONFIG.deliveryRules.standardDeliveryFeeRs} only!</strong></p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-extrabold text-gray-900">
            Today&apos;s Fresh Mandi Basket
          </h2>
          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-brand-green">
            {visible.length} items
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={
                  filter === item.id
                    ? "inline-flex items-center gap-1.5 rounded-xl bg-brand-green px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-sm transition"
                    : "inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 transition"
                }
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div
              key={idx}
              className="h-72 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gray-100 animate-pulse"
            >
              <div className="aspect-square w-full rounded-xl bg-gray-200 mb-3" />
              <div className="h-4 w-2/3 bg-gray-200 rounded mb-2" />
              <div className="h-8 w-full bg-gray-100 rounded mt-4" />
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100">
          <p className="text-base font-bold text-gray-700">
            No matching fruits or vegetables found.
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Try clearing your search or switching category tabs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
