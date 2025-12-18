import { NextResponse } from "next/server";
import { getOrderStatus, setOrderStatus } from "@/lib/redis";

export const dynamic = 'force-dynamic';

// GET - Sipariş durumunu getir
export async function GET() {
  try {
    const status = await getOrderStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error("GET /api/siparis-durumu error:", error);
    return NextResponse.json({ error: "Durum alınamadı" }, { status: 500 });
  }
}

// PUT - Sipariş durumunu güncelle
export async function PUT(request: Request) {
  try {
    const { isOpen } = await request.json();

    if (typeof isOpen !== "boolean") {
      return NextResponse.json({ error: "Geçersiz format" }, { status: 400 });
    }

    const success = await setOrderStatus(isOpen);

    if (success) {
      return NextResponse.json({ success: true, isOpen });
    } else {
      return NextResponse.json({ error: "Durum güncellenemedi" }, { status: 500 });
    }
  } catch (error) {
    console.error("PUT /api/siparis-durumu error:", error);
    return NextResponse.json({ error: "Durum güncellenemedi" }, { status: 500 });
  }
}
