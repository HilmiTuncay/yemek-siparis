"use client";

import { useState } from "react";
import { Product, OrderItemSelection } from "@/types";

interface ProductCardProps {
  product: Product;
  restaurantId: string;
  restaurantName: string;
  selection: OrderItemSelection | null;
  onAddToCart: (selection: OrderItemSelection) => void;
  onRemoveFromCart: () => void;
  onUpdateCart: (selection: OrderItemSelection) => void;
}

export default function ProductCard({
  product,
  restaurantId,
  restaurantName,
  selection,
  onAddToCart,
  onRemoveFromCart,
  onUpdateCart,
}: ProductCardProps) {
  // Local state - henüz sepete eklenmemiş seçimler için
  const [localPortionId, setLocalPortionId] = useState<string | null>(null);
  const [localDrinkId, setLocalDrinkId] = useState<string>(product.defaultDrinkId);
  const [localQuantity, setLocalQuantity] = useState(1);
  const [localSauceId, setLocalSauceId] = useState<string | null>(
    product.sauces && product.sauces.length > 0 ? product.sauces[0].id : null
  );
  const [localExtraId, setLocalExtraId] = useState<string | null>(null);

  const hasSauces = product.sauces && product.sauces.length > 0;
  const hasExtras = product.extras && product.extras.length > 0;

  const isInCart = selection !== null;
  const hasLocalSelection = localPortionId !== null;

  const handlePortionSelect = (portionId: string) => {
    if (isInCart) return; // Sepetteyse porsiyon değiştirilemez
    setLocalPortionId(portionId);
  };

  const handleLocalDrinkChange = (drinkId: string) => {
    setLocalDrinkId(drinkId);
  };

  const handleLocalQuantityChange = (delta: number) => {
    const newQty = Math.max(1, localQuantity + delta);
    setLocalQuantity(newQty);
  };

  const handleAddToCart = () => {
    if (!localPortionId) return;

    const portion = product.portions.find((p) => p.id === localPortionId);
    const drink = product.drinkOptions.find((d) => d.id === localDrinkId) || product.drinkOptions[0];
    if (!portion || !drink) return;

    const sauce = localSauceId ? product.sauces?.find((s) => s.id === localSauceId) : null;
    const extra = localExtraId ? product.extras?.find((e) => e.id === localExtraId) : null;

    const sauceModifier = sauce?.priceModifier || 0;
    const extraModifier = extra?.priceModifier || 0;

    const newSelection: OrderItemSelection = {
      restaurantId,
      restaurantName,
      productId: product.id,
      productName: product.name,
      portionId: portion.id,
      portionName: portion.name,
      portionPrice: portion.price,
      drinkId: drink.id,
      drinkName: drink.name,
      drinkPriceModifier: drink.priceModifier,
      quantity: localQuantity,
      itemTotal: (portion.price + drink.priceModifier + sauceModifier + extraModifier) * localQuantity,
      // Sos bilgisi
      sauceId: sauce?.id,
      sauceName: sauce?.name,
      saucePriceModifier: sauce?.priceModifier,
      // Ekstra bilgisi
      extraId: extra?.id,
      extraName: extra?.name,
      extraPriceModifier: extra?.priceModifier,
    };

    onAddToCart(newSelection);
    // Local state'i sıfırla
    setLocalPortionId(null);
    setLocalDrinkId(product.defaultDrinkId);
    setLocalQuantity(1);
    setLocalSauceId(product.sauces && product.sauces.length > 0 ? product.sauces[0].id : null);
    setLocalExtraId(null);
  };

  // Sepetteki ürün için adet değiştirme
  const handleCartQuantityChange = (delta: number) => {
    if (!selection) return;
    const newQuantity = Math.max(0, selection.quantity + delta);
    if (newQuantity === 0) {
      onRemoveFromCart();
      return;
    }
    const sauceModifier = selection.saucePriceModifier || 0;
    const extraModifier = selection.extraPriceModifier || 0;
    const updated: OrderItemSelection = {
      ...selection,
      quantity: newQuantity,
      itemTotal: (selection.portionPrice + selection.drinkPriceModifier + sauceModifier + extraModifier) * newQuantity,
    };
    onUpdateCart(updated);
  };

  const handleRemove = () => {
    onRemoveFromCart();
  };

  const calculateLocalTotal = (): number => {
    if (!localPortionId) return 0;
    const portion = product.portions.find((p) => p.id === localPortionId);
    const drink = product.drinkOptions.find((d) => d.id === localDrinkId);
    if (!portion || !drink) return 0;
    const sauce = localSauceId ? product.sauces?.find((s) => s.id === localSauceId) : null;
    const extra = localExtraId ? product.extras?.find((e) => e.id === localExtraId) : null;
    const sauceModifier = sauce?.priceModifier || 0;
    const extraModifier = extra?.priceModifier || 0;
    return (portion.price + drink.priceModifier + sauceModifier + extraModifier) * localQuantity;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 border-2 transition-colors ${isInCart ? "border-green-500" : "border-transparent"}`}>
      <h4 className="font-semibold text-gray-800 mb-3">{product.name}</h4>

      {/* Sepette değilse: Seçim yapma alanı */}
      {!isInCart && (
        <>
          {/* Porsiyon Seçimi */}
          <div className="mb-3">
            <label className="text-sm text-gray-600 block mb-1">Porsiyon:</label>
            <div className="flex flex-wrap gap-2">
              {product.portions.map((portion) => (
                <button
                  key={portion.id}
                  type="button"
                  onClick={() => handlePortionSelect(portion.id)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    localPortionId === portion.id
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  {portion.name} - {portion.price} TL
                </button>
              ))}
            </div>
          </div>

          {/* İçecek ve Adet - sadece porsiyon seçildiyse */}
          {hasLocalSelection && (
            <>
              <div className="mb-3">
                <label className="text-sm text-gray-600 block mb-1">İçecek:</label>
                <select
                  value={localDrinkId}
                  onChange={(e) => handleLocalDrinkChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {product.drinkOptions.map((drink) => (
                    <option key={drink.id} value={drink.id}>
                      {drink.name} {drink.priceModifier !== 0 && `(${drink.priceModifier > 0 ? "+" : ""}${drink.priceModifier} TL)`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sos Seçimi */}
              {hasSauces && (
                <div className="mb-3">
                  <label className="text-sm text-gray-600 block mb-1">Sos:</label>
                  <select
                    value={localSauceId || ""}
                    onChange={(e) => setLocalSauceId(e.target.value || null)}
                    className="w-full px-3 py-2 border border-yellow-300 bg-yellow-50 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    {product.sauces!.map((sauce) => (
                      <option key={sauce.id} value={sauce.id}>
                        {sauce.name} {sauce.priceModifier !== 0 && `(${sauce.priceModifier > 0 ? "+" : ""}${sauce.priceModifier} TL)`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Ekstra Seçimi */}
              {hasExtras && (
                <div className="mb-3">
                  <label className="text-sm text-gray-600 block mb-1">Ekstra (opsiyonel):</label>
                  <select
                    value={localExtraId || ""}
                    onChange={(e) => setLocalExtraId(e.target.value || null)}
                    className="w-full px-3 py-2 border border-green-300 bg-green-50 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Ekstra Yok</option>
                    {product.extras!.map((extra) => (
                      <option key={extra.id} value={extra.id}>
                        {extra.name} {extra.priceModifier !== 0 && `(+${extra.priceModifier} TL)`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Adet Seçimi */}
              <div className="mb-3">
                <label className="text-sm text-gray-600 block mb-1">Adet:</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleLocalQuantityChange(-1)}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg font-bold"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-semibold">{localQuantity}</span>
                  <button
                    type="button"
                    onClick={() => handleLocalQuantityChange(1)}
                    className="w-8 h-8 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center text-lg font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Sepete Ekle Butonu */}
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Toplam:</span>
                  <span className="text-green-600 font-bold">{calculateLocalTotal()} TL</span>
                </div>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Sepete Ekle
                </button>
              </div>
            </>
          )}
        </>
      )}

      {/* Sepetteyse: Sepet görünümü */}
      {isInCart && (
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-sm text-gray-600 mb-2">
            <div>{selection.portionName}</div>
            <div>{selection.drinkName}</div>
            {selection.sauceName && <div className="text-yellow-700">Sos: {selection.sauceName}</div>}
            {selection.extraName && <div className="text-green-700">Ekstra: {selection.extraName}</div>}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-green-200">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCartQuantityChange(-1)}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg font-bold"
              >
                -
              </button>
              <span className="w-8 text-center font-semibold">{selection.quantity}</span>
              <button
                type="button"
                onClick={() => handleCartQuantityChange(1)}
                className="w-8 h-8 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center text-lg font-bold"
              >
                +
              </button>
            </div>
            <div className="text-right">
              <div className="text-green-600 font-bold">{selection.itemTotal} TL</div>
              <button
                type="button"
                onClick={handleRemove}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Kaldır
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
