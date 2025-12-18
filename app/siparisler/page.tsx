"use client";

import Link from "next/link";
import OrderList from "@/components/OrderList";
import PasswordProtect from "@/components/PasswordProtect";

export default function SiparislerPage() {
  return (
    <PasswordProtect title="Siparişler">
      <main className="min-h-screen">
        {/* Header */}
        <header className="bg-green-600 text-white py-4 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Siparişler</h1>
            <div className="flex items-center gap-2">
              <Link
                href="/menu-duzenle"
                className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Menuyu Duzenle
              </Link>
              <Link
                href="/"
                className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors"
              >
                Siparis Ver
              </Link>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <OrderList />
        </div>
      </main>
    </PasswordProtect>
  );
}
