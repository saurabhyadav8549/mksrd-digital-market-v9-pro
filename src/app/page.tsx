"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { ProductGrid } from "@/components/ProductGrid";
import { CartDrawer } from "@/components/CartDrawer";
import { UserAccountDrawer } from "@/components/UserAccountDrawer";
import ReceiptModal from "@/components/ReceiptModal";
import { APP_CONFIG } from "@/lib/config/app-config";
import type { OrderRecord } from "@/lib/types";

export default function HomePage() {
  const [activeReceipt, setActiveReceipt] = useState<OrderRecord | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <ProductGrid />
      </main>
      <CartDrawer />
      <UserAccountDrawer />
      <ReceiptModal
        isOpen={Boolean(activeReceipt)}
        onClose={() => setActiveReceipt(null)}
        activeReceipt={activeReceipt}
      />
      <footer className="mt-12 border-t border-gray-200 bg-white py-6 text-center text-xs text-gray-500">
        <p className="font-bold text-gray-800">{APP_CONFIG.brand.name}</p>
        <p className="mt-1">
          Zero-Cost Fast Digital Mandi | Fractional Ordering (250g+) | Instant Rashid & Customer Account
        </p>
      </footer>
    </div>
  );
}