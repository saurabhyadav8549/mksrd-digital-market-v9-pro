import { NextRequest, NextResponse } from "next/server";
import { getUserByPhone, saveUserProfile } from "@/lib/db/product-db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone");

  if (!phone) {
    return NextResponse.json({ error: "Phone number required" }, { status: 400 });
  }

  const user = await getUserByPhone(phone);
  return NextResponse.json({ user });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { phone: string; name: string; address: string };
    if (!body.phone || !body.name || !body.address) {
      return NextResponse.json({ error: "Phone, name, and address are required" }, { status: 400 });
    }
    const saved = await saveUserProfile(body);
    return NextResponse.json({ user: saved });
  } catch (error) {
    console.error("Error saving user profile:", error);
    return NextResponse.json({ error: "Failed to save user profile" }, { status: 400 });
  }
}
