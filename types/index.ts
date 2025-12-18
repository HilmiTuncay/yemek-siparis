// İçecek seçeneği
export interface DrinkOption {
  id: string;
  name: string; // "Ayran", "Büyük Ayran", "Kola", "Yok"
  priceModifier: number; // Fiyat farkı (+ veya -)
}

// Porsiyon seçeneği
export interface PortionOption {
  id: string;
  name: string; // "1 Porsiyon", "1.5 Porsiyon", "2 Porsiyon"
  price: number;
}

// Sos seçeneği (makarna gibi ürünler için)
export interface SauceOption {
  id: string;
  name: string; // "Bolonez", "Köri Soslu", "Alfredo"
  priceModifier: number;
}

// Boyut seçeneği (makarna gibi ürünler için)
export interface SizeOption {
  id: string;
  name: string; // "Normal", "Büyük"
  priceModifier: number;
}

// Ekstra seçenek (tavuklu gibi ek özellikler)
export interface ExtraOption {
  id: string;
  name: string; // "Tavuklu", "Peynirli"
  priceModifier: number; // Fiyat farkı
}

// Ürün (her üründe porsiyon ve içecek seçenekleri olabilir)
export interface Product {
  id: string;
  name: string; // "Tavuklu Pilav", "Makarna"
  portions: PortionOption[];
  drinkOptions: DrinkOption[];
  defaultDrinkId: string; // Varsayılan içecek id'si
  // Makarna tarzı ürünler için (opsiyonel)
  sauces?: SauceOption[]; // Sos seçenekleri
  sizes?: SizeOption[]; // Boyut seçenekleri
  extras?: ExtraOption[]; // Ekstra seçenekler (tavuklu gibi)
  basePrice?: number; // Eğer sauces/sizes varsa temel fiyat
  // İçecek kaynağı
  useGlobalDrinks?: boolean; // true ise global içecek listesini kullan
  useRestaurantDrinks?: boolean; // true ise restoran içeceklerini kullan
}

// Restoran
export interface Restaurant {
  id: string;
  name: string; // "Pilav İstasyonu", "Makarnacı"
  products: Product[];
  // Ödeme bilgileri
  iban?: string;
  accountHolder?: string; // Hesap sahibi isim soyisim
  // Restoran bazlı içecekler (tüm ürünler için geçerli)
  drinks?: DrinkOption[];
  // Sipariş durumu
  isOpen?: boolean; // true = sipariş alıyor, false = kapalı
}

// Menü (tüm restoranları içerir)
export interface Menu {
  restaurants: Restaurant[];
  updatedAt: number;
  // Global varsayılan içecekler - yeni ürünlere otomatik eklenir
  defaultDrinks?: DrinkOption[];
}

// Siparişteki ürün seçimi
export interface OrderItemSelection {
  restaurantId: string;
  restaurantName: string;
  productId: string;
  productName: string;
  portionId: string;
  portionName: string;
  portionPrice: number;
  drinkId: string;
  drinkName: string;
  drinkPriceModifier: number;
  quantity: number;
  itemTotal: number; // (portionPrice + drinkPriceModifier) * quantity
  // Makarna tarzı ürünler için (opsiyonel)
  sauceId?: string;
  sauceName?: string;
  saucePriceModifier?: number;
  sizeId?: string;
  sizeName?: string;
  sizePriceModifier?: number;
  // Ekstralar
  extraId?: string;
  extraName?: string;
  extraPriceModifier?: number;
}

// Ödeme durumu
export type PaymentStatus = "paid" | "later" | "door";

// Sipariş
export interface Order {
  id: string;
  customerName: string;
  items: OrderItemSelection[];
  totalPrice: number;
  createdAt: number;
  paymentStatus: PaymentStatus;
}

// Kullanıcı firma bilgileri (localStorage'da saklanır)
export interface UserCompanyInfo {
  name: string; // Kullanıcı adı
  companyIban?: string;
  companyAccountHolder?: string;
}
