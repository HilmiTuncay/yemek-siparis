import { NextResponse } from "next/server";
import { getOrders, clearOrders, deleteOrder } from "@/lib/redis";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orders = await getOrders();

    // Toplam tutarı hesapla
    const grandTotal = orders.reduce((sum, order) => sum + order.totalPrice, 0);

    return NextResponse.json({
      orders,
      grandTotal,
      count: orders.length
    });
  } catch (error) {
    console.error("GET /api/siparisler error:", error);
    return NextResponse.json(
      { error: "Siparişler alınamadı" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("id");

    if (orderId) {
      // Tek sipariş sil
      const success = await deleteOrder(orderId);
      if (!success) {
        return NextResponse.json(
          { error: "Sipariş bulunamadı" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, message: "Sipariş silindi" });
    } else {
      // Tüm siparişleri sil
      const success = await clearOrders();
      if (!success) {
        return NextResponse.json(
          { error: "Siparişler silinemedi" },
          { status: 500 }
        );
      }
      return NextResponse.json({ success: true, message: "Tüm siparişler silindi" });
    }
  } catch (error) {
    console.error("DELETE /api/siparisler error:", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
