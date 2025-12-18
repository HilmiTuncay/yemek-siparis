"use client";

import { Restaurant, OrderItemSelection } from "@/types";
import ProductCard from "./ProductCard";

interface RestaurantSectionProps {
  restaurant: Restaurant;
  selections: Record<string, OrderItemSelection>;
  onAddToCart: (productId: string, selection: OrderItemSelection) => void;
  onRemoveFromCart: (productId: string) => void;
  onUpdateCart: (productId: string, selection: OrderItemSelection) => void;
  isOrdersClosed?: boolean; // Genel siparis durumu
}

export default function RestaurantSection({
  restaurant,
  selections,
  onAddToCart,
  onRemoveFromCart,
  onUpdateCart,
  isOrdersClosed = false,
}: RestaurantSectionProps) {
  const restaurantTotal = Object.values(selections).reduce(
    (sum, sel) => sum + sel.itemTotal,
    0
  );

  // Restoran kapaliysa veya genel siparisler kapaliysa
  const isRestaurantClosed = restaurant.isOpen === false;
  const isClosed = isOrdersClosed || isRestaurantClosed;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-gray-800">{restaurant.name}</h3>
          {isRestaurantClosed && (
            <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-1 rounded-full">
              Siparis Kapali
            </span>
          )}
        </div>
        {restaurantTotal > 0 && (
          <span className="text-green-600 font-semibold">
            Toplam: {restaurantTotal} TL
          </span>
        )}
      </div>

      {/* Restoran kapaliysa uyari */}
      {isRestaurantClosed && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-center">
          <p className="text-red-600 text-sm font-medium">
            Bu restoran su an siparis almiyor
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {restaurant.products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            restaurantId={restaurant.id}
            restaurantName={restaurant.name}
            selection={selections[product.id] || null}
            onAddToCart={(sel) => onAddToCart(product.id, sel)}
            onRemoveFromCart={() => onRemoveFromCart(product.id)}
            onUpdateCart={(sel) => onUpdateCart(product.id, sel)}
            disabled={isClosed}
          />
        ))}
      </div>
    </div>
  );
}
