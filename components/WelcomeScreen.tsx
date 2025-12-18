"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface WelcomeScreenProps {
  onUnlock: () => void;
}

const CORRECT_PASSWORD = "1235";
const AUTH_KEY = "yemek-siparis-auth";

export default function WelcomeScreen({ onUnlock }: WelcomeScreenProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(true);

  // Sayfa yüklendiğinde localStorage kontrolü
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTH_KEY);
      if (saved === "unlocked") {
        onUnlock();
      }
    } catch {
      // localStorage erişim hatası
    }
    setChecking(false);
  }, [onUnlock]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      try {
        localStorage.setItem(AUTH_KEY, "unlocked");
      } catch {
        // localStorage erişim hatası
      }
      onUnlock();
    } else {
      setError(true);
      setPassword("");
      setTimeout(() => setError(false), 2000);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-green-600">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-400 to-green-600 p-4">
      {/* Logo / Resim */}
      <div className="mb-8 rounded-2xl overflow-hidden shadow-2xl">
        <Image
          src="/hop.jpg"
          alt="Yemek Siparisi"
          width={600}
          height={600}
          className="object-cover"
          priority
        />
      </div>

      {/* Baslik */}
      <h1 className="text-3xl font-bold text-white mb-2 text-center">
        YZT Yemek Siparisi
      </h1>
      <p className="text-green-100 mb-8 text-center">
        Devam etmek icin sifreyi girin
      </p>

      {/* Şifre Formu */}
      <form onSubmit={handleSubmit} className="w-full max-w-xs">
        <div className="relative">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Şifre"
            className={`w-full px-4 py-3 rounded-xl text-center text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-white/30 transition-all ${
              error
                ? "bg-red-100 border-2 border-red-400 text-red-600 animate-shake"
                : "bg-white border-2 border-transparent text-gray-800"
            }`}
            autoFocus
          />
        </div>

        {error && (
          <p className="text-white text-center mt-2 font-medium">
            Yanlış şifre, tekrar deneyin
          </p>
        )}

        <button
          type="submit"
          className="w-full mt-4 py-3 bg-white text-green-600 font-bold rounded-xl hover:bg-green-50 transition-colors shadow-lg"
        >
          Giriş Yap
        </button>
      </form>

      {/* Alt Link */}
      <div className="mt-8">
        <a
          href="/siparislerim"
          className="text-white/80 hover:text-white underline text-sm"
        >
          Siparislerime Git
        </a>
      </div>
    </div>
  );
}
