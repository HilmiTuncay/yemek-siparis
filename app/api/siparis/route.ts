import { NextRequest, NextResponse } from "next/server";
import { addOrder, getOrderStatus } from "@/lib/redis";
import { Order, OrderItemSelection, PaymentStatus } from "@/types";

export const dynamic = 'force-dynamic';

interface OrderInput {
  customerName: string;
  items: OrderItemSelection[];
  paymentStatus: PaymentStatus;
}

export async function POST(request: NextRequest) {
  try {
    // Siparis durumunu kontrol et
    const orderStatus = await getOrderStatus();
    if (!orderStatus.isOpen) {
      return NextResponse.json({ error: "Siparisler su an kapali!" }, { status: 403 });
    }

    const body: OrderInput = await request.json();

    if (!body.customerName || !body.customerName.trim()) {
      return NextResponse.json({ error: "Isim gerekli" }, { status: 400 });
    }

    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: "En az bir urun secmelisiniz" }, { status: 400 });
    }

    // Toplam fiyatı hesapla
    let totalPrice = 0;
    for (const item of body.items) {
      totalPrice += item.itemTotal;
    }

    const order: Order = {
      id: crypto.randomUUID(),
      customerName: body.customerName.trim(),
      items: body.items,
      totalPrice,
      createdAt: Date.now(),
      paymentStatus: body.paymentStatus || "later",
    };

    const success = await addOrder(order);

    if (!success) {
      return NextResponse.json({ error: "Sipariş kaydedilemedi" }, { status: 500 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("POST /api/siparis error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
