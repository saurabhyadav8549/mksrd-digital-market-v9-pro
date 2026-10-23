import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    // Yeh .env.local se password uthayega, warna default mksrd@55555 rakhega
    const validPassword = process.env.ADMIN_PASSWORD || "mksrd@55555";

    if (password === validPassword) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    return NextResponse.json(
      { ok: false, error: "Galat password! Kripya sahi Admin PIN/Password daalein." },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Authentication error" },
      { status: 500 }
    );
  }
}