"use client";

import { useState, useEffect, useCallback } from "react";
import { Order, PaymentStatus, Restaurant, OrderSystemStatus } from "@/types";

interface OrdersResponse {
  orders: Order[];
  grandTotal: number;
  count: number;
}

interface MenuResponse {
  restaurants: Restaurant[];
}

// Odeme durumu badge'i
function getPaymentStatusBadge(status: PaymentStatus | undefined) {
  switch (status) {
    case "paid":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
          Odendi
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
          Kapida
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
  const [orderStatus, setOrderStatus] = useState<OrderSystemStatus>({ isOpen: true });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const [ordersRes, menuRes, statusRes] = await Promise.all([
        fetch("/api/siparisler"),
        fetch("/api/menu"),
        fetch("/api/siparis-durumu"),
      ]);
      if (!ordersRes.ok) throw new Error("Siparisler alinamadi");
      const ordersResult = await ordersRes.json();
      const menuResult = await menuRes.json();
      const statusResult = await statusRes.json();
      setData(ordersResult);
      setMenu(menuResult);
      setOrderStatus(statusResult);
      setError(null);
    } catch {
      setError("Siparisler yuklenemedi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleToggleOrders = async () => {
    setActionLoading(true);
    try {
      const response = await fetch("/api/siparis-durumu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOpen: !orderStatus.isOpen }),
      });
      if (response.ok) {
        setOrderStatus({ ...orderStatus, isOpen: !orderStatus.isOpen });
      }
    } catch {
      alert("Durum guncellenemedi");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetOrders = async () => {
    if (resetConfirmText !== "SIFIRLA") {
      alert("Lutfen 'SIFIRLA' yazin");
      return;
    }
    setActionLoading(true);
    try {
      const response = await fetch("/api/siparisler", { method: "DELETE" });
      if (response.ok) {
        setShowResetConfirm(false);
        setResetConfirmText("");
        fetchOrders();
      }
    } catch {
      alert("Siparisler silinemedi");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Bu siparisi silmek istediginize emin misiniz?")) return;
    try {
      const response = await fetch(`/api/siparisler?id=${orderId}`, { method: "DELETE" });
      if (response.ok) {
        fetchOrders();
      }
    } catch {
      alert("Siparis silinemedi");
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  // Kisi bazli gruplama
  const groupedOrders = data?.orders.reduce((acc, order) => {
    const name = order.customerName;
    if (!acc[name]) {
      acc[name] = [];
    }
    acc[name].push(order);
    return acc;
  }, {} as Record<string, Order[]>);

  // Restoran bazli detayli ozet
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

      // Porsiyon sayimi
      const portionKey = `${item.productName}-${item.portionName}`;
      if (!acc[restaurantKey].portions[portionKey]) {
        acc[restaurantKey].portions[portionKey] = {
          name: `${item.productName} (${item.portionName})`,
          count: 0,
        };
      }
      acc[restaurantKey].portions[portionKey].count += item.quantity;

      // Icecek sayimi
      if (item.drinkName && item.drinkName !== "Icecek Yok") {
        if (!acc[restaurantKey].drinks[item.drinkId]) {
          acc[restaurantKey].drinks[item.drinkId] = {
            name: item.drinkName,
            count: 0,
          };
        }
        acc[restaurantKey].drinks[item.drinkId].count += item.quantity;
      }

      // Sos sayimi
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

      // Ekstra sayimi
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

  // Odeme durumu ozeti
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

  return (
    <div className="space-y-6">
      {/* Siparis Yonetim Paneli */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Durum Gostergesi */}
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${orderStatus.isOpen ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></div>
            <span className={`font-semibold ${orderStatus.isOpen ? "text-green-700" : "text-red-700"}`}>
              Siparisler {orderStatus.isOpen ? "Acik" : "Kapali"}
            </span>
          </div>

          {/* Butonlar */}
          <div className="flex gap-2">
            <button
              onClick={handleToggleOrders}
              disabled={actionLoading}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                orderStatus.isOpen
                  ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
            >
              {actionLoading ? "..." : orderStatus.isOpen ? "Siparisleri Kapat" : "Siparisleri Ac"}
            </button>

            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold"
              >
                Sifirla
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={resetConfirmText}
                  onChange={(e) => setResetConfirmText(e.target.value.toUpperCase())}
                  placeholder="SIFIRLA yaz"
                  className="w-28 px-2 py-2 border-2 border-red-300 rounded-lg text-sm"
                />
                <button
                  onClick={handleResetOrders}
                  disabled={actionLoading || resetConfirmText !== "SIFIRLA"}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg font-semibold disabled:bg-red-300"
                >
                  Onayla
                </button>
                <button
                  onClick={() => { setShowResetConfirm(false); setResetConfirmText(""); }}
                  className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg"
                >
                  X
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ozet Kartlari */}
      {data && data.orders.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
            <p className="text-green-100 text-sm">Toplam Siparis</p>
            <p className="text-3xl font-bold">{data.count}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <p className="text-blue-100 text-sm">Kisi Sayisi</p>
            <p className="text-3xl font-bold">{Object.keys(groupedOrders || {}).length}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
            <p className="text-purple-100 text-sm">Toplam Tutar</p>
            <p className="text-3xl font-bold">{data.grandTotal} TL</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white">
            <p className="text-emerald-100 text-sm">Odenen</p>
            <p className="text-3xl font-bold">{paymentSummary?.paid?.total || 0} TL</p>
          </div>
        </div>
      )}

      {/* Siparis Yoksa */}
      {(!data || data.orders.length === 0) && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-xl">Henuz siparis yok</p>
          <p className="mt-2">Siparisler burada gorunecek</p>
        </div>
      )}

      {/* Odeme Durumu Ozeti */}
      {data && data.orders.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-4">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Odeme Durumu</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{paymentSummary?.paid?.count || 0}</p>
              <p className="text-xs text-green-700">Odedi</p>
              <p className="text-sm font-semibold text-green-600 mt-1">{paymentSummary?.paid?.total || 0} TL</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-yellow-600">{paymentSummary?.later?.count || 0}</p>
              <p className="text-xs text-yellow-700">Birazdan</p>
              <p className="text-sm font-semibold text-yellow-600 mt-1">{paymentSummary?.later?.total || 0} TL</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{paymentSummary?.door?.count || 0}</p>
              <p className="text-xs text-blue-700">Kapida</p>
              <p className="text-sm font-semibold text-blue-600 mt-1">{paymentSummary?.door?.total || 0} TL</p>
            </div>
          </div>
        </div>
      )}

      {/* Restoran Bazli Siparis Ozeti */}
      {Object.entries(restaurantSummary || {}).map(([restaurantId, restaurant]) => {
        const restaurantInfo = menu?.restaurants.find(r => r.id === restaurantId);
        return (
          <div key={restaurantId} className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Restoran Baslik */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{restaurant.name}</h2>
                <div className="text-right">
                  <p className="text-2xl font-bold">{restaurant.totalItems} adet</p>
                  <p className="text-gray-300">{restaurant.total} TL</p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* IBAN Bilgisi */}
              {restaurantInfo?.iban && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-blue-700 mb-1">Odeme Bilgileri</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-blue-800 text-sm">{formatIBAN(restaurantInfo.iban)}</span>
                    <button
                      onClick={() => copyToClipboard(getCleanIBAN(restaurantInfo.iban!), `iban-${restaurantId}`)}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        copiedItem === `iban-${restaurantId}`
                          ? "bg-green-500 text-white"
                          : "bg-blue-500 text-white"
                      }`}
                    >
                      {copiedItem === `iban-${restaurantId}` ? "Kopyalandi!" : "Kopyala"}
                    </button>
                  </div>
                  {restaurantInfo.accountHolder && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-blue-800 text-sm">{restaurantInfo.accountHolder}</span>
                      <button
                        onClick={() => copyToClipboard(restaurantInfo.accountHolder!, `name-${restaurantId}`)}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          copiedItem === `name-${restaurantId}`
                            ? "bg-green-500 text-white"
                            : "bg-blue-500 text-white"
                        }`}
                      >
                        {copiedItem === `name-${restaurantId}` ? "Kopyalandi!" : "Kopyala"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Yemekler */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-2 text-sm">Yemekler</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.values(restaurant.portions)
                    .sort((a, b) => b.count - a.count)
                    .map((portion, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
                        <span className="text-sm text-gray-700">{portion.name}</span>
                        <span className="font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded">{portion.count}x</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Icecekler */}
              {Object.keys(restaurant.drinks).length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2 text-sm">Icecekler</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(restaurant.drinks)
                      .sort((a, b) => b.count - a.count)
                      .map((drink, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                          {drink.name} <strong>{drink.count}x</strong>
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {/* Soslar */}
              {Object.keys(restaurant.sauces).length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2 text-sm">Soslar</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(restaurant.sauces)
                      .sort((a, b) => b.count - a.count)
                      .map((sauce, idx) => (
                        <span key={idx} className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                          {sauce.name} <strong>{sauce.count}x</strong>
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {/* Ekstralar */}
              {Object.keys(restaurant.extras).length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2 text-sm">Ekstralar</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(restaurant.extras)
                      .sort((a, b) => b.count - a.count)
                      .map((extra, idx) => (
                        <span key={idx} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                          {extra.name} <strong>{extra.count}x</strong>
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Kisi Bazli Siparisler */}
      {data && data.orders.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Kisi Bazli Siparisler</h2>
          <div className="space-y-3">
            {Object.entries(groupedOrders || {}).map(([name, orders]) => {
              const personTotal = orders.reduce((sum, o) => sum + o.totalPrice, 0);
              const allPaid = orders.every(o => o.paymentStatus === "paid");
              return (
                <div key={name} className={`rounded-lg p-3 ${allPaid ? "bg-green-50 border border-green-200" : "bg-gray-50"}`}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">{name}</span>
                      {allPaid && <span className="text-green-500">✓</span>}
                    </div>
                    <span className="font-bold text-green-600">{personTotal} TL</span>
                  </div>
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white rounded p-2 mb-2 last:mb-0 flex justify-between items-start text-sm">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getPaymentStatusBadge(order.paymentStatus)}
                          <span className="text-gray-400 text-xs">
                            {new Date(order.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <ul className="text-gray-600 space-y-0.5">
                          {order.items.map((item, idx) => (
                            <li key={idx}>
                              <span className="font-medium">{item.quantity}x</span> {item.productName}
                              <span className="text-gray-400"> ({item.portionName})</span>
                              {item.sauceName && <span className="text-yellow-600"> - {item.sauceName}</span>}
                              {item.extraName && <span className="text-green-600"> + {item.extraName}</span>}
                              {item.drinkName && item.drinkName !== "Icecek Yok" && <span className="text-blue-600"> + {item.drinkName}</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="text-red-500 hover:text-red-700 ml-2"
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
      )}

      {/* Yenile */}
      <div className="text-center text-sm text-gray-500">
        <button onClick={fetchOrders} className="underline hover:text-gray-700">
          Yenile
        </button>
        <span className="ml-2">(Otomatik 10 saniyede bir guncellenir)</span>
      </div>
    </div>
  );
}
