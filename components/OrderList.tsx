"use client";

import { useState, useEffect, useCallback } from "react";
import { Order, PaymentStatus, Restaurant } from "@/types";
// #taloswin

interface OrdersResponse {
  orders: Order[];
  grandTotal: number;
  count: number;
}

interface MenuResponse {
  restaurants: Restaurant[];
}

// Ödeme durumu badge'i
function getPaymentStatusBadge(status: PaymentStatus | undefined) {
  switch (status) {
    case "paid":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
          Ödendi
        </span>
      );
    case "later":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
          Birazdan
        </span>
      );
    case "door":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
          Kapıda
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
          Belirsiz
        </span>
      );
  }
}

// IBAN formatlama
function formatIBAN(iban: string): string {
  let cleaned = iban.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (!cleaned.startsWith("TR")) {
    cleaned = "TR" + cleaned;
  }
  const prefix = cleaned.slice(0, 2);
  let numbers = cleaned.slice(2).replace(/\D/g, "");
  numbers = numbers.slice(0, 24);
  const fullIban = prefix + numbers;
  const groups = [];
  for (let i = 0; i < fullIban.length; i += 4) {
    groups.push(fullIban.slice(i, i + 4));
  }
  return groups.join(" ");
}

function getCleanIBAN(iban: string): string {
  let cleaned = iban.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (!cleaned.startsWith("TR")) {
    cleaned = "TR" + cleaned;
  }
  const prefix = cleaned.slice(0, 2);
  const numbers = cleaned.slice(2).replace(/\D/g, "").slice(0, 24);
  return prefix + numbers;
}

