import { NextRequest, NextResponse } from "next/server";
import { updateProduct } from "@/lib/db/product-db";
import type { ProductPatch } from "@/lib/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = (await request.json()) as ProductPatch;
    const updated = await updateProduct(params.id, body);

    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product: updated });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
