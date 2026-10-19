import type { Metadata } from "next";
import "./globals.css";
import { ShopProvider } from "@/lib/store/shop-store";
import { APP_CONFIG } from "@/lib/config/app-config";

export const metadata: Metadata = {
  title: APP_CONFIG.brand.name,
  description: APP_CONFIG.brand.tagline,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <ShopProvider>{children}</ShopProvider>
      </body>
    </html>
  );
}
