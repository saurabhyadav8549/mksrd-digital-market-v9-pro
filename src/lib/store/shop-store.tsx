"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { CartItem, OrderReceipt, Product, ProductPatch, UserProfile } from "@/lib/types";
import { calculateDeliveryFee } from "@/lib/utils/delivery";

interface ShopContextValue {
  products: Product[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isAccountOpen: boolean;
  setIsAccountOpen: (open: boolean) => void;
  currentUser: UserProfile | null;
  userOrders: OrderReceipt[];
  userOrdersLoading: boolean;
  loginWithPhone: (phone: string) => Promise<{ exists: boolean; user: UserProfile | null }>;
  saveUserAccount: (profile: { phone: string; name: string; address: string }) => Promise<UserProfile | null>;
  logoutUser: () => void;
  refreshUserOrders: () => Promise<void>;
  distanceKm: number;
  setDistanceKm: (km: number) => void;
  activeReceipt: OrderReceipt | null;
  setActiveReceipt: (receipt: OrderReceipt | null) => void;
  addToCart: (product: Product, weightKg?: number) => void;
  updateCartWeight: (productId: string, newWeightKg: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  updateProductAdmin: (id: string, patch: ProductPatch) => Promise<boolean>;
  refreshProducts: () => Promise<void>;
  cartSubtotal: number;
  deliveryInfo: { fee: number; isFree: boolean; reason: string };
  cartGrandTotal: number;
  placeOrder: (customer: { name: string; phone: string; address: string }) => Promise<OrderReceipt | null>;
  trackOrder: (receiptId: string) => Promise<OrderReceipt | null>;
}

const ShopContext = createContext<ShopContextValue | undefined>(undefined);

const CART_STORAGE_KEY = "mksrd_cart_v9";
const USER_STORAGE_KEY = "mksrd_user_v9";
const BROADCAST_CHANNEL_NAME = "mksrd_catalog_sync_v9";

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [userOrders, setUserOrders] = useState<OrderReceipt[]>([]);
  const [userOrdersLoading, setUserOrdersLoading] = useState(false);
  const [distanceKm, setDistanceKm] = useState<number>(0.8);
  const [activeReceipt, setActiveReceipt] = useState<OrderReceipt | null>(null);

  const refreshProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrdersForPhone = useCallback(async (phone: string) => {
    if (!phone) return;
    setUserOrdersLoading(true);
    try {
      const res = await fetch(`/api/orders?phone=${encodeURIComponent(phone)}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUserOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Failed to fetch user orders:", err);
    } finally {
      setUserOrdersLoading(false);
    }
  }, []);

  const refreshUserOrders = useCallback(async () => {
    if (currentUser?.phone) {
      await fetchOrdersForPhone(currentUser.phone);
    }
  }, [currentUser, fetchOrdersForPhone]);

  useEffect(() => {
    refreshProducts();
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser) as UserProfile;
        setCurrentUser(parsedUser);
        fetchOrdersForPhone(parsedUser.phone);
      }
    } catch {}
  }, [refreshProducts, fetchOrdersForPhone]);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    if (!currentUser?.phone) return;
    const interval = setInterval(() => {
      fetchOrdersForPhone(currentUser.phone);
    }, 8000);
    return () => clearInterval(interval);
  }, [currentUser, fetchOrdersForPhone]);

  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;
    const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    channel.onmessage = () => {
      refreshProducts();
      if (currentUser?.phone) {
        fetchOrdersForPhone(currentUser.phone);
      }
    };
    return () => channel.close();
  }, [refreshProducts, currentUser, fetchOrdersForPhone]);

  const loginWithPhone = async (phone: string): Promise<{ exists: boolean; user: UserProfile | null }> => {
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    try {
      const res = await fetch(`/api/users?phone=${encodeURIComponent(cleanPhone)}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setCurrentUser(data.user);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
          await fetchOrdersForPhone(cleanPhone);
          return { exists: true, user: data.user };
        }
      }
    } catch (err) {
      console.error("Error checking user:", err);
    }
    return { exists: false, user: null };
  };

  const saveUserAccount = async (profile: { phone: string; name: string; address: string }): Promise<UserProfile | null> => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
        await fetchOrdersForPhone(data.user.phone);
        return data.user;
      }
    } catch (err) {
      console.error("Failed to save user account:", err);
    }
    return null;
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setUserOrders([]);
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {}
  };

  const addToCart = (product: Product, weightKg = 0.5) => {
    if (!product.in_stock) return;
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const nextWeight = Math.round((updated[existingIndex].weight_kg + weightKg) * 100) / 100;
        updated[existingIndex] = { ...updated[existingIndex], weight_kg: nextWeight };
        return updated;
      }
      return [...prev, { product, weight_kg: weightKg }];
    });
  };

  const updateCartWeight = (productId: string, newWeightKg: number) => {
    const rounded = Math.round(newWeightKg * 100) / 100;
    if (rounded <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, weight_kg: rounded } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => setCart([]);

  const updateProductAdmin = async (id: string, patch: ProductPatch): Promise<boolean> => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) return false;
      const data = await res.json();

      setProducts((prev) => prev.map((p) => (p.id === id ? data.product : p)));
      setCart((prev) =>
        prev.map((item) =>
          item.product.id === id ? { ...item, product: data.product } : item
        )
      );

      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        channel.postMessage({ type: "PRODUCT_UPDATED", id });
        channel.close();
      }
      return true;
    } catch (error) {
      console.error("Failed to update product:", error);
      return false;
    }
  };

  const cartSubtotal = Math.round(
    cart.reduce((sum, item) => {
      const latestProduct = products.find((p) => p.id === item.product.id) || item.product;
      return sum + latestProduct.price_per_kg * item.weight_kg;
    }, 0)
  );

  const deliveryInfo = calculateDeliveryFee(cartSubtotal, distanceKm);
  const cartGrandTotal = cartSubtotal > 0 ? cartSubtotal + deliveryInfo.fee : 0;

  const placeOrder = async (customer: { name: string; phone: string; address: string }): Promise<OrderReceipt | null> => {
    if (cart.length === 0) return null;

    const cleanPhone = customer.phone.replace(/\D/g, "").slice(-10);
    const now = new Date();
    const orderDate = now.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const newOrder: OrderReceipt = {
      receipt_id: `MKSRD-${Date.now().toString().slice(-6)}`,
      timestamp: now.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      order_date: orderDate,
      customer_name: customer.name.trim(),
      customer_phone: cleanPhone,
      customer_address: customer.address.trim(),
      distance_km: distanceKm,
      items: cart.map((item) => {
        const latest = products.find((p) => p.id === item.product.id) || item.product;
        return {
          name: latest.name,
          weight_kg: item.weight_kg,
          price_per_kg: latest.price_per_kg,
          line_total: Math.round(latest.price_per_kg * item.weight_kg),
        };
      }),
      subtotal: cartSubtotal,
      delivery_fee: deliveryInfo.fee,
      delivery_reason: deliveryInfo.reason,
      grand_total: cartGrandTotal,
      status: "Pending",
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveReceipt(data.order);
        clearCart();

        const updatedProfile: UserProfile = {
          phone: cleanPhone,
          name: customer.name.trim(),
          address: customer.address.trim(),
          created_at: currentUser?.created_at || new Date().toISOString(),
        };
        setCurrentUser(updatedProfile);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedProfile));
        await fetchOrdersForPhone(cleanPhone);

        return data.order;
      }
    } catch (err) {
      console.error("Failed to place order:", err);
    }
    return null;
  };

  const trackOrder = async (receiptId: string): Promise<OrderReceipt | null> => {
    const cleanedId = receiptId.trim().replace(/^#/, "");
    try {
      const res = await fetch(`/api/orders?receipt_id=${encodeURIComponent(cleanedId)}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.order) return data.order;
      }
    } catch (err) {
      console.error("Failed to track order:", err);
    }
    return null;
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        loading,
        searchQuery,
        setSearchQuery,
        cart,
        isCartOpen,
        setIsCartOpen,
        isAccountOpen,
        setIsAccountOpen,
        currentUser,
        userOrders,
        userOrdersLoading,
        loginWithPhone,
        saveUserAccount,
        logoutUser,
        refreshUserOrders,
        distanceKm,
        setDistanceKm,
        activeReceipt,
        setActiveReceipt,
        addToCart,
        updateCartWeight,
        removeFromCart,
        clearCart,
        updateProductAdmin,
        refreshProducts,
        cartSubtotal,
        deliveryInfo,
        cartGrandTotal,
        placeOrder,
        trackOrder,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
}
