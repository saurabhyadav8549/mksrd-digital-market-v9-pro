import { NextResponse } from "next/server";
import { getProducts, updateProduct } from "@/lib/db/product-db"; // Agar product-db ka path अलग ho (jaise @/lib/product-db), toh bas ye import path match kar lena

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { error: "Failed to load products", products: [] },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, price_per_kg, in_stock } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const updates: { price_per_kg?: number; in_stock?: boolean } = {};
    if (typeof price_per_kg === "number" && !Number.isNaN(price_per_kg)) {
      updates.price_per_kg = price_per_kg;
    }
    if (typeof in_stock === "boolean") {
      updates.in_stock = in_stock;
    }

    const updated = await updateProduct(String(id), updates);
    if (!updated) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, product: updated }, { status: 200 });
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export const PUT = PATCH;