import { mkdir, readFile, writeFile } from "fs/promises";
import { SEED_PRODUCTS } from "@/lib/data/seed-products";
import { PRODUCTS_FILE, ORDERS_FILE, USERS_FILE, RUNTIME_DIR } from "@/lib/db/paths";
import type { Product, ProductPatch, OrderRecord, OrderStatus, UserProfile } from "@/lib/types";

let productCache: Product[] | null = null;
let orderCache: OrderRecord[] | null = null;
let userCache: UserProfile[] | null = null;
let persistChain = Promise.resolve();

async function persistFiles(products: Product[], orders: OrderRecord[], users: UserProfile[]) {
  persistChain = persistChain.then(async () => {
    try {
      await mkdir(RUNTIME_DIR, { recursive: true });
      await writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf8");
      await writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf8");
      await writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
    } catch (err) {
      console.error("Runtime persistence warning:", err);
    }
  });
  await persistChain;
}

export async function getUsers(): Promise<UserProfile[]> {
  if (userCache) return userCache.map((u) => ({ ...u }));
  await mkdir(RUNTIME_DIR, { recursive: true });
  try {
    const raw = await readFile(USERS_FILE, "utf8");
    userCache = JSON.parse(raw) as UserProfile[];
  } catch {
    userCache = [];
  }
  return userCache.map((u) => ({ ...u }));
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

  userCache = users;
  await persistFiles(await getProducts(), await getOrders(), users);
  return { ...record };
}

export async function getProducts(): Promise<Product[]> {
  if (productCache) return productCache.map((item) => ({ ...item }));

  await mkdir(RUNTIME_DIR, { recursive: true });
  try {
    const raw = await readFile(PRODUCTS_FILE, "utf8");
    const parsed = JSON.parse(raw) as Product[];
    const parsedMap = new Map(parsed.map((p) => [p.id, p]));

    productCache = SEED_PRODUCTS.map((seedItem) => {
      const existing = parsedMap.get(seedItem.id);
      if (existing) {
        return {
          ...seedItem,
          price_per_kg: existing.price_per_kg,
          in_stock: existing.in_stock,
        };
      }
      return { ...seedItem };
    });

    await persistFiles(productCache, await getOrders(), await getUsers());
  } catch {
    productCache = SEED_PRODUCTS.map((item) => ({ ...item }));
    await persistFiles(productCache, [], []);
  }

  return productCache.map((item) => ({ ...item }));
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

  products[index] = next;
  productCache = products;
  await persistFiles(products, await getOrders(), await getUsers());
  return { ...next };
}

export async function getOrders(): Promise<OrderRecord[]> {
  if (orderCache) return orderCache.map((o) => ({ ...o }));

  await mkdir(RUNTIME_DIR, { recursive: true });
  try {
    const raw = await readFile(ORDERS_FILE, "utf8");
    orderCache = JSON.parse(raw) as OrderRecord[];
  } catch {
    orderCache = [];
  }
  return orderCache.map((o) => ({ ...o }));
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
  orderCache = orders;

  if (cleanPhone.length === 10 && order.customer_name && order.customer_address) {
    await saveUserProfile({
      phone: cleanPhone,
      name: order.customer_name,
      address: order.customer_address,
    });
  } else {
    await persistFiles(await getProducts(), orders, await getUsers());
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
  orderCache = orders;
  await persistFiles(await getProducts(), orders, await getUsers());
  return { ...orders[index] };
}