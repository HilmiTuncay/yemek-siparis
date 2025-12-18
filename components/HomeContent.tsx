"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Menu, OrderSystemStatus } from "@/types";
import OrderForm from "./OrderForm";
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

  // Admin auth kontrolü - Artık localStorage kullanmıyoruz, her açılışta soracak
  
  const handleUnlock = useCallback(() => {
    setIsUnlocked(true);
  }, []);

  const handleAdminClick = () => {
    // Her tiklamada sifre sorsun istiyorsak, auth durumunu burada da sifirlayabiliriz
    // Veya sadece panel kapandiginda sifirlariz.
    // Kullanici "her tikladiginda sifre ekrani gelmeli" dedi.
    setIsAdminAuthenticated(false);
    setShowAdminPanel(true);
  };

  const handleAdminAuth = () => {
    setIsAdminAuthenticated(true);
  };

  const handleCloseAdminPanel = () => {
    setShowAdminPanel(false);
    setIsAdminAuthenticated(false);
  };


  return (
    <main className="min-h-screen pb-24">
      {/* Header */}
      <header className="bg-green-600 text-white py-4 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold">YZT Yemek Siparisi</h1>
          <div className="flex items-center gap-2">
            {/* Admin butonu - kucuk ve solda */}
            <button
              onClick={handleAdminClick}
              className="bg-green-700/50 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
              title="Admin Paneli"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            {/* Siparislerim butonu */}
            <Link
              href="/siparislerim"
              className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              Siparislerim
            </Link>
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
        onClose={handleCloseAdminPanel}
        isAuthenticated={isAdminAuthenticated}
        onAuthenticate={handleAdminAuth}
      />
    </main>
  );
}
