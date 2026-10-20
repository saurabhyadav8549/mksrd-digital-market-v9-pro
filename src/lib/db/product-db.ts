import fs from "fs";
import path from "path";
import type {
  Product,
  ProductPatch,
  OrderRecord,
  OrderStatus,
  UserAccount,
} from "@/lib/types";

export const SEED_PRODUCTS: Product[] = [
  {
    id: "veg-1",
    name: "Fresh Potato (Aalu)",
    category: "vegetable",
    price_per_kg: 30,
    in_stock: true,
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "veg-2",
    name: "Red Onion (Pyaaz)",
    category: "vegetable",
    price_per_kg: 40,
    in_stock: true,
    image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "veg-3",
    name: "Desi Tomato (Tamatar)",
    category: "vegetable",
    price_per_kg: 40,
    in_stock: true,
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "veg-4",
    name: "Green Chilli (Hari Mirch)",
    category: "vegetable",
    price_per_kg: 80,
    in_stock: true,
    image: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "veg-5",
    name: "Fresh Ginger (Adrak)",
    category: "vegetable",
    price_per_kg: 120,
    in_stock: true,
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "veg-6",
    name: "Garlic (Lehsun)",
    category: "vegetable",
    price_per_kg: 200,
    in_stock: true,
    image: "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "veg-7",
    name: "Cauliflower (Phool Gobhi)",
    category: "vegetable",
    price_per_kg: 50,
    in_stock: true,
    image: "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "veg-8",
    name: "Green Peas (Matar)",
    category: "vegetable",
    price_per_kg: 60,
    in_stock: true,
    image: "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "veg-9",
    name: "Lady Finger (Bhindi)",
    category: "vegetable",
    price_per_kg: 50,
    in_stock: true,
    image: "https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "veg-10",
    name: "Bottle Gourd (Lauki)",
    category: "vegetable",
    price_per_kg: 30,
    in_stock: true,
    image: "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "frt-1",
    name: "Fresh Banana (Kela)",
    category: "fruit",
    price_per_kg: 60,
    in_stock: true,
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "frt-2",
    name: "Kashmiri Apple (Seb)",
    category: "fruit",
    price_per_kg: 160,
    in_stock: true,
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "frt-3",
    name: "Sweet Papaya (Papita)",
    category: "fruit",
    price_per_kg: 50,
    in_stock: true,
    image: "https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "frt-4",
    name: "Pomegranate (Anaar)",
    category: "fruit",
    price_per_kg: 180,
    in_stock: true,
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=60",
  },
];

const DATA_DIR = path.join(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

let memoryProducts: Product[] = [...SEED_PRODUCTS];
let memoryUsers: Record<string, UserAccount> = {};
let memoryOrders: OrderRecord[] = [];

// ==========================================
// 1. PRODUCTS DB FUNCTIONS
// ==========================================
function ensureProductsLoaded(): Product[] {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const raw = fs.readFileSync(PRODUCTS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryProducts = parsed.map((p: any) => ({
          ...p,
          id: String(p.id),
          price_per_kg: Number(p.price_per_kg ?? p.price ?? 0),
          in_stock: Boolean(p.in_stock ?? true),
        }));
        return memoryProducts;
      }
    }
  } catch {
    // Fallback to in-memory seed products
  }
  return memoryProducts;
}

function saveProductsToDisk(products: Product[]): void {
  memoryProducts = products;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf-8");
  } catch {}
}

export async function getProducts(): Promise<Product[]> {
  return ensureProductsLoaded();
}

export const getAllProducts = getProducts;

export async function updateProduct(
  id: string | number,
  updates: ProductPatch
): Promise<Product | null> {
  const products = ensureProductsLoaded();
  const targetId = String(id);
  const index = products.findIndex((p) => String(p.id) === targetId);

  if (index === -1) {
    return null;
  }

  const updated: Product = {
    ...products[index],
    ...updates,
    id: String(products[index].id),
  };

  products[index] = updated;
  saveProductsToDisk(products);
  return updated;
}

export const updateProductById = updateProduct;

