"use client";

import { useState, useEffect } from "react";
import { X, Trash2, Plus, Minus, MapPin, Receipt, Truck, ArrowRight, UserCheck } from "lucide-react";
import { useShop } from "@/lib/store/shop-store";
import { APP_CONFIG } from "@/lib/config/app-config";
import { formatWeight } from "@/lib/utils/delivery";

export function CartDrawer() {
  const {
    cart,
    products,
    isCartOpen,
    setIsCartOpen,
    currentUser,
    updateCartWeight,
    removeFromCart,
    distanceKm,
    setDistanceKm,
    cartSubtotal,
    deliveryInfo,
    cartGrandTotal,
    placeOrder,
  } = useShop();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setCustomerName(currentUser.name);
      setCustomerPhone(currentUser.phone);
      setCustomerAddress(currentUser.address);
    }
  }, [currentUser, isCartOpen]);

  if (!isCartOpen) return null;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = customerPhone.replace(/\D/g, "");
    if (!customerName.trim() || cleanPhone.length !== 10 || !customerAddress.trim()) {
      setFormError("Please fill in your Name, valid 10-Digit Mobile Number, and Delivery Address.");
      return;
    }
    setFormError("");
    setSubmitting(true);

    const order = await placeOrder({
      name: customerName,
      phone: cleanPhone,
      address: customerAddress,
    });

    setSubmitting(false);
    if (order) {
      setIsCartOpen(false);
    }
  };

  const amountForFreeDelivery = Math.max(
    0,
    APP_CONFIG.deliveryRules.freeOrderSubtotalThresholdRs + 1 - cartSubtotal
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
      <div className="relative flex h-full w-full max-w-md flex-col bg-gray-50 shadow-2xl">
        <div className="flex items-center justify-between bg-white px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">My Basket</h2>
            <p className="text-xs text-gray-500">
              Custom fractional weights enabled (250g steps)
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            className="rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="mb-3 rounded-full bg-green-50 p-4 text-brand-green">
              <Receipt className="h-10 w-10" />
            </div>
            <p className="text-base font-bold text-gray-800">Your basket is empty</p>
            <p className="mt-1 text-xs text-gray-500">
              Add fresh vegetables and fruits to generate your instant digital rashid.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!deliveryInfo.isFree && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 flex items-center gap-2">
                <Truck className="h-4 w-4 text-amber-600 shrink-0" />
                <span>
                  Add items worth <strong>Rs. {amountForFreeDelivery}</strong> more for{" "}
                  <strong>FREE Delivery</strong> (or if within 1 km)!
                </span>
              </div>
            )}

            <div className="rounded-2xl bg-white p-3 shadow-sm space-y-3">
              {cart.map((item) => {
                const latest = products.find((p) => p.id === item.product.id) || item.product;
                const itemPrice = Math.round(latest.price_per_kg * item.weight_kg);

                return (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between gap-3 border-b border-gray-50 pb-3 last:border-none last:pb-0"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 text-brand-green font-black text-xs shrink-0">
                      {latest.category === "fruit" ? "FRT" : "VEG"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate">
                        {latest.name}
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        Rs. {latest.price_per_kg}/kg |{" "}
                        <strong className="text-brand-green">
                          {formatWeight(item.weight_kg)}
                        </strong>
                      </p>
                    </div>

                    <div className="flex items-center rounded-lg bg-brand-green text-white">
                      <button
                        type="button"
                        onClick={() =>
                          updateCartWeight(
                            item.product.id,
                            item.weight_kg - APP_CONFIG.weightStepKg
                          )
                        }
                        className="p-1.5 hover:bg-brand-dark rounded-l-lg"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-2 text-xs font-bold">
                        {formatWeight(item.weight_kg)}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateCartWeight(
                            item.product.id,
                            item.weight_kg + APP_CONFIG.weightStepKg
                          )
                        }
                        className="p-1.5 hover:bg-brand-dark rounded-r-lg"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="text-right min-w-[54px]">
                      <p className="text-xs font-extrabold text-gray-900">
                        Rs. {itemPrice}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-[10px] text-red-500 hover:underline inline-flex items-center gap-0.5"
                      >
                        <Trash2 className="h-2.5 w-2.5" /> Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <form id="checkout-form" onSubmit={handleCheckout} className="rounded-2xl bg-white p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-brand-green" /> Home Delivery Setup
                </h3>
                {currentUser && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-green bg-green-50 px-2 py-0.5 rounded-full">
                    <UserCheck className="h-3 w-3" /> Auto-Filled from Account
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Delivery Distance from Shop (km):{" "}
                  <span className="font-extrabold text-brand-green">{distanceKm} km</span>
                </label>
                <input
                  type="range"
                  min="0.2"
                  max="5.0"
                  step="0.2"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(parseFloat(e.target.value))}
                  className="w-full accent-brand-green cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>0.2 km</span>
                  <span>1.0 km (Free Limit)</span>
                  <span>5.0 km</span>
                </div>
              </div>

              <div>
                <input
                  type="text"
                  required
                  placeholder="Full Name (e.g., Ramesh Kumar)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold focus:border-brand-green focus:outline-none"
                />
              </div>

              <div>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="10-Digit Mobile Number (Links to Account)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ""))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold focus:border-brand-green focus:outline-none"
                />
              </div>

              <div>
                <textarea
                  rows={2}
                  required
                  placeholder="Complete House No, Street / Landmark..."
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold focus:border-brand-green focus:outline-none"
                />
              </div>

              {formError && (
                <p className="text-xs font-semibold text-red-600">{formError}</p>
              )}
            </form>

            <div className="rounded-2xl bg-white p-4 shadow-sm space-y-2 text-xs">
              <h3 className="font-extrabold uppercase tracking-wider text-gray-500 mb-2">
                Bill Details (Rashid Preview)
              </h3>
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal</span>
                <span className="font-bold text-gray-900">Rs. {cartSubtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charge ({distanceKm} km)</span>
                <span className="font-bold text-brand-green">
                  {deliveryInfo.isFree ? "FREE (Rs. 0)" : `Rs. ${deliveryInfo.fee}`}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 italic">
                {deliveryInfo.reason}
              </p>
              <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between text-sm font-black text-gray-900">
                <span>Grand Total</span>
                <span>Rs. {cartGrandTotal}</span>
              </div>
            </div>
          </div>
        )}

        {cart.length > 0 && (
          <div className="bg-white p-4 border-t border-gray-100">
            <button
              type="submit"
              form="checkout-form"
              disabled={submitting}
              className="flex w-full items-center justify-between rounded-xl bg-brand-green px-5 py-3.5 text-white font-extrabold shadow-md hover:bg-brand-dark active:scale-95 transition disabled:opacity-50"
            >
              <div className="text-left">
                <span className="block text-[10px] uppercase tracking-wider opacity-85">
                  Total Payable
                </span>
                <span className="text-base">Rs. {cartGrandTotal}</span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-sm">
                <span>{submitting ? "Placing..." : "Place Order & Rashid"}</span>
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
