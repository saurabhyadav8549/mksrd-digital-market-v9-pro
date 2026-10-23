"use client";

import { Printer, CheckCircle2, X, Clock, Truck } from "lucide-react";
import { useShop } from "@/lib/store/shop-store";
import { APP_CONFIG } from "@/lib/config/app-config";
import { formatWeight } from "@/lib/utils/delivery";

export function ReceiptModal() {
  const { activeReceipt, setActiveReceipt, trackOrder } = useShop();

  if (!activeReceipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleRefreshStatus = async () => {
    const updated = await trackOrder(activeReceipt.receipt_id);
    if (updated) {
      setActiveReceipt(updated);
    }
  };

  const statusColor =
    activeReceipt.status === "Delivered"
      ? "bg-green-100 text-brand-green border-green-200"
      : activeReceipt.status === "Out for Delivery"
      ? "bg-amber-100 text-amber-800 border-amber-200"
      : "bg-blue-100 text-blue-800 border-blue-200";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={() => setActiveReceipt(null)}
          className="print:hidden absolute right-4 top-4 rounded-full bg-gray-100 p-1.5 text-gray-500 hover:bg-gray-200"
        >
          <X className="h-4 w-4" />
        </button>

        <div className={`mb-4 print:hidden flex items-center justify-between rounded-xl border p-3 ${statusColor}`}>
          <div className="flex items-center gap-2">
            {activeReceipt.status === "Delivered" ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : activeReceipt.status === "Out for Delivery" ? (
              <Truck className="h-5 w-5 animate-bounce" />
            ) : (
              <Clock className="h-5 w-5" />
            )}
            <div>
              <p className="text-[10px] font-bold uppercase opacity-80">Live Order Status</p>
              <p className="text-xs font-black">{activeReceipt.status}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRefreshStatus}
            className="rounded-lg bg-white/80 hover:bg-white px-2.5 py-1 text-[11px] font-bold shadow-xs transition"
          >
            Check Status
          </button>
        </div>

        <div className="text-center border-b border-dashed border-gray-300 pb-4">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-brand-green print:hidden">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h2 className="text-base font-black uppercase tracking-wide text-gray-900">
            {APP_CONFIG.brand.name}
          </h2>
          <p className="text-xs text-gray-500">
            Official Digital Order Rashid / Cash Memo
          </p>
          <p className="mt-1 text-[11px] font-mono text-gray-500">
            Order ID: <strong>#{activeReceipt.receipt_id}</strong> |{" "}
            {activeReceipt.timestamp}
          </p>
        </div>

        <div className="my-3 border-b border-dashed border-gray-300 pb-3 text-xs space-y-1 text-gray-700">
          <p>
            <strong>Customer:</strong> {activeReceipt.customer_name} (
            {activeReceipt.customer_phone})
          </p>
          <p>
            <strong>Delivery Address:</strong> {activeReceipt.customer_address}
          </p>
          <p>
            <strong>Distance:</strong> {activeReceipt.distance_km} km
          </p>
        </div>

        <table className="w-full text-left text-xs border-b border-dashed border-gray-300 pb-3">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500">
              <th className="py-1.5">Item</th>
              <th className="py-1.5 text-center">Qty</th>
              <th className="py-1.5 text-right">Rate</th>
              <th className="py-1.5 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {activeReceipt.items.map((item, idx) => (
              <tr key={idx}>
                <td className="py-2 font-medium text-gray-900">{item.name}</td>
                <td className="py-2 text-center text-gray-600">
                  {formatWeight(item.weight_kg)}
                </td>
                <td className="py-2 text-right text-gray-600">
                  Rs. {item.price_per_kg}/kg
                </td>
                <td className="py-2 text-right font-bold text-gray-900">
                  Rs. {item.line_total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-3 space-y-1.5 text-xs">
          <div className="flex justify-between text-gray-600">
            <span>Items Subtotal:</span>
            <span className="font-bold">Rs. {activeReceipt.subtotal}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Delivery Charges:</span>
            <span className="font-bold text-brand-green">
              {activeReceipt.delivery_fee === 0
                ? "FREE (Rs. 0)"
                : `Rs. ${activeReceipt.delivery_fee}`}
            </span>
          </div>
          <p className="text-[10px] text-gray-400 italic">
            ({activeReceipt.delivery_reason})
          </p>
          <div className="flex justify-between border-t border-gray-300 pt-2 text-sm font-black text-gray-900">
            <span>GRAND TOTAL:</span>
            <span>Rs. {activeReceipt.grand_total}</span>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-gray-400">
          Thank you for shopping with {APP_CONFIG.brand.shortName}!
        </p>

        <div className="mt-5 flex gap-2 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-green py-2.5 text-xs font-extrabold text-white hover:bg-brand-dark transition"
          >
            <Printer className="h-4 w-4" /> Print / Save PDF Rashid
          </button>
          <button
            type="button"
            onClick={() => setActiveReceipt(null)}
            className="rounded-xl bg-gray-100 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
