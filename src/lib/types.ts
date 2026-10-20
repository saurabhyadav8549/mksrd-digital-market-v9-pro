export interface Product {
  id: string;
  name: string;
  price_per_kg: number;
  in_stock: boolean;
  category: "vegetable" | "fruit" | string;
  image?: string;
}

export interface ProductPatch {
  price_per_kg?: number;
  in_stock?: boolean;
  image?: string;
}

export type OrderStatus = "Pending" | "Confirmed" | "Out for Delivery" | "Delivered" | "Cancelled";

export interface OrderRecord {
  receipt_id: string;
  customer_phone: string;
  customer_name: string;
  customer_address: string;
  items: {
    product: Product;
    weight_kg: number;
    total_price: number;
  }[];
  total_amount: number;
  status: OrderStatus;
  order_date: string;
  timestamp: string;
  distance_km?: number;
  subtotal?: number;
  delivery_fee?: number;
  delivery_reason?: string;
  grand_total?: number;
}

export interface UserProfile {
  phone: string;
  name: string;
  address: string;
  created_at: string;
}