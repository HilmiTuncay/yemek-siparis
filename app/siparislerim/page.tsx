"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Order, OrderSystemStatus } from "@/types";

const USER_INFO_KEY = "yemek-siparis-user-info";

export default function SiparislerimPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderStatus, setOrderStatus] = useState<OrderSystemStatus>({ isOpen: true });
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState("");

  // Kullanici adini localStorage'dan yukle
  useEffect(() => {
    try {
      const saved = localStorage.getItem(USER_INFO_KEY);
      if (saved) {
        const info = JSON.parse(saved);
        if (info.name) setCustomerName(info.name);
      }
    } catch {
      // localStorage erisim hatasi
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [ordersRes, statusRes] = await Promise.all([
        fetch("/api/siparisler"),
        fetch("/api/siparis-durumu"),
      ]);

      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data.orders || []);
      }

      if (statusRes.ok) {
        const status = await statusRes.json();
        setOrderStatus(status);
      }
    } catch {
      // Hata durumunda
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleCancelOrder = async (orderId: string) => {
    if (!orderStatus.isOpen) {
      alert("Siparisler kapali, iptal edilemez!");
      return;
    }

    if (!confirm("Bu siparisi iptal etmek istediginize emin misiniz?")) return;

    try {
      const response = await fetch(`/api/siparisler?id=${orderId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchData();
      } else {
        alert("Siparis iptal edilemedi");
      }
    } catch {
      alert("Baglanti hatasi");
    }
  };

  // Kullanicinin siparislerini filtrele
  const myOrders = orders.filter(
    (order) => order.customerName.toLowerCase() === customerName.toLowerCase()
  );

  const totalPrice = myOrders.reduce((sum, order) => sum + order.totalPrice, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-green-600 text-white py-4 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Siparislerim</h1>
          <Link
            href="/"
            className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors"
          >
            Siparis Ver
          </Link>
        </div>
      </header>

      {/* Siparis Durumu */}
      {!orderStatus.isOpen && (
        <div className="bg-yellow-500 text-white text-center py-2 px-4">
          <p className="font-semibold">Siparisler kapali - Iptal islemi yapilamaz</p>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!customerName ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 mb-4">
              Siparislerinizi gormek icin once ana sayfadan isminizi girin.
            </p>
            <Link
              href="/"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Ana Sayfaya Git
            </Link>
          </div>
        ) : myOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 mb-2">
              Merhaba <span className="font-semibold">{customerName}</span>!
            </p>
            <p className="text-gray-500 mb-4">Henuz siparisiniz bulunmuyor.</p>
            <Link
              href="/"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Siparis Ver
            </Link>
          </div>
        ) : (
          <>
            {/* Ozet */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-bold text-green-800 mb-2">
                Merhaba {customerName}!
              </h2>
              <div className="flex justify-between items-center">
                <p className="text-gray-600">
                  Toplam <span className="font-semibold">{myOrders.length}</span> siparisiniz var
                </p>
                <p className="text-2xl font-bold text-green-600">{totalPrice} TL</p>
              </div>
            </div>

            {/* Siparisler */}
            <div className="space-y-4">
              {myOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-lg shadow-md p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          order.paymentStatus === "paid"
                            ? "bg-green-100 text-green-800"
                            : order.paymentStatus === "later"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {order.paymentStatus === "paid"
                          ? "Odendi"
                          : order.paymentStatus === "later"
                          ? "Birazdan"
                          : "Kapida"}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(order.createdAt).toLocaleTimeString("tr-TR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        {order.totalPrice} TL
                      </p>
                      {orderStatus.isOpen && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="text-red-500 hover:text-red-700 text-sm mt-1"
                        >
                          Iptal Et
                        </button>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {order.items.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded"
                      >
                        <div>
                          <span className="font-medium">{item.quantity}x</span>{" "}
                          {item.productName}{" "}
                          <span className="text-gray-500">({item.portionName})</span>
                          {item.sauceName && (
                            <span className="text-yellow-600"> - {item.sauceName}</span>
                          )}
                          {item.extraName && (
                            <span className="text-green-600"> + {item.extraName}</span>
                          )}
                          {item.drinkName && item.drinkName !== "Icecek Yok" && (
                            <span className="text-blue-600"> + {item.drinkName}</span>
                          )}
                          <p className="text-xs text-gray-500">{item.restaurantName}</p>
                        </div>
                        <span className="text-green-600 font-medium">
                          {item.itemTotal} TL
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
