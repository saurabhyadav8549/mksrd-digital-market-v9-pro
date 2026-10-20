"use client";

import { CheckCircle2, Printer, X, Phone, MapPin, Calendar, Receipt } from "lucide-react";
import { useShop } from "@/lib/store/shop-store";
import { APP_CONFIG } from "@/lib/config/app-config";
import { formatWeight } from "@/lib/utils/delivery";
import type { OrderRecord } from "@/lib/types";

interface ReceiptModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  activeReceipt?: OrderRecord | null;
}

export function ReceiptModal(props: ReceiptModalProps = {}) {
  const shop = useShop();

  const receipt = props.activeReceipt !== undefined ? props.activeReceipt : shop.activeReceipt;
  const isOpen = props.isOpen !== undefined ? props.isOpen : Boolean(receipt);
  const handleClose = props.onClose || (() => shop.setActiveReceipt(null));

  if (!isOpen || !receipt) return null;

  const grandTotal = Number(receipt.grand_total ?? receipt.total_amount ?? 0);
  const subtotal = Number(receipt.subtotal ?? grandTotal);
  const deliveryCharge = Number(receipt.delivery_charge ?? 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-100">
        <div className="bg-brand-green px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-brand-accent" />
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide">
                Official Digital Rashid
              </h2>
              <p className="text-[11px] text-green-100">{APP_CONFIG.brand.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full bg-white/15 p-1.5 text-white hover:bg-white/25 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          <div className="flex items-center justify-between border-b border-dashed border-gray-200 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400 block">
                Receipt ID
              </span>
              <span className="font-mono text-sm font-black text-brand-green">
                #{receipt.receipt_id}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-gray-400 block">
                Date & Time
              </span>
              <span className="font-semibold text-gray-700 inline-flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                {receipt.timestamp || receipt.order_date || "Just Now"}
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 p-3 border border-gray-100 space-y-1">
            <p className="font-extrabold text-gray-900">{receipt.customer_name}</p>
            <p className="text-gray-600 flex items-center gap-1.5">
              <Phone className="h-3 w-3 text-brand-green" /> +91 {receipt.customer_phone}
            </p>
            <p className="text-gray-600 flex items-start gap-1.5">
              <MapPin className="h-3 w-3 text-brand-green shrink-0 mt-0.5" />
              <span>
                {receipt.customer_address || receipt.delivery_address}
                {receipt.distance_km ? ` (${receipt.distance_km} km)` : ""}
              </span>
            </p>
          </div>

          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
              <Receipt className="h-3 w-3" /> Ordered Items ({receipt.items.length})
            </div>
            <div className="divide-y divide-gray-100 border-t border-b border-gray-100">
              {receipt.items.map((item: any, idx: number) => {
                const itemName = item.product?.name || item.name || "Mandi Item";
                const itemTotal = Number(item.total_price ?? item.line_total ?? 0);
                return (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-800">{itemName}</span>
                      <span className="ml-1.5 text-[11px] font-semibold text-brand-green">
                        ({formatWeight(item.weight_kg)})
                      </span>
                    </div>
                    <span className="font-extrabold text-gray-900">Rs. {itemTotal}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-gray-600">
              <span>Items Subtotal</span>
              <span className="font-bold">Rs. {subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Charge</span>
              <span className="font-bold">
                {deliveryCharge === 0 ? "FREE" : `Rs. ${deliveryCharge}`}
              </span>
            </div>
            <div className="flex justify-between text-sm font-black text-gray-900 border-t border-gray-200 pt-2">
              <span>Grand Total (COD / UPI)</span>
              <span className="text-brand-green">Rs. {grandTotal}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 py-2.5 text-xs font-extrabold text-gray-700 hover:bg-gray-100 transition"
            >
              <Printer className="h-3.5 w-3.5" /> Print Rashid
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-xl bg-brand-green py-2.5 text-xs font-extrabold text-white hover:bg-brand-dark transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReceiptModal;