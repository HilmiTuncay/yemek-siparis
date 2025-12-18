# YZT Yemek Siparişi

YZT ekibi için yemek siparişlerini kolayca yönetmek için geliştirilmiş Next.js uygulaması.

## Kurulum

### Gereksinimler
- Node.js 18 veya üzeri
- npm veya yarn

### 1. Bağımlılıkları Yükleyin
```bash
npm install
```

### 2. Upstash Redis Kurulumu
1. [https://console.upstash.com](https://console.upstash.com) adresine gidin
2. Ücretsiz bir hesap oluşturun
3. Yeni bir Redis veritabanı oluşturun
4. "REST API" bölümünden `UPSTASH_REDIS_REST_URL` ve `UPSTASH_REDIS_REST_TOKEN` değerlerini kopyalayın

### 3. Ortam Değişkenlerini Ayarlayın
```bash
cp .env.local.example .env.local
```

`.env.local` dosyasını açın ve Upstash'ten aldığınız değerleri girin:
```
UPSTASH_REDIS_REST_URL="sizin-url"
UPSTASH_REDIS_REST_TOKEN="sizin-token"
```

### 4. Uygulamayı Çalıştırın
```bash
# Geliştirme modunda
npm run dev

# Production build
npm run build
npm run start
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

## Özellikler

- Restoran bazlı menü sistemi
- Porsiyon ve içecek seçenekleri
- Menüyü düzenleme (herkes düzenleyebilir)
- Firma IBAN ve isim bilgisi kaydetme
- Siparişleri görüntüleme ve yönetme
- 30 dakika sonra siparişler otomatik temizlenir

## Kullanım

1. Ana sayfadan restoran ve ürün seçin
2. Porsiyon ve içecek tercihlerinizi belirtin
3. İsminizi girin ve sipariş verin
4. "Siparişleri Gör" ile tüm siparişleri görüntüleyin
