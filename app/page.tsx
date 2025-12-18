import Link from "next/link";
import { getMenu } from "@/lib/redis";
import OrderForm from "@/components/OrderForm";

export const dynamic = "force-dynamic";

export default async function Home() {
  const menu = await getMenu();

  return (
    <main className="min-h-screen pb-24">
      {/* Header */}
      <header className="bg-green-600 text-white py-4 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold">YZT Yemek Siparişi</h1>
          <Link
            href="/siparisler"
            className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors"
          >
            Siparişleri Gör
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Menü</h2>
          <p className="text-gray-600">Restoran ve yemeklerinizi seçin, sipariş verin</p>
        </div>

        <OrderForm menu={menu} />
      </div>

      {/* Menüyü Düzenle Butonu - Sabit Alt */}
      <div className="fixed bottom-20 right-4 z-50">
        <Link
          href="/menu-duzenle"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full shadow-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Menüyü Düzenle
        </Link>
      </div>
    </main>
  );
}