// ==========================================
// 2. USERS DB FUNCTIONS
// ==========================================
function ensureUsersLoaded(): Record<string, UserAccount> {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const raw = fs.readFileSync(USERS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        memoryUsers = parsed;
        return memoryUsers;
      }
    }
  } catch {}
  return memoryUsers;
}

function saveUsersToDisk(users: Record<string, UserAccount>): void {
  memoryUsers = users;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  } catch {}
}

export async function getUserByPhone(phone: string): Promise<UserAccount | null> {
  const users = ensureUsersLoaded();
  const cleanPhone = String(phone).replace(/\D/g, "").slice(-10);
  return users[cleanPhone] || null;
}

export async function saveUserProfile(profile: {
  phone: string;
  name: string;
  address: string;
}): Promise<UserAccount> {
  const users = ensureUsersLoaded();
  const cleanPhone = String(profile.phone).replace(/\D/g, "").slice(-10);
  const existing = users[cleanPhone];

  const userRecord: UserAccount = {
    phone: cleanPhone,
    name: profile.name.trim(),
    address: profile.address.trim(),
    created_at: existing?.created_at || new Date().toISOString(),
  };

  users[cleanPhone] = userRecord;
  saveUsersToDisk(users);
  return userRecord;
}

export const upsertUserProfile = saveUserProfile;
export const saveUserAccount = saveUserProfile;

// ==========================================
// 3. ORDERS DB FUNCTIONS
// ==========================================
function ensureOrdersLoaded(): OrderRecord[] {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const raw = fs.readFileSync(ORDERS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        memoryOrders = parsed;
        return memoryOrders;
      }
    }
  } catch {}
  return memoryOrders;
}

function saveOrdersToDisk(orders: OrderRecord[]): void {
  memoryOrders = orders;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
  } catch {}
}

export async function getOrders(phone?: string | null): Promise<OrderRecord[]> {
  const orders = ensureOrdersLoaded();
  if (phone) {
    const cleanPhone = String(phone).replace(/\D/g, "").slice(-10);
    return orders.filter(
      (o) => String(o.customer_phone || "").replace(/\D/g, "").slice(-10) === cleanPhone
    );
  }
  return orders;
}

export const getAllOrders = getOrders;
export const getOrdersByPhone = getOrders;

export async function createOrder(orderData: Partial<OrderRecord> & Record<string, any>): Promise<OrderRecord> {
  const orders = ensureOrdersLoaded();
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

  const newOrder: OrderRecord = {
    receipt_id: orderData.receipt_id || `MKS-${Math.floor(100000 + Math.random() * 900000)}`,
    order_date: orderData.order_date || dateStr,
    timestamp: orderData.timestamp || `${dateStr}, ${timeStr}`,
    created_at: orderData.created_at || now.toISOString(),
    customer_name: orderData.customer_name || "Customer",
    customer_phone: String(orderData.customer_phone || "").replace(/\D/g, "").slice(-10),
    customer_address: orderData.customer_address || orderData.delivery_address || "",
    distance_km: Number(orderData.distance_km ?? 1),
    items: Array.isArray(orderData.items) ? orderData.items : [],
    subtotal: Number(orderData.subtotal ?? 0),
    delivery_charge: Number(orderData.delivery_charge ?? 0),
    grand_total: Number(orderData.grand_total ?? orderData.total_amount ?? 0),
    total_amount: Number(orderData.grand_total ?? orderData.total_amount ?? 0),
    status: (orderData.status as OrderStatus) || "Pending",
  };

  const updatedOrders = [newOrder, ...orders];
  saveOrdersToDisk(updatedOrders);
  return newOrder;
}

export const addOrder = createOrder;
export const saveOrder = createOrder;

export async function updateOrderStatus(
  receiptId: string,
  status: OrderStatus
): Promise<OrderRecord | null> {
  const orders = ensureOrdersLoaded();
  const index = orders.findIndex((o) => o.receipt_id === receiptId);
  if (index === -1) {
    return null;
  }

  orders[index] = {
    ...orders[index],
    status,
  };
  saveOrdersToDisk(orders);
  return orders[index];
}