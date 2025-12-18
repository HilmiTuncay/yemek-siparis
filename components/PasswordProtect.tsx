"use client";

import { useState, useEffect, ReactNode } from "react";
import Image from "next/image";

interface PasswordProtectProps {
  children: ReactNode;
  title: string;
}

const CORRECT_PASSWORD = "1235";
const AUTH_KEY = "yemek-siparis-admin-auth";
// #taloswin

export default function PasswordProtect({ children, title }: PasswordProtectProps) {
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTH_KEY);
      if (saved === "unlocked") {
        setIsUnlocked(true);
      }
    } catch {
      // localStorage erişim hatası
    }
    setChecking(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      try {
        localStorage.setItem(AUTH_KEY, "unlocked");
      } catch {
        // localStorage erişim hatası
      }
      setIsUnlocked(true);
    } else {
      setError(true);
      setPassword("");
      setTimeout(() => setError(false), 2000);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 p-4">
        {/* Banner */}
        <div className="w-full max-w-sm mb-6 rounded-2xl overflow-hidden shadow-xl">
          <Image
            src="/hop.jpg"
            alt="YZT Banner"
            width={500}
            height={300}
            className="w-full h-auto"
            priority
          />
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-sm w-full">
          <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">{title}</h1>
            <p className="text-gray-500 mb-6 text-center text-sm">
              Bu sayfaya erişmek için şifre gerekli
            </p>

          <form onSubmit={handleSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Şifre"
              className={`w-full px-4 py-3 rounded-xl text-center text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all mb-4 ${
                error
                  ? "bg-red-100 border-2 border-red-400 text-red-600 animate-shake"
                  : "bg-gray-100 border-2 border-transparent text-gray-800"
              }`}
              autoFocus
            />

            {error && (
              <p className="text-red-500 text-center mb-4 text-sm font-medium">
                Yanlış şifre
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Giriş Yap
            </button>
          </form>

          <a
            href="/"
            className="block text-center mt-4 text-blue-600 hover:text-blue-800 text-sm"
          >
            Ana Sayfaya Dön
          </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
