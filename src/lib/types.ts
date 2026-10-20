export type ProductCategory = "vegetable" | "fruit" | string;

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price_per_kg: number;
  price?: number;
  in_stock: boolean;
  image?: string;
  weight_kg?: number;
  description?: string;
}

export interface ProductPatch {
  price_per_kg?: number;
  in_stock?: boolean;
  name?: string;
  image?: string;
  category?: ProductCategory;
}

export interface CartItem {
  product: Product;
  id?: string;
  weight_kg: number;
}

export interface OrderItem {
  product?: Product;
  product_id?: string;
  name?: string;
  price_per_kg?: number;
  weight_kg: number;
  total_price?: number;
  line_total?: number;
  quantity?: number;
}

export type OrderStatus = "Pending" | "Out for Delivery" | "Delivered";

export interface OrderRecord {
  id?: string | number;
  receipt_id: string;
  created_at?: string;
  order_date?: string;
  timestamp?: string;
  subtotal?: number;
  delivery_charge?: number;
  grand_total?: number;
  total_amount?: number;
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  delivery_address?: string;
  distance_km?: number;
  status: OrderStatus;
  items: OrderItem[];
}

export interface NewOrderPayload {
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  distance_km?: number;
  items: OrderItem[];
  subtotal?: number;
  delivery_charge?: number;
  grand_total?: number;
}

export interface OrderStatusPatch {
  receipt_id: string;
  status: OrderStatus;
}

export interface UserAccount {
  phone: string;
  name: string;
  address: string;
  created_at?: string;
}