import fs from "fs";
import path from "path";
import type { Product } from "@/lib/types";

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

let memoryProducts: Product[] = [...SEED_PRODUCTS];

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
    // Fallback to in-memory seed products on serverless/Vercel read-only environments
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
  } catch {
    // Ignore write errors in read-only Vercel runtime; memoryProducts stays updated
  }
}

export async function getProducts(): Promise<Product[]> {
  return ensureProductsLoaded();
}

export async function getAllProducts(): Promise<Product[]> {
  return ensureProductsLoaded();
}

export async function updateProduct(
  id: string | number,
  updates: Partial<Pick<Product, "price_per_kg" | "in_stock" | "name" | "image">>
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