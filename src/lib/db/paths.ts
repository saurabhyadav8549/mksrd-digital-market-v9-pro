import path from "path";

const isVercel = Boolean(process.env.VERCEL);

export const RUNTIME_DIR = isVercel
  ? path.join("/tmp", "mksrd-runtime-v9")
  : path.join(process.cwd(), "data", "runtime");

export const PRODUCTS_FILE = path.join(RUNTIME_DIR, "products-v9.json");
export const ORDERS_FILE = path.join(RUNTIME_DIR, "orders-v9.json");
export const USERS_FILE = path.join(RUNTIME_DIR, "users-v9.json");
