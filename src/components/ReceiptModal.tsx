import React from "react";
import { OrderRecord, OrderItem } from "@/lib/types"; // Path apne project ke hisab se check kar lena

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeReceipt: OrderRecord | null;
}

export default function ReceiptModal({ isOpen, onClose, activeReceipt }: ReceiptModalProps) {
  if (!isOpen || !activeReceipt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Order Receipt</h3>
            <p className="text-xs text-gray-500">
              {activeReceipt.created_at ? new Date(activeReceipt.created_at).toLocaleString() : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Customer Details */}
        <div className="my-4 space-y-1 rounded-xl bg-gray-50 p-3 text-sm">
          <p className="font-semibold text-gray-800">
            Customer: <span className="font-normal text-gray-600">{activeReceipt.customer_name || "N/A"}</span>
          </p>
          <p className="font-semibold text-gray-800">
            Phone: <span className="font-normal text-gray-600">{activeReceipt.customer_phone || "N/A"}</span>
          </p>
          <p className="font-semibold text-gray-800">
            Address: <span className="font-normal text-gray-600">{activeReceipt.delivery_address || "N/A"}</span>
          </p>
          <p className="font-semibold text-gray-800">
            Status: <span className="font-normal text-gray-600">{activeReceipt.status || "Pending"}</span>
          </p>
        </div>

        {/* Items Table / List */}
        <div className="max-h-60 overflow-y-auto pr-1">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase">
              <tr>
                <th className="py-2">Item</th>
                <th className="py-2 text-center">Qty/Weight</th>
                <th className="py-2 text-right">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeReceipt.items?.map((item: OrderItem, idx: number) => (
                <tr key={idx}>
                  <td className="py-2 font-medium text-gray-900">
                    {item.product?.name || item.name || "Product"}
                  </td>
                  <td className="py-2 text-center text-gray-600">
                    {item.weight_kg < 1
                      ? `${Math.round(item.weight_kg * 1000)}g`
                      : `${item.weight_kg}kg`}
                  </td>
                  <td className="py-2 text-right font-medium text-gray-900">
                    Rs. {item.total_price || item.line_total || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Grand Total */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 text-base font-bold text-gray-900">
          <span>Grand Total:</span>
          <span className="text-brand-green">
            Rs. {Number(activeReceipt.grand_total || activeReceipt.total_amount || 0)}
          </span>
        </div>

        {/* Close Button */}
        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-slate-800 transition-colors"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
}