import { Menu, Restaurant } from "@/types";

// Varsayılan içecek seçenekleri (tüm ürünlerde kullanılabilir)
export const defaultDrinkOptions = [
  { id: "ayran", name: "Ayran", priceModifier: 0 },
  { id: "buyuk-ayran", name: "Büyük Ayran", priceModifier: 5 },
  { id: "kola", name: "Kola", priceModifier: 10 },
  { id: "yok", name: "İçecek Yok", priceModifier: -15 },
];

// Varsayılan menü verisi
export const defaultMenu: Menu = {
  defaultDrinks: defaultDrinkOptions,
  restaurants: [
    {
      id: "pilav-istasyonu",
      name: "Pilav İstasyonu",
      products: [
        {
          id: "tavuklu-pilav",
          name: "Tavuklu Pilav",
          portions: [
            { id: "1-porsiyon", name: "1 Porsiyon", price: 120 },
            { id: "1.5-porsiyon", name: "1.5 Porsiyon", price: 170 },
            { id: "2-porsiyon", name: "2 Porsiyon", price: 220 },
          ],
          drinkOptions: defaultDrinkOptions,
          defaultDrinkId: "ayran",
        },
        {
          id: "etli-pilav",
          name: "Etli Pilav",
          portions: [
            { id: "1-porsiyon", name: "1 Porsiyon", price: 140 },
            { id: "1.5-porsiyon", name: "1.5 Porsiyon", price: 190 },
          ],
          drinkOptions: defaultDrinkOptions,
          defaultDrinkId: "ayran",
        },
        {
          id: "kuru-fasulye-pilav",
          name: "Kuru Fasulye + Pilav",
          portions: [
            { id: "1-porsiyon", name: "1 Porsiyon", price: 100 },
            { id: "1.5-porsiyon", name: "1.5 Porsiyon", price: 140 },
          ],
          drinkOptions: defaultDrinkOptions,
          defaultDrinkId: "ayran",
        },
      ],
      iban: "",
      accountHolder: "",
    },
    {
      id: "makarnaci",
      name: "Makarnacı",
      products: [
        {
          id: "kori-soslu",
          name: "Köri Soslu Makarna",
          portions: [
            { id: "normal", name: "Normal Porsiyon", price: 90 },
            { id: "normal-tavuklu", name: "Normal Porsiyon (Tavuklu)", price: 110 },
            { id: "buyuk", name: "Büyük Porsiyon", price: 120 },
            { id: "buyuk-tavuklu", name: "Büyük Porsiyon (Tavuklu)", price: 145 },
          ],
          drinkOptions: defaultDrinkOptions,
          defaultDrinkId: "ayran",
        },
        {
          id: "bolonez",
          name: "Bolonez Makarna",
          portions: [
            { id: "normal", name: "Normal Porsiyon", price: 100 },
            { id: "normal-tavuklu", name: "Normal Porsiyon (Tavuklu)", price: 120 },
            { id: "buyuk", name: "Büyük Porsiyon", price: 130 },
            { id: "buyuk-tavuklu", name: "Büyük Porsiyon (Tavuklu)", price: 155 },
          ],
          drinkOptions: defaultDrinkOptions,
          defaultDrinkId: "ayran",
        },
        {
          id: "alfredo",
          name: "Alfredo Makarna",
          portions: [
            { id: "normal", name: "Normal Porsiyon", price: 95 },
            { id: "normal-tavuklu", name: "Normal Porsiyon (Tavuklu)", price: 115 },
            { id: "buyuk", name: "Büyük Porsiyon", price: 125 },
            { id: "buyuk-tavuklu", name: "Büyük Porsiyon (Tavuklu)", price: 150 },
          ],
          drinkOptions: defaultDrinkOptions,
          defaultDrinkId: "ayran",
        },
        {
          id: "arabiata",
          name: "Arabiata Makarna",
          portions: [
            { id: "normal", name: "Normal Porsiyon", price: 90 },
            { id: "normal-tavuklu", name: "Normal Porsiyon (Tavuklu)", price: 110 },
            { id: "buyuk", name: "Büyük Porsiyon", price: 120 },
            { id: "buyuk-tavuklu", name: "Büyük Porsiyon (Tavuklu)", price: 145 },
          ],
          drinkOptions: defaultDrinkOptions,
          defaultDrinkId: "ayran",
        },
      ],
      iban: "",
      accountHolder: "",
    },
  ],
  updatedAt: Date.now(),
};

// Yardımcı fonksiyonlar
export function getRestaurantById(menu: Menu, id: string): Restaurant | undefined {
  return menu.restaurants.find((r) => r.id === id);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
