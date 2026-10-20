import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ouhuicqivhuvlhiakrup.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91aHVpY3Fpdmh1dmxoaWFrcnVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0MDg2ODEsImV4cCI6MjEwNzk4NDY4MX0.omZeFeIw3GGi7ww-hf3-ph53zN8UmX3g0xfc_mYbamg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// List of all 45 products without images (matching the clean database schema)
const INITIAL_PRODUCTS = [
  // Fruits
  { id: "fruit-apple", price_per_kg: 180, in_stock: true },
  { id: "fruit-banana", price_per_kg: 50, in_stock: true },
  { id: "fruit-chikoo", price_per_kg: 90, in_stock: true },
  { id: "fruit-custard-apple", price_per_kg: 140, in_stock: true },
  { id: "fruit-grapes", price_per_kg: 100, in_stock: true },
  { id: "fruit-guava", price_per_kg: 70, in_stock: true },
  { id: "fruit-litchi", price_per_kg: 160, in_stock: true },
  { id: "fruit-mango", price_per_kg: 120, in_stock: true },
  { id: "fruit-mosambi", price_per_kg: 70, in_stock: true },
  { id: "fruit-muskmelon", price_per_kg: 50, in_stock: true },
  { id: "fruit-orange", price_per_kg: 90, in_stock: true },
  { id: "fruit-papaya", price_per_kg: 40, in_stock: true },
  { id: "fruit-pomegranate", price_per_kg: 160, in_stock: true },
  { id: "fruit-pineapple", price_per_kg: 80, in_stock: true },
  { id: "fruit-watermelon", price_per_kg: 35, in_stock: true },
  { id: "fruit-kiwi", price_per_kg: 200, in_stock: true },
  { id: "fruit-pear", price_per_kg: 120, in_stock: true },
  { id: "fruit-plum", price_per_kg: 150, in_stock: true },
  { id: "fruit-peach", price_per_kg: 140, in_stock: true },
  { id: "fruit-strawberry", price_per_kg: 250, in_stock: true },
  { id: "fruit-dragon-fruit", price_per_kg: 220, in_stock: true },
  { id: "fruit-coconut", price_per_kg: 45, in_stock: true },

  // Vegetables
  { id: "veg-potato", price_per_kg: 30, in_stock: true },
  { id: "veg-onion", price_per_kg: 40, in_stock: true },
  { id: "veg-tomato", price_per_kg: 45, in_stock: true },
  { id: "veg-green-chilli", price_per_kg: 60, in_stock: true },
  { id: "veg-ginger", price_per_kg: 90, in_stock: true },
  { id: "veg-garlic", price_per_kg: 160, in_stock: true },
  { id: "veg-lemon", price_per_kg: 80, in_stock: true },
  { id: "veg-coriander", price_per_kg: 40, in_stock: true },
  { id: "veg-mint", price_per_kg: 50, in_stock: true },
  { id: "veg-cauliflower", price_per_kg: 40, in_stock: true },
  { id: "veg-cabbage", price_per_kg: 30, in_stock: true },
  { id: "veg-carrot", price_per_kg: 50, in_stock: true },
  { id: "veg-radish", price_per_kg: 30, in_stock: true },
  { id: "veg-beetroot", price_per_kg: 60, in_stock: true },
  { id: "veg-capsicum", price_per_kg: 70, in_stock: true },
  { id: "veg-brinjal", price_per_kg: 40, in_stock: true },
  { id: "veg-ladyfinger", price_per_kg: 50, in_stock: true },
  { id: "veg-bottle-gourd", price_per_kg: 35, in_stock: true },
  { id: "veg-bitter-gourd", price_per_kg: 50, in_stock: true },
  { id: "veg-ridge-gourd", price_per_kg: 45, in_stock: true },
  { id: "veg-sponge-gourd", price_per_kg: 40, in_stock: true },
  { id: "veg-french-beans", price_per_kg: 90, in_stock: true },
  { id: "veg-peas", price_per_kg: 100, in_stock: true },
];

export async function seedProducts() {
  console.log("Seeding products to Supabase...");
  for (const product of INITIAL_PRODUCTS) {
    const { error } = await supabase
      .from("products")
      .upsert(product, { onConflict: "id" });

    if (error) {
      console.error(`Error seeding ${product.id}:`, error.message);
    }
  }
  console.log("Products seeding completed successfully!");
}