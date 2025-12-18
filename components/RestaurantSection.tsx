"use client";

import { Restaurant, OrderItemSelection } from "@/types";
import ProductCard from "./ProductCard";

interface RestaurantSectionProps {
  restaurant: Restaurant;
  selections: Record<string, OrderItemSelection>;
  onAddToCart: (productId: string, selection: OrderItemSelection) => void;
  onRemoveFromCart: (productId: string) => void;
  onUpdateCart: (productId: string, selection: OrderItemSelection) => void;
}

export default function RestaurantSection({
  restaurant,
  selections,
  onAddToCart,
  onRemoveFromCart,
  onUpdateCart,
}: RestaurantSectionProps) {
  const restaurantTotal = Object.values(selections).reduce(
    (sum, sel) => sum + sel.itemTotal,
    0
  );

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">{restaurant.name}</h3>
        {restaurantTotal > 0 && (
          <span className="text-green-600 font-semibold">
            Toplam: {restaurantTotal} TL
          </span>
        )}
      </div>

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
          />
        ))}
      </div>
    </div>
  );
}
