import { createClient } from "@supabase/supabase-js";
import { SEED_PRODUCTS } from "@/lib/data/seed-products";
import type { Product, ProductPatch, OrderRecord, OrderStatus, UserProfile } from "@/lib/types";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- 1. PRODUCTS ---
export async function getProducts(): Promise<Product[]> {
  try {
    const { data: dbProducts, error } = await supabase.from("products").select("*");
    
    if (error) {
      console.error("Supabase fetch error:", error.message);
      return SEED_PRODUCTS.map((item) => ({ ...item }));
    }

    // Auto-seed if table is empty
    if (!dbProducts || dbProducts.length === 0) {
      const seedPayload = SEED_PRODUCTS.map(p => ({
        id: p.id,
        price_per_kg: p.price_per_kg,
        in_stock: p.in_stock
      }));
      await supabase.from("products").upsert(seedPayload);
      return SEED_PRODUCTS.map((item) => ({ ...item }));
    }

    const dbMap = new Map((dbProducts || []).map((p: any) => [p.id, p]));

    return SEED_PRODUCTS.map((seedItem) => {
      const existing: any = dbMap.get(seedItem.id);
      if (existing) {
        return {
          ...seedItem,
          price_per_kg: Number(existing.price_per_kg),
          in_stock: Boolean(existing.in_stock),
        };
      }
      return { ...seedItem };
    });
  } catch (err) {
    console.error("Error getting products:", err);
    return SEED_PRODUCTS.map((item) => ({ ...item }));
  }
}

export async function updateProduct(
  id: string,
  patch: ProductPatch
): Promise<Product | null> {
  const products = await getProducts();
  const index = products.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const next = { ...products[index] };
  if (typeof patch.price_per_kg === "number" && Number.isFinite(patch.price_per_kg)) {
    next.price_per_kg = Math.max(0, Math.round(patch.price_per_kg * 100) / 100);
  }
  if (typeof patch.in_stock === "boolean") {
    next.in_stock = patch.in_stock;
  }

  const { error } = await supabase
    .from("products")
    .upsert({
      id: next.id,
      price_per_kg: next.price_per_kg,
      in_stock: next.in_stock,
    });

  if (error) {
    console.error("Supabase update error:", error.message);
    return null;
  }

  return { ...next };
}

// --- 2. USERS (Supabase Connected via Mobile Number) ---
export async function getUsers(): Promise<UserProfile[]> {
  try {
    const { data, error } = await supabase.from("users").select("*");
    if (error) throw error;
    return (data || []).map((u: any) => ({
      phone: u.phone,
      name: u.name,
      address: u.address,
      created_at: u.created_at,
    }));
  } catch (err) {
    console.error("Error fetching users:", err);
    return [];
  }
}

export async function getUserByPhone(phone: string): Promise<UserProfile | null> {
  const cleanPhone = phone.replace(/\D/g, "").slice(-10);
  try {
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

export async function saveUserProfile(profile: { phone: string; name: string; address: string }): Promise<UserProfile> {
  const cleanPhone = profile.phone.replace(/\D/g, "").slice(-10);
  const existingUser = await getUserByPhone(cleanPhone);

  const record: UserProfile = {
    phone: cleanPhone,
    name: profile.name.trim(),
    address: profile.address.trim(),
    created_at: existingUser ? existingUser.created_at : new Date().toISOString(),
  };

  const { error } = await supabase.from("users").upsert(record);
  if (error) {
    console.error("Error saving user profile:", error.message);
  }

  return record;
}

// --- 3. ORDERS (Supabase Connected with Full Type Support) ---
export async function getOrders(): Promise<OrderRecord[]> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("order_date", { ascending: false });

    if (error) throw error;
    return (data || []).map((o: any) => ({
      receipt_id: o.receipt_id,
      customer_phone: o.customer_phone,
      customer_name: o.customer_name,
      customer_address: o.customer_address,
      items: typeof o.items === "string" ? JSON.parse(o.items) : o.items,
      total_amount: Number(o.total_amount),
      status: o.status as OrderStatus,
      order_date: o.order_date,
      timestamp: o.timestamp || Date.now(),
      distance_km: Number(o.distance_km || 0),
      subtotal: Number(o.subtotal || o.total_amount),
      delivery_fee: Number(o.delivery_fee || 0),
    })) as OrderRecord[];
  } catch (err) {
    console.error("Error fetching orders:", err);
    return [];
  }
}

export async function createOrder(order: OrderRecord): Promise<OrderRecord> {
  const cleanPhone = order.customer_phone.replace(/\D/g, "").slice(-10);
  const normalizedOrder: OrderRecord = {
    ...order,
    customer_phone: cleanPhone,
    order_date: order.order_date || new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
  };

  // Save to Supabase orders table
  const { error } = await supabase.from("orders").insert({
    receipt_id: normalizedOrder.receipt_id,
    customer_phone: normalizedOrder.customer_phone,
    customer_name: normalizedOrder.customer_name,
    customer_address: normalizedOrder.customer_address,
    items: normalizedOrder.items,
    total_amount: normalizedOrder.total_amount,
    status: normalizedOrder.status,
    order_date: normalizedOrder.order_date,
    timestamp: normalizedOrder.timestamp,
    distance_km: normalizedOrder.distance_km,
    subtotal: normalizedOrder.subtotal,
    delivery_fee: normalizedOrder.delivery_fee,
  });

  if (error) {
    console.error("Error creating order in Supabase:", error.message);
  }

  // Also save/update user profile automatically using unique mobile number
  if (cleanPhone.length === 10 && order.customer_name && order.customer_address) {
    await saveUserProfile({
      phone: cleanPhone,
      name: order.customer_name,
      address: order.customer_address,
    });
  }

  return normalizedOrder;
}

export async function updateOrderStatus(
  receiptId: string,
  status: OrderStatus
): Promise<OrderRecord | null> {
  try {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("receipt_id", receiptId);

    if (error) throw error;

    const orders = await getOrders();
    const updated = orders.find((o) => o.receipt_id === receiptId);
    return updated || null;
  } catch (err) {
    console.error("Error updating order status:", err);
    return null;
  }
}
