"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, Restaurant, Product, DrinkOption, SauceOption, ExtraOption } from "@/types";
import { defaultDrinkOptions } from "@/lib/menu";
import PasswordProtect from "@/components/PasswordProtect";

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function MenuDuzenleContent() {
  const [menu, setMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showDefaultDrinks, setShowDefaultDrinks] = useState(false);
  const [expandedRestaurantDrinks, setExpandedRestaurantDrinks] = useState<Record<string, boolean>>({});

  // Menüyü yükle
  useEffect(() => {
    fetch("/api/menu")
      .then((res) => res.json())
      .then((data) => {
        setMenu(data);
        setLoading(false);
      })
      .catch(() => {
        setMessage({ type: "error", text: "Menü yüklenemedi" });
        setLoading(false);
      });
  }, []);

  // Menüyü kaydet
  const handleSave = async () => {
    if (!menu) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/menu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(menu),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Menü kaydedildi!" });
      } else {
        setMessage({ type: "error", text: "Kaydetme hatası" });
      }
    } catch {
      setMessage({ type: "error", text: "Bağlantı hatası" });
    } finally {
      setSaving(false);
    }
  };

  // Restoran ekle
  const addRestaurant = () => {
    if (!menu) return;
    const newRestaurant: Restaurant = {
      id: generateId(),
      name: "Yeni Restoran",
      products: [],
      iban: "",
      accountHolder: "",
    };
    setMenu({ ...menu, restaurants: [...menu.restaurants, newRestaurant] });
  };

  // Restoran güncelle
  const updateRestaurant = (index: number, updates: Partial<Restaurant>) => {
    if (!menu) return;
    const restaurants = [...menu.restaurants];
    restaurants[index] = { ...restaurants[index], ...updates };
    setMenu({ ...menu, restaurants });
  };

  // Restoran sil
  const deleteRestaurant = (index: number) => {
    if (!menu) return;
    if (!confirm("Bu restoranı silmek istediğinizden emin misiniz?")) return;
    const restaurants = menu.restaurants.filter((_, i) => i !== index);
    setMenu({ ...menu, restaurants });
  };

  // Ürün ekle - global varsayılan içecekleri kullan
  const addProduct = (restaurantIndex: number) => {
    if (!menu) return;
    const globalDrinks = menu.defaultDrinks || defaultDrinkOptions;
    const newProduct: Product = {
      id: generateId(),
      name: "Yeni Ürün",
      portions: [{ id: "normal", name: "Normal Porsiyon", price: 100 }],
      drinkOptions: globalDrinks.map(d => ({ ...d, id: d.id || generateId() })),
      defaultDrinkId: globalDrinks[0]?.id || "ayran",
    };
    const restaurants = [...menu.restaurants];
    restaurants[restaurantIndex].products.push(newProduct);
    setMenu({ ...menu, restaurants });
  };

  // Global varsayılan içecek ekle
  const addDefaultDrink = () => {
    if (!menu) return;
    const drinks = menu.defaultDrinks || [...defaultDrinkOptions];
    drinks.push({
      id: generateId(),
      name: "Yeni İçecek",
      priceModifier: 0,
    });
    setMenu({ ...menu, defaultDrinks: drinks });
  };

  // Global varsayılan içecek güncelle
  const updateDefaultDrink = (index: number, updates: { name?: string; priceModifier?: number }) => {
    if (!menu) return;
    const drinks = [...(menu.defaultDrinks || defaultDrinkOptions)];
    if (updates.name !== undefined) drinks[index].name = updates.name;
    if (updates.priceModifier !== undefined) drinks[index].priceModifier = updates.priceModifier;
    setMenu({ ...menu, defaultDrinks: drinks });
  };

  // Global varsayılan içecek sil
  const deleteDefaultDrink = (index: number) => {
    if (!menu) return;
    const drinks = [...(menu.defaultDrinks || defaultDrinkOptions)];
    if (drinks.length <= 1) {
      alert("En az bir varsayılan içecek olmalı");
      return;
    }
    drinks.splice(index, 1);
    setMenu({ ...menu, defaultDrinks: drinks });
  };

  // Tüm ürünlere varsayılan içecekleri uygula
  const applyDefaultDrinksToAll = () => {
    if (!menu) return;
    if (!confirm("Tüm ürünlerin içecek listesi varsayılan içeceklerle değiştirilecek. Devam etmek istiyor musunuz?")) return;

    const globalDrinks = menu.defaultDrinks || defaultDrinkOptions;
    const restaurants = menu.restaurants.map(restaurant => ({
      ...restaurant,
      products: restaurant.products.map(product => ({
        ...product,
        drinkOptions: globalDrinks.map(d => ({ ...d })),
        defaultDrinkId: globalDrinks[0]?.id || product.defaultDrinkId,
      })),
    }));
    setMenu({ ...menu, restaurants });
    setMessage({ type: "success", text: "Tüm ürünlere varsayılan içecekler uygulandı!" });
  };

  // Restoran içeceği ekle
  const addRestaurantDrink = (restaurantIndex: number) => {
    if (!menu) return;
    const restaurants = [...menu.restaurants];
    const drinks = restaurants[restaurantIndex].drinks || [];
    drinks.push({
      id: generateId(),
      name: "Yeni İçecek",
      priceModifier: 0,
    });
    restaurants[restaurantIndex].drinks = drinks;
    setMenu({ ...menu, restaurants });
  };

  // Restoran içeceği güncelle
  const updateRestaurantDrink = (
    restaurantIndex: number,
    drinkIndex: number,
    updates: { name?: string; priceModifier?: number }
  ) => {
    if (!menu) return;
    const restaurants = [...menu.restaurants];
    const drinks = [...(restaurants[restaurantIndex].drinks || [])];
    if (updates.name !== undefined) drinks[drinkIndex].name = updates.name;
    if (updates.priceModifier !== undefined) drinks[drinkIndex].priceModifier = updates.priceModifier;
    restaurants[restaurantIndex].drinks = drinks;
    setMenu({ ...menu, restaurants });
  };

  // Restoran içeceği sil
  const deleteRestaurantDrink = (restaurantIndex: number, drinkIndex: number) => {
    if (!menu) return;
    const restaurants = [...menu.restaurants];
    const drinks = [...(restaurants[restaurantIndex].drinks || [])];
    drinks.splice(drinkIndex, 1);
    restaurants[restaurantIndex].drinks = drinks;
    setMenu({ ...menu, restaurants });
  };

  // Restoran içeceklerini tüm ürünlere uygula
  const applyRestaurantDrinksToProducts = (restaurantIndex: number) => {
    if (!menu) return;
    const restaurants = [...menu.restaurants];
    const restaurantDrinks = restaurants[restaurantIndex].drinks;
    if (!restaurantDrinks || restaurantDrinks.length === 0) {
      alert("Önce restoran içeceklerini tanımlayın");
      return;
    }
    restaurants[restaurantIndex].products = restaurants[restaurantIndex].products.map(product => ({
      ...product,
      drinkOptions: restaurantDrinks.map(d => ({ ...d })),
      defaultDrinkId: restaurantDrinks[0]?.id || product.defaultDrinkId,
      useRestaurantDrinks: true,
    }));
    setMenu({ ...menu, restaurants });
    setMessage({ type: "success", text: `${restaurants[restaurantIndex].name} ürünlerine içecekler uygulandı!` });
  };

  // Restoran sipariş durumunu değiştir
  const toggleRestaurantOpen = (restaurantIndex: number) => {
    if (!menu) return;
    const restaurants = [...menu.restaurants];
    restaurants[restaurantIndex].isOpen = !(restaurants[restaurantIndex].isOpen ?? true);
    setMenu({ ...menu, restaurants });
  };

  // Ürün güncelle
  const updateProduct = (restaurantIndex: number, productIndex: number, updates: Partial<Product>) => {
    if (!menu) return;
    const restaurants = [...menu.restaurants];
    restaurants[restaurantIndex].products[productIndex] = {
      ...restaurants[restaurantIndex].products[productIndex],
      ...updates,
    };
    setMenu({ ...menu, restaurants });
  };

  // Ürün sil
  const deleteProduct = (restaurantIndex: number, productIndex: number) => {
    if (!menu) return;
    const restaurants = [...menu.restaurants];
    restaurants[restaurantIndex].products = restaurants[restaurantIndex].products.filter(
      (_, i) => i !== productIndex
    );
    setMenu({ ...menu, restaurants });
  };

  // Porsiyon ekle
  const addPortion = (restaurantIndex: number, productIndex: number) => {
    if (!menu) return;
    const restaurants = [...menu.restaurants];
    const product = restaurants[restaurantIndex].products[productIndex];
    product.portions.push({
      id: generateId(),
      name: "Yeni Porsiyon",
      price: 100,
    });
    setMenu({ ...menu, restaurants });
  };

  // Porsiyon güncelle
  const updatePortion = (
    restaurantIndex: number,
    productIndex: number,
    portionIndex: number,
    updates: { name?: string; price?: number }
  ) => {
    if (!menu) return;
    const restaurants = [...menu.restaurants];
    const portion = restaurants[restaurantIndex].products[productIndex].portions[portionIndex];
    if (updates.name !== undefined) portion.name = updates.name;
    if (updates.price !== undefined) portion.price = updates.price;
    setMenu({ ...menu, restaurants });
  };

  // Porsiyon sil
  const deletePortion = (restaurantIndex: number, productIndex: number, portionIndex: number) => {
    if (!menu) return;
    const restaurants = [...menu.restaurants];
    const product = restaurants[restaurantIndex].products[productIndex];
    if (product.portions.length <= 1) {
      alert("En az bir porsiyon olmalı");
      return;
    }
    product.portions = product.portions.filter((_, i) => i !== portionIndex);
    setMenu({ ...menu, restaurants });
  };

  // İçecek ekle
  const addDrink = (restaurantIndex: number, productIndex: number) => {
    if (!menu) return;
    const restaurants = [...menu.restaurants];
    const product = restaurants[restaurantIndex].products[productIndex];
    product.drinkOptions.push({
      id: generateId(),
      name: "Yeni İçecek",
      priceModifier: 0,
    });
    setMenu({ ...menu, restaurants });
  };

  // İçecek güncelle
  const updateDrink = (
    restaurantIndex: number,
    productIndex: number,
    drinkIndex: number,
    updates: { name?: string; priceModifier?: number }
  ) => {
    if (!menu) return;
    const restaurants = [...menu.restaurants];
    const drink = restaurants[restaurantIndex].products[productIndex].drinkOptions[drinkIndex];
    if (updates.name !== undefined) drink.name = updates.name;
    if (updates.priceModifier !== undefined) drink.priceModifier = updates.priceModifier;
    setMenu({ ...menu, restaurants });
  };

  // İçecek sil
  const deleteDrink = (restaurantIndex: number, productIndex: number, drinkIndex: number) => {
    if (!menu) return;
    const restaurants = [...menu.restaurants];
    const product = restaurants[restaurantIndex].products[productIndex];
    if (product.drinkOptions.length <= 1) {
      alert("En az bir içecek seçeneği olmalı");
      return;
    }
    const deletedDrinkId = product.drinkOptions[drinkIndex].id;
    product.drinkOptions = product.drinkOptions.filter((_, i) => i !== drinkIndex);
    // Varsayılan içecek silindiyse ilk içeceği varsayılan yap
    if (product.defaultDrinkId === deletedDrinkId) {
      product.defaultDrinkId = product.drinkOptions[0].id;
    }
    setMenu({ ...menu, restaurants });
  };

  // Varsayılan içeceği değiştir
  const setDefaultDrink = (restaurantIndex: number, productIndex: number, drinkId: string) => {
    if (!menu) return;
    const restaurants = [...menu.restaurants];
    restaurants[restaurantIndex].products[productIndex].defaultDrinkId = drinkId;
    setMenu({ ...menu, restaurants });
  };

  // Global içecek kullanımını değiştir
  const toggleUseGlobalDrinks = (restaurantIndex: number, productIndex: number) => {
    if (!menu) return;
    const restaurants = [...menu.restaurants];
    const product = restaurants[restaurantIndex].products[productIndex];
    const newValue = !product.useGlobalDrinks;
    product.useGlobalDrinks = newValue;

    // Global içeceklere geçilirse, içecek listesini güncelle
    if (newValue && menu.defaultDrinks) {
      product.drinkOptions = menu.defaultDrinks.map(d => ({ ...d }));
      product.defaultDrinkId = menu.defaultDrinks[0]?.id || product.defaultDrinkId;
    }
    setMenu({ ...menu, restaurants });
  };

  // Sos ekle
  const addSauce = (restaurantIndex: number, productIndex: number) => {
    if (!menu) return;
    const restaurants = [...menu.restaurants];
    const product = restaurants[restaurantIndex].products[productIndex];
    if (!product.sauces) product.sauces = [];
    product.sauces.push({
      id: generateId(),
      name: "Yeni Sos",
      priceModifier: 0,
    });
    setMenu({ ...menu, restaurants });
  };

  // Sos güncelle
  const updateSauce = (
    restaurantIndex: number,
    productIndex: number,
    sauceIndex: number,
    updates: { name?: string; priceModifier?: number }
  ) => {
    if (!menu) return;
    const restaurants = [...menu.restaurants];
    const sauce = restaurants[restaurantIndex].products[productIndex].sauces?.[sauceIndex];
    if (!sauce) return;
    if (updates.name !== undefined) sauce.name = updates.name;
    if (updates.priceModifier !== undefined) sauce.priceModifier = updates.priceModifier;
    setMenu({ ...menu, restaurants });
  };

  // Sos sil
  const deleteSauce = (restaurantIndex: number, productIndex: number, sauceIndex: number) => {
    if (!menu) return;
    const restaurants = [...menu.restaurants];
    const product = restaurants[restaurantIndex].products[productIndex];
    if (!product.sauces) return;
    product.sauces = product.sauces.filter((_, i) => i !== sauceIndex);
    setMenu({ ...menu, restaurants });
  };

  // Ekstra ekle
  const addExtra = (restaurantIndex: number, productIndex: number) => {
    if (!menu) return;
    const restaurants = [...menu.restaurants];
    const product = restaurants[restaurantIndex].products[productIndex];
    if (!product.extras) product.extras = [];
    product.extras.push({
      id: generateId(),
      name: "Yeni Ekstra",
      priceModifier: 0,
    });
    setMenu({ ...menu, restaurants });
  };

  // Ekstra güncelle
  const updateExtra = (
    restaurantIndex: number,
    productIndex: number,
    extraIndex: number,
    updates: { name?: string; priceModifier?: number }
  ) => {
    if (!menu) return;
    const restaurants = [...menu.restaurants];
    const extra = restaurants[restaurantIndex].products[productIndex].extras?.[extraIndex];
    if (!extra) return;
    if (updates.name !== undefined) extra.name = updates.name;
    if (updates.priceModifier !== undefined) extra.priceModifier = updates.priceModifier;
    setMenu({ ...menu, restaurants });
  };

  // Ekstra sil
  const deleteExtra = (restaurantIndex: number, productIndex: number, extraIndex: number) => {
    if (!menu) return;
    const restaurants = [...menu.restaurants];
    const product = restaurants[restaurantIndex].products[productIndex];
    if (!product.extras) return;
    product.extras = product.extras.filter((_, i) => i !== extraIndex);
    setMenu({ ...menu, restaurants });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Yükleniyor...</div>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Menü yüklenemedi</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white py-4 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Menü Düzenle</h1>
          <Link
            href="/"
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Geri Dön
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mesaj */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Varsayılan İçecekler Bölümü */}
        <div className="bg-purple-50 rounded-lg shadow-md p-4 mb-6">
          <button
            onClick={() => setShowDefaultDrinks(!showDefaultDrinks)}
            className="w-full flex items-center justify-between text-left"
          >
            <div>
              <h2 className="text-lg font-bold text-purple-800">Varsayılan İçecekler</h2>
              <p className="text-sm text-purple-600">Yeni eklenen ürünlere otomatik eklenecek içecekler</p>
            </div>
            <svg
              className={`w-6 h-6 text-purple-600 transform transition-transform ${showDefaultDrinks ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showDefaultDrinks && (
            <div className="mt-4 pt-4 border-t border-purple-200">
              <div className="space-y-2 mb-4">
                {(menu.defaultDrinks || defaultDrinkOptions).map((drink, index) => (
                  <div key={drink.id || index} className="flex items-center gap-2 bg-white rounded-lg p-2">
                    <input
                      type="text"
                      value={drink.name}
                      onChange={(e) => updateDefaultDrink(index, { name: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="İçecek adı"
                    />
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={drink.priceModifier === 0 ? "" : drink.priceModifier}
                        placeholder="0"
                        onChange={(e) => updateDefaultDrink(index, { priceModifier: parseInt(e.target.value) || 0 })}
                        className="w-20 px-2 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <span className="text-sm text-gray-500">TL</span>
                    </div>
                    <button
                      onClick={() => deleteDefaultDrink(index)}
                      className="px-3 py-2 text-red-500 hover:bg-red-100 rounded-lg"
                    >
                      Sil
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={addDefaultDrink}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  + İçecek Ekle
                </button>
                <button
                  onClick={applyDefaultDrinksToAll}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Tüm Ürünlere Uygula
                </button>
              </div>
              <p className="text-xs text-purple-500 mt-2">
                Not: &quot;Tüm Ürünlere Uygula&quot; mevcut tüm ürünlerin içecek listesini bu listeyle değiştirir.
              </p>
            </div>
          )}
        </div>

        {/* Restoranlar */}
        {menu.restaurants.map((restaurant, rIndex) => (
          <div key={restaurant.id} className="bg-white rounded-lg shadow-md p-6 mb-6">
            {/* Restoran Header */}
            <div className="flex flex-wrap gap-4 items-start mb-4 pb-4 border-b">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Restoran Adı</label>
                <input
                  type="text"
                  value={restaurant.name}
                  onChange={(e) => updateRestaurant(rIndex, { name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">IBAN</label>
                <input
                  type="text"
                  value={restaurant.iban || ""}
                  onChange={(e) => updateRestaurant(rIndex, { iban: e.target.value })}
                  placeholder="TR..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Hesap Sahibi</label>
                <input
                  type="text"
                  value={restaurant.accountHolder || ""}
                  onChange={(e) => updateRestaurant(rIndex, { accountHolder: e.target.value })}
                  placeholder="Ad Soyad"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col gap-2 mt-6">
                <button
                  onClick={() => toggleRestaurantOpen(rIndex)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    restaurant.isOpen !== false
                      ? "bg-green-100 text-green-600 hover:bg-green-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {restaurant.isOpen !== false ? "Açık" : "Kapalı"}
                </button>
                <button
                  onClick={() => deleteRestaurant(rIndex)}
                  className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Sil
                </button>
              </div>
            </div>

            {/* Restoran İçecekleri */}
            <div className="mb-4 p-4 bg-orange-50 rounded-lg">
              <button
                onClick={() => setExpandedRestaurantDrinks(prev => ({ ...prev, [restaurant.id]: !prev[restaurant.id] }))}
                className="w-full flex items-center justify-between text-left"
              >
                <div>
                  <span className="font-medium text-orange-800">Restoran İçecekleri</span>
                  <span className="text-sm text-orange-600 ml-2">
                    ({(restaurant.drinks || []).length} içecek)
                  </span>
                </div>
                <svg
                  className={`w-5 h-5 text-orange-600 transform transition-transform ${expandedRestaurantDrinks[restaurant.id] ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {expandedRestaurantDrinks[restaurant.id] && (
                <div className="mt-3 pt-3 border-t border-orange-200">
                  <div className="space-y-2 mb-3">
                    {(restaurant.drinks || []).map((drink, dIndex) => (
                      <div key={drink.id} className="flex items-center gap-2 bg-white rounded p-2">
                        <input
                          type="text"
                          value={drink.name}
                          onChange={(e) => updateRestaurantDrink(rIndex, dIndex, { name: e.target.value })}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="İçecek adı"
                        />
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={drink.priceModifier}
                            onChange={(e) => updateRestaurantDrink(rIndex, dIndex, { priceModifier: parseInt(e.target.value) || 0 })}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <span className="text-xs text-gray-500">TL</span>
                        </div>
                        <button
                          onClick={() => deleteRestaurantDrink(rIndex, dIndex)}
                          className="px-2 py-1 text-red-500 hover:bg-red-100 rounded text-sm"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => addRestaurantDrink(rIndex)}
                      className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
                    >
                      + İçecek Ekle
                    </button>
                    <button
                      onClick={() => applyRestaurantDrinksToProducts(rIndex)}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                      Tüm Ürünlere Uygula
                    </button>
                  </div>
                  <p className="text-xs text-orange-500 mt-2">
                    Bu içecekler bu restoranın tüm ürünlerine uygulanabilir.
                  </p>
                </div>
              )}
            </div>

            {/* Ürünler */}
            <div className="space-y-4">
              {restaurant.products.map((product, pIndex) => (
                <div key={product.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-4 mb-3">
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) => updateProduct(rIndex, pIndex, { name: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ürün adı"
                    />
                    <button
                      onClick={() => deleteProduct(rIndex, pIndex)}
                      className="px-3 py-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      Ürünü Sil
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 ml-4">
                    {/* Porsiyonlar */}
                    <div>
                      <div className="text-sm font-medium text-gray-600 mb-2">Porsiyonlar:</div>
                      <div className="space-y-2">
                        {product.portions.map((portion, portIndex) => (
                          <div key={portion.id} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={portion.name}
                              onChange={(e) =>
                                updatePortion(rIndex, pIndex, portIndex, { name: e.target.value })
                              }
                              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="Porsiyon adı"
                            />
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={portion.price === 0 ? "" : portion.price}
                                placeholder="0"
                                onChange={(e) =>
                                  updatePortion(rIndex, pIndex, portIndex, {
                                    price: parseInt(e.target.value) || 0,
                                  })
                                }
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                              <span className="text-sm text-gray-500">TL</span>
                            </div>
                            <button
                              onClick={() => deletePortion(rIndex, pIndex, portIndex)}
                              className="px-2 py-1 text-red-500 hover:bg-red-100 rounded text-sm"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => addPortion(rIndex, pIndex)}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        + Porsiyon Ekle
                      </button>
                    </div>

                    {/* İçecekler */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">İçecek Seçenekleri:</span>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={product.useGlobalDrinks || false}
                            onChange={() => toggleUseGlobalDrinks(rIndex, pIndex)}
                            className="w-4 h-4 text-purple-600 rounded"
                          />
                          <span className="text-purple-600">Global liste</span>
                        </label>
                      </div>
                      {product.useGlobalDrinks ? (
                        <div className="bg-purple-50 rounded p-2 text-sm text-purple-700">
                          Global içecek listesi kullanılıyor. Değiştirmek için &quot;Varsayılan İçecekler&quot; bölümünü düzenleyin.
                        </div>
                      ) : (
                        <>
                          <div className="space-y-2">
                            {product.drinkOptions.map((drink, drinkIndex) => (
                              <div key={drink.id} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`default-drink-${product.id}`}
                                  checked={product.defaultDrinkId === drink.id}
                                  onChange={() => setDefaultDrink(rIndex, pIndex, drink.id)}
                                  className="w-4 h-4 text-blue-600"
                                  title="Varsayılan içecek"
                                />
                                <input
                                  type="text"
                                  value={drink.name}
                                  onChange={(e) =>
                                    updateDrink(rIndex, pIndex, drinkIndex, { name: e.target.value })
                                  }
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="İçecek adı"
                                />
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    value={drink.priceModifier === 0 ? "" : drink.priceModifier}
                                    placeholder="0"
                                    onChange={(e) =>
                                      updateDrink(rIndex, pIndex, drinkIndex, {
                                        priceModifier: parseInt(e.target.value) || 0,
                                      })
                                    }
                                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                  <span className="text-sm text-gray-500">TL</span>
                                </div>
                                <button
                                  onClick={() => deleteDrink(rIndex, pIndex, drinkIndex)}
                                  className="px-2 py-1 text-red-500 hover:bg-red-100 rounded text-sm"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={() => addDrink(rIndex, pIndex)}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                          >
                            + İçecek Ekle
                          </button>
                        </>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Seçili olan varsayılan içecektir. Fiyat farkı + veya - olabilir.
                      </p>
                    </div>
                  </div>

                  {/* Soslar ve Ekstralar */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 ml-4 mt-4">
                    {/* Soslar */}
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <div className="text-sm font-medium text-yellow-800 mb-2">Sos Seçenekleri (opsiyonel):</div>
                      <div className="space-y-2">
                        {(product.sauces || []).map((sauce, sauceIndex) => (
                          <div key={sauce.id} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={sauce.name}
                              onChange={(e) =>
                                updateSauce(rIndex, pIndex, sauceIndex, { name: e.target.value })
                              }
                              className="flex-1 px-2 py-1 border border-yellow-300 rounded text-sm"
                              placeholder="Sos adı"
                            />
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={sauce.priceModifier === 0 ? "" : sauce.priceModifier}
                                placeholder="0"
                                onChange={(e) =>
                                  updateSauce(rIndex, pIndex, sauceIndex, {
                                    priceModifier: parseInt(e.target.value) || 0,
                                  })
                                }
                                className="w-16 px-2 py-1 border border-yellow-300 rounded text-sm"
                              />
                              <span className="text-sm text-yellow-600">TL</span>
                            </div>
                            <button
                              onClick={() => deleteSauce(rIndex, pIndex, sauceIndex)}
                              className="px-2 py-1 text-red-500 hover:bg-red-100 rounded text-sm"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => addSauce(rIndex, pIndex)}
                        className="mt-2 text-sm text-yellow-700 hover:text-yellow-900"
                      >
                        + Sos Ekle
                      </button>
                      <p className="text-xs text-yellow-600 mt-1">
                        Makarna gibi ürünler için sos seçeneği ekleyin.
                      </p>
                    </div>

                    {/* Ekstralar */}
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-sm font-medium text-green-800 mb-2">Ekstralar (opsiyonel):</div>
                      <div className="space-y-2">
                        {(product.extras || []).map((extra, extraIndex) => (
                          <div key={extra.id} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={extra.name}
                              onChange={(e) =>
                                updateExtra(rIndex, pIndex, extraIndex, { name: e.target.value })
                              }
                              className="flex-1 px-2 py-1 border border-green-300 rounded text-sm"
                              placeholder="Ekstra adı (örn: Tavuklu)"
                            />
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={extra.priceModifier === 0 ? "" : extra.priceModifier}
                                placeholder="0"
                                onChange={(e) =>
                                  updateExtra(rIndex, pIndex, extraIndex, {
                                    priceModifier: parseInt(e.target.value) || 0,
                                  })
                                }
                                className="w-16 px-2 py-1 border border-green-300 rounded text-sm"
                              />
                              <span className="text-sm text-green-600">TL</span>
                            </div>
                            <button
                              onClick={() => deleteExtra(rIndex, pIndex, extraIndex)}
                              className="px-2 py-1 text-red-500 hover:bg-red-100 rounded text-sm"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => addExtra(rIndex, pIndex)}
                        className="mt-2 text-sm text-green-700 hover:text-green-900"
                      >
                        + Ekstra Ekle
                      </button>
                      <p className="text-xs text-green-600 mt-1">
                        Tavuklu, peynirli gibi ekstra seçenekler ekleyin.
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => addProduct(rIndex)}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                + Ürün Ekle
              </button>
            </div>
          </div>
        ))}

        {/* Restoran Ekle */}
        <button
          onClick={addRestaurant}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors mb-6"
        >
          + Yeni Restoran Ekle
        </button>

        {/* Kaydet Butonu */}
        <div className="sticky bottom-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-lg shadow-lg transition-colors"
          >
            {saving ? "Kaydediliyor..." : "Menüyü Kaydet"}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function MenuDuzenlePage() {
  return (
    <PasswordProtect title="Menü Düzenle">
      <MenuDuzenleContent />
    </PasswordProtect>
  );
}
