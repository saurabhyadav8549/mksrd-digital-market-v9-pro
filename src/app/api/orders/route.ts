import { NextRequest, NextResponse } from "next/server";
import { getOrders, createOrder, updateOrderStatus } from "@/lib/db/product-db";
import type { OrderRecord, OrderStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const receiptId = searchParams.get("receipt_id");
  const phone = searchParams.get("phone");

  const orders = await getOrders();

  if (receiptId) {
    const cleaned = receiptId.trim().replace(/^#/, "").toLowerCase();
    const found = orders.find((o) => o.receipt_id.toLowerCase() === cleaned);
    if (!found) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ order: found });
  }

  if (phone) {
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    const userOrders = orders.filter(
      (o) => o.customer_phone.replace(/\D/g, "").slice(-10) === cleanPhone
    );
    return NextResponse.json({ orders: userOrders });
  }

  return NextResponse.json({ orders });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as OrderRecord;
    const created = await createOrder(body);
    return NextResponse.json({ order: created }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as { receipt_id: string; status: OrderStatus };
    const updated = await updateOrderStatus(body.receipt_id, body.status);
    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ order: updated });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json({ error: "Failed to update order status" }, { status: 400 });
  }
}
