"use client";

import { useState } from "react";
import { PaymentStatus, OrderItemSelection, Restaurant } from "@/types";

// IBAN formatlama fonksiyonu
function formatIBAN(iban: string): string {
  // Sadece alfanumerik karakterleri al
  let cleaned = iban.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  // TR ile başlamıyorsa ekle
  if (!cleaned.startsWith("TR")) {
    cleaned = "TR" + cleaned;
  }

  // Sadece rakamları al (TR hariç)
  const prefix = cleaned.slice(0, 2); // TR
  let numbers = cleaned.slice(2).replace(/\D/g, "");

  // En fazla 24 rakam (TR + 24 = 26 karakter)
  numbers = numbers.slice(0, 24);

  // 4'erli gruplar halinde böl
  const fullIban = prefix + numbers;
  const groups = [];
  for (let i = 0; i < fullIban.length; i += 4) {
    groups.push(fullIban.slice(i, i + 4));
  }

  return groups.join(" ");
}

// Kopyalamak için temiz IBAN (boşluksuz)
function getCleanIBAN(iban: string): string {
  let cleaned = iban.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (!cleaned.startsWith("TR")) {
    cleaned = "TR" + cleaned;
  }
  const prefix = cleaned.slice(0, 2);
  const numbers = cleaned.slice(2).replace(/\D/g, "").slice(0, 24);
  return prefix + numbers;
}

interface PaymentModalProps {
  isOpen: boolean;
  restaurants: Restaurant[];
  items: OrderItemSelection[];
  totalPrice: number;
  onSelectPayment: (status: PaymentStatus) => void;
  onClose: () => void;
}

export default function PaymentModal({
  isOpen,
  restaurants,
  items,
  totalPrice,
  onSelectPayment,
  onClose,
}: PaymentModalProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Seçilen restoranların IBAN bilgilerini al
  const selectedRestaurantIds = Array.from(new Set(items.map((item) => item.restaurantId)));
  const selectedRestaurants = restaurants.filter((r) =>
    selectedRestaurantIds.includes(r.id)
  );

  const copyToClipboard = (restaurantId: string, iban: string) => {
    const cleanIban = getCleanIBAN(iban);
    navigator.clipboard.writeText(cleanIban);
    setCopiedId(restaurantId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-green-600 text-white px-6 py-4 rounded-t-xl">
          <h2 className="text-xl font-bold">Sipariş Özeti</h2>
          <p className="text-green-100 text-sm">Toplam: {totalPrice} TL</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Sipariş Detayları */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Seçilen Ürünler:</h3>
            <div className="space-y-2 text-sm">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-gray-600">
                  <span>
                    {item.quantity}x {item.productName} ({item.portionName})
                  </span>
                  <span className="font-medium">{item.itemTotal} TL</span>
                </div>
              ))}
            </div>
          </div>

          {/* IBAN Bilgileri */}
          {selectedRestaurants.some((r) => r.iban) && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Ödeme Bilgileri:</h3>
              {selectedRestaurants
                .filter((r) => r.iban)
                .map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className="bg-blue-50 rounded-lg p-4 mb-3"
                  >
                    <div className="font-medium text-blue-800 mb-2">
                      {restaurant.name}
                    </div>
                    <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-blue-200">
                      <span className="font-mono text-blue-700 text-sm flex-1">
                        {formatIBAN(restaurant.iban!)}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(restaurant.id, restaurant.iban!)}
                        className={`shrink-0 px-3 py-1.5 rounded font-medium text-sm transition-colors ${
                          copiedId === restaurant.id
                            ? "bg-green-500 text-white"
                            : "bg-blue-500 hover:bg-blue-600 text-white"
                        }`}
                      >
                        {copiedId === restaurant.id ? "Kopyalandı!" : "Kopyala"}
                      </button>
                    </div>
                    {restaurant.accountHolder && (
                      <div className="text-blue-600 text-sm mt-2">
                        {restaurant.accountHolder}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}

          {/* Ödeme Sorusu */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-800 mb-4 text-center">
              Ödeme yaptınız mı?
            </h3>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => onSelectPayment("paid")}
                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Evet, ödedim
              </button>

              <button
                type="button"
                onClick={() => onSelectPayment("later")}
                className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                Birazdan ödeyeceğim
              </button>

              <button
                type="button"
                onClick={() => onSelectPayment("door")}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Kapıda ödeyeceğim
              </button>
            </div>
          </div>
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-green-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
