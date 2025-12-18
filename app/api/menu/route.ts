import { NextResponse } from "next/server";
import { getMenu, saveMenu } from "@/lib/redis";
import { Menu } from "@/types";

// GET - Menüyü getir
export async function GET() {
  try {
    const menu = await getMenu();
    return NextResponse.json(menu);
  } catch (error) {
    console.error("GET /api/menu error:", error);
    return NextResponse.json({ error: "Menü yüklenemedi" }, { status: 500 });
  }
}

// PUT - Menüyü güncelle
export async function PUT(request: Request) {
  try {
    const menu: Menu = await request.json();

    if (!menu.restaurants || !Array.isArray(menu.restaurants)) {
      return NextResponse.json({ error: "Geçersiz menü formatı" }, { status: 400 });
    }

    const success = await saveMenu(menu);

    if (success) {
      return NextResponse.json({ success: true, menu });
    } else {
      return NextResponse.json({ error: "Menü kaydedilemedi" }, { status: 500 });
    }
  } catch (error) {
    console.error("PUT /api/menu error:", error);
    return NextResponse.json({ error: "Menü güncellenemedi" }, { status: 500 });
  }
}
