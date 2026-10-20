import { NextRequest, NextResponse } from "next/server";
import { getOrders, createOrder, updateOrderStatus } from "@/lib/db/product-db";
import type { OrderStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone");
  const orders = await getOrders(phone);
  return NextResponse.json({ orders }, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const order = await createOrder(body);
    return NextResponse.json({ ok: true, order }, { status: 201 });
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { receipt_id, status } = body as { receipt_id: string; status: OrderStatus };
    if (!receipt_id || !status) {
      return NextResponse.json({ error: "Missing receipt_id or status" }, { status: 400 });
    }
    const updated = await updateOrderStatus(receipt_id, status);
    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, order: updated }, { status: 200 });
  } catch (error) {
    console.error("Failed to update order status:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}