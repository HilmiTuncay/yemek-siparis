"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Menu, OrderSystemStatus } from "@/types";
import OrderForm from "./OrderForm";
import WelcomeScreen from "./WelcomeScreen";
import AdminPanel from "./AdminPanel";

interface HomeContentProps {
  menu: Menu;
  orderStatus: OrderSystemStatus;
}

const USER_INFO_KEY = "yemek-siparis-user-info";

export default function HomeContent({ menu, orderStatus: initialStatus }: HomeContentProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [orderStatus, setOrderStatus] = useState(initialStatus);
  const [customerName, setCustomerName] = useState("");

  // Kullanıcı adını localStorage'dan yükle
  useEffect(() => {
    try {
      const saved = localStorage.getItem(USER_INFO_KEY);
      if (saved) {
        const info = JSON.parse(saved);
        if (info.name) setCustomerName(info.name);
      }
    } catch {
      // localStorage erişim hatası
    }
  }, []);

  // Admin auth kontrolü
  useEffect(() => {
    try {
      const saved = localStorage.getItem("yemek-siparis-admin-auth");
      if (saved === "unlocked") {
        setIsAdminAuthenticated(true);
      }
    } catch {
      // localStorage erişim hatası
    }
  }, []);

  const handleUnlock = useCallback(() => {
    setIsUnlocked(true);
  }, []);

  const handleAdminClick = () => {
    if (isAdminAuthenticated) {
      setShowAdminPanel(true);
    } else {
      // Şifre modalını göster
      setShowAdminPanel(true);
    }
  };

  const handleAdminAuth = () => {
    setIsAdminAuthenticated(true);
    try {
      localStorage.setItem("yemek-siparis-admin-auth", "unlocked");
    } catch {
      // localStorage erişim hatası
    }
  };

  if (!isUnlocked) {
    return <WelcomeScreen onUnlock={handleUnlock} />;
  }

  return (
    <main className="min-h-screen pb-24">
      {/* Header */}
      <header className="bg-green-600 text-white py-4 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold">YZT Yemek Siparisi</h1>
          <div className="flex items-center gap-2">
            <Link
              href="/siparislerim"
              className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              Siparislerim
            </Link>
            <button
              onClick={handleAdminClick}
              className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Admin
            </button>
          </div>
        </div>
      </header>

      {/* Siparis Kapali Uyarisi */}
      {!orderStatus.isOpen && (
        <div className="bg-red-500 text-white text-center py-3 px-4">
          <p className="font-semibold">Siparisler su an kapali!</p>
          <p className="text-sm">Yeni siparis verilemez.</p>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Menu</h2>
          <p className="text-gray-600">Restoran ve yemeklerinizi secin, siparis verin</p>
        </div>

        <OrderForm menu={menu} orderStatus={orderStatus} />
      </div>

      {/* Admin Panel Modal */}
      <AdminPanel
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
        isAuthenticated={isAdminAuthenticated}
        onAuthenticate={handleAdminAuth}
      />
    </main>
  );
}
