import { createClient } from "@supabase/supabase-js";
import { SEED_PRODUCTS } from "@/lib/data/seed-products";
import type { Product, ProductPatch, OrderRecord, OrderStatus, UserProfile } from "@/lib/types";
import { mkdir, readFile, writeFile } from "fs/promises";
import { ORDERS_FILE, USERS_FILE, RUNTIME_DIR } from "@/lib/db/paths";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- PRODUCTS (Supabase Cloud Database Connected with Auto-Seed) ---
export async function getProducts(): Promise<Product[]> {
  try {
    const { data: dbProducts, error } = await supabase.from("products").select("*");
    
    if (error) {
      console.error("Supabase fetch error:", error.message);
      return SEED_PRODUCTS.map((item) => ({ ...item }));
    }

    // Agar table khali hai, toh saare 45 SEED_PRODUCTS apne aap insert ho jayenge!
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
    console.error("Error getting products from Supabase:", err);
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

  // Direct Update / Upsert in Supabase Table
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

// --- USERS & ORDERS (File-system fallback) ---
let persistChain = Promise.resolve();

async function persistFiles(orders: OrderRecord[], users: UserProfile[]) {
  persistChain = persistChain.then(async () => {
    try {
      await mkdir(RUNTIME_DIR, { recursive: true });
      await writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf8");
      await writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
    } catch (err) {
      console.error("Runtime persistence warning:", err);
    }
  });
  await persistChain;
}

export async function getUsers(): Promise<UserProfile[]> {
  await mkdir(RUNTIME_DIR, { recursive: true });
  try {
    const raw = await readFile(USERS_FILE, "utf8");
    return JSON.parse(raw) as UserProfile[];
  } catch {
    return [];
  }
}

export async function getUserByPhone(phone: string): Promise<UserProfile | null> {
  const cleanPhone = phone.replace(/\D/g, "").slice(-10);
  const users = await getUsers();
  const found = users.find((u) => u.phone === cleanPhone);
  return found ? { ...found } : null;
}

export async function saveUserProfile(profile: { phone: string; name: string; address: string }): Promise<UserProfile> {
  const cleanPhone = profile.phone.replace(/\D/g, "").slice(-10);
  const users = await getUsers();
  const existingIdx = users.findIndex((u) => u.phone === cleanPhone);

  const record: UserProfile = {
    phone: cleanPhone,
    name: profile.name.trim(),
    address: profile.address.trim(),
    created_at: existingIdx > -1 ? users[existingIdx].created_at : new Date().toISOString(),
  };

  if (existingIdx > -1) {
    users[existingIdx] = record;
  } else {
    users.push(record);
  }

  await persistFiles(await getOrders(), users);
  return { ...record };
}

export async function getOrders(): Promise<OrderRecord[]> {
  await mkdir(RUNTIME_DIR, { recursive: true });
  try {
    const raw = await readFile(ORDERS_FILE, "utf8");
    return JSON.parse(raw) as OrderRecord[];
  } catch {
    return [];
  }
}

export async function createOrder(order: OrderRecord): Promise<OrderRecord> {
  const orders = await getOrders();
  const cleanPhone = order.customer_phone.replace(/\D/g, "").slice(-10);
  const normalizedOrder: OrderRecord = {
    ...order,
    customer_phone: cleanPhone,
    order_date: order.order_date || new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
  };
  orders.unshift(normalizedOrder);

  if (cleanPhone.length === 10 && order.customer_name && order.customer_address) {
    await saveUserProfile({
      phone: cleanPhone,
      name: order.customer_name,
      address: order.customer_address,
    });
  } else {
    await persistFiles(orders, await getUsers());
  }

  return { ...normalizedOrder };
}

export async function updateOrderStatus(
  receiptId: string,
  status: OrderStatus
): Promise<OrderRecord | null> {
  const orders = await getOrders();
  const index = orders.findIndex((o) => o.receipt_id === receiptId);
  if (index === -1) return null;

  orders[index].status = status;
  await persistFiles(orders, await getUsers());
  return { ...orders[index] };
}