export default function OrderList() {
  const [data, setData] = useState<OrdersResponse | null>(null);
  const [menu, setMenu] = useState<MenuResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const [ordersRes, menuRes] = await Promise.all([
        fetch("/api/siparisler"),
        fetch("/api/menu")
      ]);
      if (!ordersRes.ok) throw new Error("Siparişler alınamadı");
      const ordersResult = await ordersRes.json();
      const menuResult = await menuRes.json();
      setData(ordersResult);
      setMenu(menuResult);
      setError(null);
    } catch {
      setError("Siparişler yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleClearAll = async () => {
    if (!confirm("Tüm siparişleri silmek istediğinize emin misiniz?")) return;
    try {
      const response = await fetch("/api/siparisler", { method: "DELETE" });
      if (response.ok) {
        fetchOrders();
      }
    } catch {
      alert("Siparişler silinemedi");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Bu siparişi silmek istediğinize emin misiniz?")) return;
    try {
      const response = await fetch(`/api/siparisler?id=${orderId}`, { method: "DELETE" });
      if (response.ok) {
        fetchOrders();
      }
    } catch {
      alert("Sipariş silinemedi");
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  // Kişi bazlı gruplama
  const groupedOrders = data?.orders.reduce((acc, order) => {
    const name = order.customerName;
    if (!acc[name]) {
      acc[name] = [];
    }
    acc[name].push(order);
    return acc;
  }, {} as Record<string, Order[]>);

  // Restoran bazlı detaylı özet
  const restaurantSummary = data?.orders.reduce((acc, order) => {
    order.items.forEach((item) => {
      const restaurantKey = item.restaurantId;
      if (!acc[restaurantKey]) {
        acc[restaurantKey] = {
          name: item.restaurantName,
          portions: {} as Record<string, { name: string; count: number }>,
          drinks: {} as Record<string, { name: string; count: number }>,
          sauces: {} as Record<string, { name: string; count: number }>,
          extras: {} as Record<string, { name: string; count: number }>,
          total: 0,
          totalItems: 0,
        };
      }

      // Porsiyon sayımı
      const portionKey = `${item.productName}-${item.portionName}`;
      if (!acc[restaurantKey].portions[portionKey]) {
        acc[restaurantKey].portions[portionKey] = {
          name: `${item.productName} (${item.portionName})`,
          count: 0,
        };
      }
      acc[restaurantKey].portions[portionKey].count += item.quantity;

      // İçecek sayımı
      if (item.drinkName && item.drinkName !== "İçecek Yok") {
        if (!acc[restaurantKey].drinks[item.drinkId]) {
          acc[restaurantKey].drinks[item.drinkId] = {
            name: item.drinkName,
            count: 0,
          };
        }
        acc[restaurantKey].drinks[item.drinkId].count += item.quantity;
      }

      // Sos sayımı
      if (item.sauceName) {
        const sauceKey = item.sauceId || item.sauceName;
        if (!acc[restaurantKey].sauces[sauceKey]) {
          acc[restaurantKey].sauces[sauceKey] = {
            name: item.sauceName,
            count: 0,
          };
        }
        acc[restaurantKey].sauces[sauceKey].count += item.quantity;
      }

      // Ekstra sayımı
      if (item.extraName) {
        const extraKey = item.extraId || item.extraName;
        if (!acc[restaurantKey].extras[extraKey]) {
          acc[restaurantKey].extras[extraKey] = {
            name: item.extraName,
            count: 0,
          };
        }
        acc[restaurantKey].extras[extraKey].count += item.quantity;
      }

      acc[restaurantKey].total += item.itemTotal;
      acc[restaurantKey].totalItems += item.quantity;
    });
    return acc;
  }, {} as Record<string, {
    name: string;
    portions: Record<string, { name: string; count: number }>;
    drinks: Record<string, { name: string; count: number }>;
    sauces: Record<string, { name: string; count: number }>;
    extras: Record<string, { name: string; count: number }>;
    total: number;
    totalItems: number;
  }>);

  // Ödeme durumu özeti
  const paymentSummary = data?.orders.reduce((acc, order) => {
    const status = order.paymentStatus || "unknown";
    if (!acc[status]) {
      acc[status] = { count: 0, total: 0, names: [] as string[] };
    }
    acc[status].count++;
    acc[status].total += order.totalPrice;
    if (!acc[status].names.includes(order.customerName)) {
      acc[status].names.push(order.customerName);
    }
    return acc;
  }, {} as Record<string, { count: number; total: number; names: string[] }>);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-lg">
        {error}
        <button onClick={fetchOrders} className="ml-4 underline">
          Tekrar Dene
        </button>
      </div>
    );
  }

  if (!data || data.orders.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-xl">Henüz sipariş yok</p>
        <p className="mt-2">Siparişler burada görünecek</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Özet Kartı */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-green-800 mb-4">Sipariş Özeti</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{data.count}</p>
            <p className="text-sm text-gray-600">Toplam Sipariş</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{Object.keys(groupedOrders || {}).length}</p>
            <p className="text-sm text-gray-600">Kişi</p>
          </div>
          <div className="text-center col-span-2 sm:col-span-1">
            <p className="text-3xl font-bold text-green-600">{data.grandTotal} TL</p>
            <p className="text-sm text-gray-600">Toplam Tutar</p>
          </div>
        </div>
      </div>

      {/* Ödeme Durumu Özeti */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Ödeme Durumu</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Ödeyenler */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-green-800">Ödedi</span>
              <span className="text-green-600 font-bold">{paymentSummary?.paid?.total || 0} TL</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{paymentSummary?.paid?.count || 0} kişi</p>
            {paymentSummary?.paid?.names && paymentSummary.paid.names.length > 0 && (
              <p className="text-xs text-green-700 mt-2">{paymentSummary.paid.names.join(", ")}</p>
            )}
          </div>

          {/* Birazdan Ödeyecekler */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-yellow-800">Birazdan</span>
              <span className="text-yellow-600 font-bold">{paymentSummary?.later?.total || 0} TL</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{paymentSummary?.later?.count || 0} kişi</p>
            {paymentSummary?.later?.names && paymentSummary.later.names.length > 0 && (
              <p className="text-xs text-yellow-700 mt-2">{paymentSummary.later.names.join(", ")}</p>
            )}
          </div>

          {/* Kapıda Ödeyecekler */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-blue-800">Kapıda</span>
              <span className="text-blue-600 font-bold">{paymentSummary?.door?.total || 0} TL</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{paymentSummary?.door?.count || 0} kişi</p>
            {paymentSummary?.door?.names && paymentSummary.door.names.length > 0 && (
              <p className="text-xs text-blue-700 mt-2">{paymentSummary.door.names.join(", ")}</p>
            )}
          </div>
        </div>
      </div>

      {/* Restoran Bazlı Toplu Sipariş Özeti */}
      {Object.entries(restaurantSummary || {}).map(([restaurantId, restaurant]) => {
        const restaurantInfo = menu?.restaurants.find(r => r.id === restaurantId);
        return (
          <div key={restaurantId} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">{restaurant.name}</h2>
            <p className="text-sm text-gray-500 mb-4">Toplam: {restaurant.totalItems} adet - {restaurant.total} TL</p>

            {/* IBAN ve Hesap Bilgisi */}
            {restaurantInfo?.iban && (
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-blue-800 mb-2">Ödeme Bilgileri:</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-blue-700 text-sm">{formatIBAN(restaurantInfo.iban)}</span>
                    <button
                      onClick={() => copyToClipboard(getCleanIBAN(restaurantInfo.iban!), `iban-${restaurantId}`)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        copiedItem === `iban-${restaurantId}`
                          ? "bg-green-500 text-white"
                          : "bg-blue-500 hover:bg-blue-600 text-white"
                      }`}
                    >
                      {copiedItem === `iban-${restaurantId}` ? "Kopyalandı!" : "IBAN Kopyala"}
                    </button>
                  </div>
                  {restaurantInfo.accountHolder && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-blue-700 text-sm">{restaurantInfo.accountHolder}</span>
                      <button
                        onClick={() => copyToClipboard(restaurantInfo.accountHolder!, `name-${restaurantId}`)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          copiedItem === `name-${restaurantId}`
                            ? "bg-green-500 text-white"
                            : "bg-blue-500 hover:bg-blue-600 text-white"
                        }`}
                      >
                        {copiedItem === `name-${restaurantId}` ? "Kopyalandı!" : "İsim Kopyala"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Porsiyon Bazlı Özet */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-700 mb-2">Yemekler:</h3>
              <div className="bg-gray-50 rounded-lg p-3">
                <ul className="space-y-1">
                  {Object.values(restaurant.portions)
                    .sort((a, b) => b.count - a.count)
                    .map((portion, idx) => (
                      <li key={idx} className="flex justify-between text-sm">
                        <span>{portion.name}</span>
                        <span className="font-bold text-green-600">{portion.count} adet</span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>

            {/* İçecek Bazlı Özet */}
            {Object.keys(restaurant.drinks).length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">İçecekler:</h3>
                <div className="bg-blue-50 rounded-lg p-3">
                  <ul className="space-y-1">
                    {Object.values(restaurant.drinks)
                      .sort((a, b) => b.count - a.count)
                      .map((drink, idx) => (
                        <li key={idx} className="flex justify-between text-sm">
                          <span>{drink.name}</span>
                          <span className="font-bold text-blue-600">{drink.count} adet</span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Sos Bazlı Özet */}
            {Object.keys(restaurant.sauces).length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">Soslar:</h3>
                <div className="bg-yellow-50 rounded-lg p-3">
                  <ul className="space-y-1">
                    {Object.values(restaurant.sauces)
                      .sort((a, b) => b.count - a.count)
                      .map((sauce, idx) => (
                        <li key={idx} className="flex justify-between text-sm">
                          <span>{sauce.name}</span>
                          <span className="font-bold text-yellow-600">{sauce.count} adet</span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Ekstra Bazlı Özet */}
            {Object.keys(restaurant.extras).length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">Ekstralar:</h3>
                <div className="bg-green-50 rounded-lg p-3">
                  <ul className="space-y-1">
                    {Object.values(restaurant.extras)
                      .sort((a, b) => b.count - a.count)
                      .map((extra, idx) => (
                        <li key={idx} className="flex justify-between text-sm">
                          <span>{extra.name}</span>
                          <span className="font-bold text-green-600">{extra.count} adet</span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Kişi Bazlı Siparişler */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Kişi Bazlı Siparişler</h2>
        <div className="space-y-6">
          {Object.entries(groupedOrders || {}).map(([name, orders]) => {
            const personTotal = orders.reduce((sum, o) => sum + o.totalPrice, 0);
            const allPaid = orders.every(o => o.paymentStatus === "paid");
            return (
              <div key={name} className={`border-b pb-4 last:border-0 ${allPaid ? "bg-green-50 -mx-2 px-2 py-2 rounded-lg" : ""}`}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg text-gray-800">{name}</h3>
                    {allPaid && <span className="text-green-600 text-sm">✓</span>}
                  </div>
                  <span className="text-green-600 font-semibold">{personTotal} TL</span>
                </div>
                {orders.map((order) => (
                  <div key={order.id} className="ml-4 mb-2 p-3 bg-gray-50 rounded flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getPaymentStatusBadge(order.paymentStatus)}
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {order.items.map((item, idx) => (
                          <li key={idx}>
                            <span className="font-medium">{item.quantity}x</span> {item.productName}{" "}
                            <span className="text-gray-500">({item.portionName})</span>
                            {item.sauceName && (
                              <span className="text-yellow-600"> - {item.sauceName}</span>
                            )}
                            {item.extraName && (
                              <span className="text-green-600"> + {item.extraName}</span>
                            )}
                            {item.drinkName !== "İçecek Yok" && (
                              <span className="text-gray-500"> + {item.drinkName}</span>
                            )}
                            <span className="ml-2 text-green-600">({item.itemTotal} TL)</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-sm font-semibold mt-2 text-gray-500">
                        {order.items[0]?.restaurantName}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="text-red-500 hover:text-red-700 text-sm ml-4"
                    >
                      Sil
                    </button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Temizle Butonu */}
      <div className="flex justify-center">
        <button
          onClick={handleClearAll}
          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg"
        >
          Tüm Siparişleri Temizle
        </button>
      </div>

      {/* Yenile Butonu */}
      <div className="text-center text-sm text-gray-500">
        <button onClick={fetchOrders} className="underline hover:text-gray-700">
          Yenile
        </button>
        <span className="ml-2">(Otomatik 10 saniyede bir güncellenir)</span>
      </div>
    </div>
  );
}
