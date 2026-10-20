import { createClient } from "@supabase/supabase-js";
import type {
  Product,
  ProductPatch,
  OrderRecord,
  OrderStatus,
  UserAccount,
} from "@/lib/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ouhuicqivhuvlhiakrup.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91aHVpY3Fpdmh1dmxoaWFrcnVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0MDg2ODEsImV4cCI6MjEwNzk4NDY4MX0.omZeFeIw3GGi7ww-hf3-ph53zN8UmX3g0xfc_mYbamg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ==========================================
// 1. PRODUCTS (Supabase 'products' table)
// ==========================================
export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase.from("products").select("*");
    if (error || !data || data.length === 0) {
      console.error("Supabase products fetch error:", error);
      return [];
    }

    return data.map((p: any) => {
      const rawId = String(p.id || "").toLowerCase();

      // Category detection from ID
      let category = "vegetable";
      if (rawId.includes("fruit")) {
        category = "fruit";
      } else if (rawId.includes("veg")) {
        category = "vegetable";
      }

      // Clean readable name from ID
      let cleanName = rawId
        .replace(/^(fruit-|veg-|vegetable-)/, "")
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      if (!cleanName) cleanName = "Mandi Item";

      return {
        id: rawId,
        name: cleanName,
        category: category,
        price_per_kg: Number(p.price_per_kg ?? 0),
        in_stock: Boolean(p.in_stock ?? true),
        image: "", // Blank rakha hai taaki card default category icon/badge use kare
      };
    });
  } catch (err) {
    console.error("Failed to connect to Supabase products:", err);
    return [];
  }
}

export const getAllProducts = getProducts;

export async function updateProduct(
  id: string | number,
  updates: ProductPatch
): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", String(id))
      .select()
      .single();

    if (error || !data) {
      console.error("Supabase product update error:", error);
      return null;
    }

    const rawId = String(data.id || "").toLowerCase();
    let category = rawId.includes("fruit") ? "fruit" : "vegetable";
    let cleanName = rawId
      .replace(/^(fruit-|veg-|vegetable-)/, "")
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return {
      id: rawId,
      name: cleanName || "Mandi Item",
      category: category,
      price_per_kg: Number(data.price_per_kg ?? 0),
      in_stock: Boolean(data.in_stock ?? true),
      image: "",
    };
  } catch (err) {
    console.error("Failed to update product in Supabase:", err);
    return null;
  }
}

export const updateProductById = updateProduct;

// ==========================================
// 2. USERS (Supabase 'users' table)
// ==========================================
export async function getUserByPhone(phone: string): Promise<UserAccount | null> {
  try {
    const cleanPhone = String(phone).replace(/\D/g, "").slice(-10);
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("phone", cleanPhone)
      .single();

    if (error || !data) return null;
    return {
      phone: data.phone,
      name: data.name,
      address: data.address,
      created_at: data.created_at,
    };
  } catch {
    return null;
  }
}

export async function saveUserProfile(profile: {
  phone: string;
  name: string;
  address: string;
}): Promise<UserAccount> {
  const cleanPhone = String(profile.phone).replace(/\D/g, "").slice(-10);
  const payload = {
    phone: cleanPhone,
    name: profile.name.trim(),
    address: profile.address.trim(),
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from("users")
      .upsert(payload, { onConflict: "phone" })
      .select()
      .single();

    if (error) {
      console.error("Supabase user profile save error:", error);
      return payload;
    }
    return {
      phone: data.phone,
      name: data.name,
      address: data.address,
      created_at: data.created_at,
    };
  } catch (err) {
    console.error("Failed to save user in Supabase:", err);
    return payload;
  }
}

export const upsertUserProfile = saveUserProfile;
export const saveUserAccount = saveUserProfile;

// ==========================================
// 3. ORDERS (Supabase 'orders' table)
// ==========================================
export async function getOrders(phone?: string | null): Promise<OrderRecord[]> {
  try {
    let query = supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (phone) {
      const cleanPhone = String(phone).replace(/\D/g, "").slice(-10);
      query = query.eq("customer_phone", cleanPhone);
    }
    const { data, error } = await query;
    if (error || !data) return [];

    return data.map((o: any) => ({
      receipt_id: o.receipt_id,
      timestamp: o.timestamp || o.created_at,
      customer_name: o.customer_name,
      customer_phone: o.customer_phone,
      customer_address: o.customer_address || o.delivery_address,
      distance_km: Number(o.distance_km ?? 1),
      items: o.items || [],
      subtotal: Number(o.subtotal ?? 0),
      delivery_charge: Number(o.delivery_charge ?? 0),
      delivery_fee: Number(o.delivery_fee ?? o.delivery_charge ?? 0),
      grand_total: Number(o.grand_total ?? o.total_amount ?? 0),
      status: o.status || "Pending",
    }));
  } catch (err) {
    console.error("Failed to fetch orders from Supabase:", err);
    return [];
  }
}

export const getAllOrders = getOrders;
export const getOrdersByPhone = getOrders;

export async function createOrder(orderData: any): Promise<OrderRecord> {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const newOrder = {
    receipt_id: orderData.receipt_id || `MKS-${Math.floor(100000 + Math.random() * 900000)}`,
    order_date: orderData.order_date || dateStr,
    timestamp: orderData.timestamp || `${dateStr}, ${timeStr}`,
    created_at: orderData.created_at || now.toISOString(),
    customer_name: orderData.customer_name || "Customer",
    customer_phone: String(orderData.customer_phone || "").replace(/\D/g, "").slice(-10),
    customer_address: orderData.customer_address || orderData.delivery_address || "",
    distance_km: Number(orderData.distance_km ?? 1),
    items: orderData.items || [],
    subtotal: Number(orderData.subtotal ?? 0),
    delivery_charge: Number(orderData.delivery_charge ?? 0),
    delivery_fee: Number(orderData.delivery_fee ?? orderData.delivery_charge ?? 0),
    grand_total: Number(orderData.grand_total ?? orderData.total_amount ?? 0),
    status: orderData.status || "Pending",
  };

  try {
    const { data, error } = await supabase.from("orders").insert([newOrder]).select().single();
    if (error) {
      console.error("Supabase order insert error:", error);
    } else if (data) {
      return {
        receipt_id: data.receipt_id,
        timestamp: data.timestamp,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        customer_address: data.customer_address,
        items: data.items,
        subtotal: Number(data.subtotal),
        delivery_charge: Number(data.delivery_charge),
        delivery_fee: Number(data.delivery_fee ?? data.delivery_charge),
        grand_total: Number(data.grand_total),
        status: data.status,
      };
    }
  } catch (err) {
    console.error("Failed to create order in Supabase:", err);
  }

  return newOrder;
}

export const addOrder = createOrder;
export const saveOrder = createOrder;

export async function updateOrderStatus(
  receiptId: string,
  status: OrderStatus
): Promise<OrderRecord | null> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("receipt_id", receiptId)
      .select()
      .single();

    if (error || !data) return null;
    return {
      receipt_id: data.receipt_id,
      timestamp: data.timestamp,
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      customer_address: data.customer_address,
      items: data.items,
      subtotal: Number(data.subtotal),
      delivery_charge: Number(data.delivery_charge),
      delivery_fee: Number(data.delivery_fee ?? data.delivery_charge),
      grand_total: Number(data.grand_total),
      status: data.status,
    };
  } catch {
    return null;
  }
}