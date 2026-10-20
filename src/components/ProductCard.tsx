"use client";

import { useState } from "react";
import { Plus, Minus, Clock, Apple, Leaf } from "lucide-react";
import type { Product } from "@/lib/types";
import { useShop } from "@/lib/store/shop-store";
import { APP_CONFIG } from "@/lib/config/app-config";
import { formatWeight } from "@/lib/utils/delivery";

export function ProductCard({ product }: { product: Product }) {
  const { cart, addToCart, updateCartWeight } = useShop();

  const [selectedWeightKg, setSelectedWeightKg] = useState<number>(0.5);

  const productIdStr = String(product.id);
  const cartItem = cart.find(
    (item: any) => String(item.product?.id ?? item.id) === productIdStr
  );
  const currentWeightInCart = cartItem ? cartItem.weight_kg : 0;
  const displayPrice = Math.round(product.price_per_kg * selectedWeightKg);

  const isFruit = product.category === "fruit";

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-gray-100 hover:shadow-md hover:ring-brand-green/35 transition-all duration-200">
      <div>
        {/* Category Sticker/Icon Container (No Unsplash Images) */}
        <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-md bg-white/90 backdrop-blur-sm px-1.5 py-0.5 text-[10px] font-bold text-gray-700 shadow-xs">
            <Clock className="h-2.5 w-2.5 text-brand-green" />
            <span>12 MINS</span>
          </div>

          {/* Clean Fruit/Veggie Sticker Icon */}
          <div className={`flex items-center justify-center w-16 h-16 rounded-full shadow-inner ${isFruit ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
            {isFruit ? (
              <Apple className="h-8 w-8 transition-transform group-hover:scale-110 duration-300" />
            ) : (
              <Leaf className="h-8 w-8 transition-transform group-hover:scale-110 duration-300" />
            )}
          </div>

          {!product.in_stock && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-xs">
              <span className="rounded-lg bg-red-600 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white shadow">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-green">
            {product.category}
          </span>
          <span className="text-[11px] font-semibold text-gray-500">
            Rs. {product.price_per_kg}/kg
          </span>
        </div>

        <h3 className="text-sm font-extrabold text-gray-900 line-clamp-1">
          {product.name}
        </h3>
      </div>

      <div className="mt-3 pt-2.5 border-t border-gray-100">
        <select
          aria-label={`Select weight for ${product.name}`}
          value={selectedWeightKg}
          onChange={(e) => setSelectedWeightKg(parseFloat(e.target.value))}
          disabled={!product.in_stock}
          className="mb-2.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-2 text-xs font-bold text-gray-700 focus:border-brand-green focus:bg-white focus:outline-none"
        >
          {APP_CONFIG.weightOptions.map((opt) => (
            <option key={opt.valueKg} value={opt.valueKg}>
              {opt.label} - Rs. {Math.round(product.price_per_kg * opt.valueKg)}
            </option>
          ))}
        </select>

        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="block text-[10px] text-gray-400 font-medium">Price</span>
            <span className="text-base font-black text-gray-900">
              Rs.{" "}
              {currentWeightInCart > 0
                ? Math.round(product.price_per_kg * currentWeightInCart)
                : displayPrice}
            </span>
          </div>

          {!product.in_stock ? (
            <button
              type="button"
              disabled
              className="rounded-xl bg-gray-100 px-3.5 py-2 text-xs font-bold text-gray-400 cursor-not-allowed"
            >
              Unavailable
            </button>
          ) : currentWeightInCart === 0 ? (
            <button
              type="button"
              onClick={() => addToCart(product, selectedWeightKg)}
              className="rounded-xl border-2 border-brand-green bg-brand-light px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-brand-green hover:bg-brand-green hover:text-white active:scale-95 transition"
            >
              ADD
            </button>
          ) : (
            <div className="flex items-center rounded-xl bg-brand-green text-white shadow-sm">
              <button
                type="button"
                onClick={() =>
                  updateCartWeight(
                    productIdStr,
                    currentWeightInCart - APP_CONFIG.weightStepKg
                  )
                }
                className="px-2.5 py-2 hover:bg-brand-dark rounded-l-xl transition"
                title="Decrease weight"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="px-2 text-xs font-extrabold min-w-[46px] text-center">
                {formatWeight(currentWeightInCart)}
              </span>
              <button
                type="button"
                onClick={() =>
                  updateCartWeight(
                    productIdStr,
                    currentWeightInCart + APP_CONFIG.weightStepKg
                  )
                }
                className="px-2.5 py-2 hover:bg-brand-dark rounded-r-xl transition"
                title="Increase weight"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}