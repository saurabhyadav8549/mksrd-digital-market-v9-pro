export type CategoryType = "vegetable" | "fruit";

export interface Product {
  id: string;
  name: string;
  price_per_kg: number;
  in_stock: boolean;
  category: CategoryType;
}

export interface ProductPatch {
  price_per_kg?: number;
  in_stock?: boolean;
}

export interface CartItem {
  product: Product;
  weight_kg: number;
}

export type OrderStatus = "Pending" | "Out for Delivery" | "Delivered";

export interface OrderRecord {
  receipt_id: string;
  timestamp: string;
  order_date?: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  distance_km: number;
  items: {
    name: string;
    weight_kg: number;
    price_per_kg: number;
    line_total: number;
  }[];
  subtotal: number;
  delivery_fee: number;
  delivery_reason: string;
  grand_total: number;
  status: OrderStatus;
}

export type OrderReceipt = OrderRecord;

export interface UserProfile {
  phone: string;
  name: string;
  address: string;
  created_at: string;
}
