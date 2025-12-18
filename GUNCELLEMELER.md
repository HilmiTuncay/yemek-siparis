# Tamamlanan Güncellemeler

## Son Güncelleme (Bu Oturum)

### 1. hop.jpg Banner Olarak Düzenlendi
- [x] Şifre ekranında banner (geniş) olarak gösteriliyor
- [x] Ana sayfadan kaldırıldı (sadece şifre ekranında)

### 2. İsim Kontrolü Başta Yapılıyor
- [x] Sepete Ekle butonuna basınca isim kontrolü yapılıyor
- [x] İsim boşsa uyarı gösteriliyor ve input'a focus

### 3. Fiyat Input'unda 0 Sorunu Düzeltildi
- [x] Değer 0 iken input boş görünüyor
- [x] placeholder="0" eklendi
- [x] Tüm fiyat input'ları güncellendi (porsiyon, içecek, sos, ekstra, varsayılan içecekler)

## Önceki Güncellemeler

- [x] Şifre koruması menü düzenle sayfasına eklendi
- [x] Global içecek listesi sistemi
- [x] Sos ve ekstra seçenekleri
- [x] YZT Yemek Siparişi isim değişikliği
- [x] Detaylı sipariş özeti (porsiyon, içecek, sos, ekstra bazında)
- [x] Ödeme durumu takibi (kim ödedi, kim ödemedi)
- [x] IBAN ve hesap sahibi ismi kopyalama
- [x] #taloswin gizli yazılar


## Yapılan Değişiklikler:                                                                                                                                                               
                                                                                                                                                                                       
  1. Ana sayfadaki şifre kaldırıldı - Artık siteye girdiğinizde kısa bir loading ekranından sonra direkt ana sayfaya geçiyor. Admin şifresi sadece admin panelinde soruluyor.          
  2. Öneriler artık varsayılan olarak açık - SuggestionBox artık gizli değil, direkt görünür. Herkes önerileri görebilir ve oylayabilir.                                               
  3. Sipariş kapalıyken ürün seçimi engellendi - Genel siparişler kapalıyken veya restoran kapalıyken:                                                                                 
    - Ürün kartlarında porsiyon seçilemez                                                                                                                                              
    - "Sipariş alınamıyor" uyarısı gösterilir                                                                                                                                          
    - API'de de race condition önlemi eklendi                                                                                                                                          
  4. Admin butonu küçültüldü ve sola alındı - Header'da dişli ikonu şeklinde küçük bir buton olarak Siparişlerim'in soluna taşındı.                                                    
  5. Restoran bazında sipariş kapatma - Genel siparişler sayfasında her restoranın başlığında "Kapat/Aç" butonu eklendi. Böylece bir restoranı kapatırken diğerlerinden sipariş almaya 
  devam edebilirsiniz.                                                                                                                                                                 
  6. Menü düzenlede varsayılan değerler - Yeni ürün/porsiyon/içecek/sos/ekstra eklendiğinde isim alanları boş, fiyat alanları 0 olarak geliyor (placeholder ile gösteriliyor).         
  7. Admin sayfalarına sekme navigasyonu -                                                                                                                                             
    - Siparişler sayfasında "Menüyü Düzenle" butonu eklendi                                                                                                                            
    - Menü düzenle sayfasında "Genel Siparişler" butonu eklendi                                                                                                                        
  8. Öneri dashboard ve bildirim simgesi -                                                                                                                                             
    - Menü düzenle sayfasının altında tüm öneriler dashboard olarak görünüyor (silinebilir)                                                                                            
    - Admin panelinde "Menüyü Düzenle" butonunda öneri sayısı gösteriliyor (mor badge ile animasyonlu)                                                                                 
                                                                                                           
