"use client";

import { useEffect } from "react";
import Image from "next/image";

interface WelcomeScreenProps {
  onUnlock: () => void;
}

export default function WelcomeScreen({ onUnlock }: WelcomeScreenProps) {
  // Sayfa yüklendiğinde otomatik olarak unlock yap
  useEffect(() => {
    // Kısa bir gecikme ile hoş geldin ekranını göster
    const timer = setTimeout(() => {
      onUnlock();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onUnlock]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-400 to-green-600 p-4">
      {/* Logo / Resim */}
      <div className="mb-8 rounded-2xl overflow-hidden shadow-2xl animate-pulse">
        <Image
          src="/hop.jpg"
          alt="Yemek Siparisi"
          width={400}
          height={400}
          className="object-cover"
          priority
        />
      </div>

      {/* Baslik */}
      <h1 className="text-3xl font-bold text-white mb-2 text-center">
        YZT Yemek Siparisi
      </h1>
      <p className="text-green-100 mb-8 text-center">
        Yukleniyor...
      </p>

      {/* Loading Spinner */}
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent"></div>
    </div>
  );
}
