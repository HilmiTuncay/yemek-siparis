"use client";

import { useState } from "react";
import Link from "next/link";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  onAuthenticate: () => void;
}

const CORRECT_PASSWORD = "1235";

export default function AdminPanel({
  isOpen,
  onClose,
  isAuthenticated,
  onAuthenticate,
}: AdminPanelProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      onAuthenticate();
      setPassword("");
      setError(false);
    } else {
      setError(true);
      setPassword("");
      setTimeout(() => setError(false), 2000);
    }
  };

  // Sifre ekrani - her zaman goster (authenticated degilse)
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Admin Girisi</h2>

          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sifre"
              className={`w-full px-4 py-3 rounded-xl text-center text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all mb-4 ${
                error
                  ? "bg-red-100 border-2 border-red-400 text-red-600"
                  : "bg-gray-100 border-2 border-transparent text-gray-800"
              }`}
              autoFocus
            />

            {error && (
              <p className="text-red-500 text-center mb-4 text-sm font-medium">
                Yanlis sifre
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
              >
                Iptal
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
              >
                Giris
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Admin paneli - sadece linkler
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Admin Paneli</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>

        <div className="space-y-3">
          {/* Genel Siparisler */}
          <Link
            href="/siparisler"
            className="flex items-center justify-between w-full p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors"
            onClick={onClose}
          >
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="font-semibold text-green-800">Genel Siparisler</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Link>

          {/* Menuyu Duzenle */}
          <Link
            href="/menu-duzenle"
            className="flex items-center justify-between w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
            onClick={onClose}
          >
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="font-semibold text-blue-800">Menuyu Duzenle</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Siparis yonetimi Genel Siparisler sayfasinda yapilir
        </p>
      </div>
    </div>
  );
}
