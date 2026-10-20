import { NextRequest, NextResponse } from "next/server";
import { getUserByPhone, saveUserProfile } from "@/lib/db/product-db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone");
  if (!phone) {
    return NextResponse.json({ exists: false, user: null }, { status: 400 });
  }
  const user = await getUserByPhone(phone);
  return NextResponse.json({ exists: Boolean(user), user }, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, name, address } = body;
    if (!phone || !name || !address) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const user = await saveUserProfile({ phone, name, address });
    return NextResponse.json({ ok: true, user }, { status: 200 });
  } catch (error) {
    console.error("Failed to save user:", error);
    return NextResponse.json({ error: "Failed to save user" }, { status: 500 });
  }
}