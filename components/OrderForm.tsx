"use client";

import { useState, useEffect } from "react";
import { Menu, OrderItemSelection, UserCompanyInfo, PaymentStatus, OrderSystemStatus } from "@/types";
import RestaurantSection from "./RestaurantSection";
import PaymentModal from "./PaymentModal";
import SuggestionBox from "./SuggestionBox";

interface OrderFormProps {
  menu: Menu;
  orderStatus?: OrderSystemStatus;
}

// localStorage key
const USER_INFO_KEY = "yemek-siparis-user-info";

export default function OrderForm({ menu, orderStatus }: OrderFormProps) {
  const isOrdersClosed = orderStatus && !orderStatus.isOpen;
  const [customerName, setCustomerName] = useState("");
  // selections: { [restaurantId]: { [productId]: OrderItemSelection } }
  const [selections, setSelections] = useState<Record<string, Record<string, OrderItemSelection>>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // localStorage'dan kullanıcı bilgisini yükle
  useEffect(() => {
    try {
      const saved = localStorage.getItem(USER_INFO_KEY);
      if (saved) {
        const info: UserCompanyInfo = JSON.parse(saved);
        if (info.name) setCustomerName(info.name);
      }
    } catch {
      // localStorage erişim hatası - yoksay
    }
  }, []);

  // İsim değiştiğinde localStorage'a kaydet
  const handleNameChange = (name: string) => {
    setCustomerName(name);
    try {
      const saved = localStorage.getItem(USER_INFO_KEY);
      const info: UserCompanyInfo = saved ? JSON.parse(saved) : { name: "" };
      info.name = name;
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(info));
    } catch {
      // localStorage erişim hatası - yoksay
    }
  };

  const handleAddToCart = (
    restaurantId: string,
    productId: string,
    selection: OrderItemSelection
  ) => {
    // İsim kontrolü - sepete eklemeden önce
    if (!customerName.trim()) {
      setMessage({ type: "error", text: "Lütfen önce isminizi girin" });
      // İsim input'una focus
      const nameInput = document.getElementById("name");
      if (nameInput) nameInput.focus();
      return;
    }
    setMessage(null);

    setSelections((prev) => {
      const restaurantSelections = { ...(prev[restaurantId] || {}) };
      restaurantSelections[productId] = selection;
      return {
        ...prev,
        [restaurantId]: restaurantSelections,
      };
    });
    // Sepete eklenince modal aç
    setShowPaymentModal(true);
  };

  const handleRemoveFromCart = (restaurantId: string, productId: string) => {
    setSelections((prev) => {
      const restaurantSelections = { ...(prev[restaurantId] || {}) };
      delete restaurantSelections[productId];
      return {
        ...prev,
        [restaurantId]: restaurantSelections,
      };
    });
  };

  const handleUpdateCart = (
    restaurantId: string,
    productId: string,
    selection: OrderItemSelection
  ) => {
    setSelections((prev) => {
      const restaurantSelections = { ...(prev[restaurantId] || {}) };
      restaurantSelections[productId] = selection;
      return {
        ...prev,
        [restaurantId]: restaurantSelections,
      };
    });
  };

  const getAllSelections = (): OrderItemSelection[] => {
    const allSelections: OrderItemSelection[] = [];
    for (const restaurantSelections of Object.values(selections)) {
      for (const selection of Object.values(restaurantSelections)) {
        allSelections.push(selection);
      }
    }
    return allSelections;
  };

  const calculateTotal = (): number => {
    return getAllSelections().reduce((sum, sel) => sum + sel.itemTotal, 0);
  };

  const handlePaymentSelect = async (paymentStatus: PaymentStatus) => {
    setMessage(null);

    if (!customerName.trim()) {
      setMessage({ type: "error", text: "Lütfen isminizi girin" });
      setShowPaymentModal(false);
      return;
    }

    const items = getAllSelections();
    if (items.length === 0) {
      setMessage({ type: "error", text: "En az bir ürün seçin" });
      setShowPaymentModal(false);
      return;
    }

    setLoading(true);
    setShowPaymentModal(false);

    try {
      const response = await fetch("/api/siparis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          items,
          paymentStatus,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const statusText =
          paymentStatus === "paid"
            ? "Ödeme yapıldı olarak"
            : paymentStatus === "later"
            ? "Birazdan ödeyecek olarak"
            : "Kapıda ödeyecek olarak";
        setMessage({ type: "success", text: `Siparişiniz alındı! (${statusText})` });
        setSelections({});
      } else {
        setMessage({ type: "error", text: data.error || "Bir hata oluştu" });
      }
    } catch {
      setMessage({ type: "error", text: "Bağlantı hatası" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (isOrdersClosed) {
      setMessage({ type: "error", text: "Siparisler su an kapali!" });
      return;
    }

    if (!customerName.trim()) {
      setMessage({ type: "error", text: "Lutfen isminizi girin" });
      return;
    }

    const items = getAllSelections();
    if (items.length === 0) {
      setMessage({ type: "error", text: "En az bir urun secin" });
      return;
    }

    // Modal ac
    setShowPaymentModal(true);
  };

  const total = calculateTotal();

  return (
    <>
      <form onSubmit={handleSubmit}>
        {/* Isim Girisi */}
        <div className="mb-6">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Isminiz
          </label>
          <input
            type="text"
            id="name"
            value={customerName}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Adinizi girin"
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Oneri Kutusu */}
        <SuggestionBox customerName={customerName} />

        {/* Restoranlar */}
        {menu.restaurants.map((restaurant) => (
          <RestaurantSection
            key={restaurant.id}
            restaurant={restaurant}
            selections={selections[restaurant.id] || {}}
            onAddToCart={(productId, sel) =>
              handleAddToCart(restaurant.id, productId, sel)
            }
            onRemoveFromCart={(productId) =>
              handleRemoveFromCart(restaurant.id, productId)
            }
            onUpdateCart={(productId, sel) =>
              handleUpdateCart(restaurant.id, productId, sel)
            }
          />
        ))}

        {/* Mesaj */}
        {message && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Toplam ve Gönder */}
        <div className="sticky bottom-0 bg-white border-t p-4 -mx-4 sm:-mx-6 lg:-mx-8 mt-6 shadow-lg">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xl font-bold">
              Toplam: <span className="text-green-600">{total} TL</span>
            </div>
            <button
              type="submit"
              disabled={loading || total === 0 || isOrdersClosed}
              className={`w-full sm:w-auto px-8 py-3 font-semibold rounded-lg transition-colors ${
                isOrdersClosed
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white"
              }`}
            >
              {loading ? "Gonderiliyor..." : isOrdersClosed ? "Siparisler Kapali" : "Siparis Ver"}
            </button>
          </div>
        </div>
      </form>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        restaurants={menu.restaurants}
        items={getAllSelections()}
        totalPrice={total}
        onSelectPayment={handlePaymentSelect}
        onClose={() => setShowPaymentModal(false)}
      />
    </>
  );
}
