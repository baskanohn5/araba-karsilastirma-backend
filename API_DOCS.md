# AutoCompare Backend API Dokümantasyonu

Base URL:

http://localhost:5000

---

## 1. Arabaları Listele

GET /api/cars

Açıklama:
Tüm araçları listeler.

Token gerekli mi?
Hayır.

Örnek URL:

http://localhost:5000/api/cars

---

## 2. Tek Araba Detayı

GET /api/cars/:id

Açıklama:
Seçilen arabanın detayını getirir.

Token gerekli mi?
Hayır.

Örnek URL:

http://localhost:5000/api/cars/toyota-corolla-2018-1-6-benzin-otomatik

---

## 3. Araba Arama / Filtreleme

GET /api/cars/search

Açıklama:
Marka, yakıt, vites ve fiyat filtresine göre araç arar.

Token gerekli mi?
Hayır.

Örnekler:

http://localhost:5000/api/cars/search?brand=Toyota

http://localhost:5000/api/cars/search?fuelType=Benzin

http://localhost:5000/api/cars/search?transmission=Otomatik

http://localhost:5000/api/cars/search?maxPrice=900000

Çoklu filtre:

http://localhost:5000/api/cars/search?brand=Toyota&fuelType=Benzin&transmission=Otomatik

---

## 4. Araba Karşılaştırma

POST /api/compare

Açıklama:
İki arabayı karşılaştırır ve puanlama sonucu döner.

Token gerekli mi?
Hayır.

Body:

{
  "car1Id": "toyota-corolla-2018-1-6-benzin-otomatik",
  "car2Id": "renault-megane-2018-1-5-dci-dizel-manuel"
}

---

## 5. Yapay Zeka Sohbet

POST /api/ai/chat

Açıklama:
Kullanıcının araba ile ilgili sorusunu DeepSeek AI’ye gönderir.

Token gerekli mi?
Evet.

Header:

Authorization: Bearer FIREBASE_ID_TOKEN

Body:

{
  "message": "900 bin TL bütçem var. Az yakan otomatik araç önerir misin?"
}

---

## 6. Chat Geçmişi

GET /api/chat-history

Açıklama:
Kullanıcının yapay zeka konuşma geçmişini getirir.

Token gerekli mi?
Evet.

Header:

Authorization: Bearer FIREBASE_ID_TOKEN

---

## 7. Favorilere Ekle

POST /api/favorites

Açıklama:
Kullanıcının seçtiği arabayı favorilere ekler.

Token gerekli mi?
Evet.

Header:

Authorization: Bearer FIREBASE_ID_TOKEN

Body:

{
  "carId": "toyota-corolla-2018-1-6-benzin-otomatik"
}

---

## 8. Favorileri Listele

GET /api/favorites

Açıklama:
Kullanıcının favori araçlarını listeler.

Token gerekli mi?
Evet.

Header:

Authorization: Bearer FIREBASE_ID_TOKEN

---

## 9. Favoriden Çıkar

DELETE /api/favorites/:favoriteId

Açıklama:
Favori aracı siler.

Token gerekli mi?
Evet.

Header:

Authorization: Bearer FIREBASE_ID_TOKEN

Örnek:

http://localhost:5000/api/favorites/FAVORITE_ID

---

## 10. Araba Ekle

POST /api/cars

Açıklama:
Yeni araba ekler.

Token gerekli mi?
Evet.

Admin gerekli mi?
Evet.

Header:

Authorization: Bearer FIREBASE_ID_TOKEN

Body:

{
  "brand": "Toyota",
  "model": "Corolla",
  "year": 2018,
  "engine": "1.6",
  "fuelType": "Benzin",
  "transmission": "Otomatik",
  "bodyType": "Sedan",
  "minPrice": 1000000,
  "maxPrice": 1950000,
  "averageFuel": 6.7,
  "marketPopularity": 9,
  "sparePartAvailability": 9,
  "maintenanceCost": 6,
  "secondHandValue": 9,
  "chronicProblemScore": 8
}

---

## 11. Araba Güncelle

PUT /api/cars/:id

Açıklama:
Mevcut arabayı günceller.

Token gerekli mi?
Evet.

Admin gerekli mi?
Evet.

Header:

Authorization: Bearer FIREBASE_ID_TOKEN

Örnek URL:

http://localhost:5000/api/cars/toyota-corolla-2018-1-6-benzin-otomatik

Body örneği:

{
  "minPrice": 950000,
  "maxPrice": 1800000
}

---

## 12. Araba Sil

DELETE /api/cars/:id

Açıklama:
Arabayı siler.

Token gerekli mi?
Evet.

Admin gerekli mi?
Evet.

Header:

Authorization: Bearer FIREBASE_ID_TOKEN

Örnek URL:

http://localhost:5000/api/cars/toyota-corolla-2018-1-6-benzin-otomatik

---

# Notlar

FIREBASE_ID_TOKEN, Flutter tarafında kullanıcı giriş yaptıktan sonra alınır.

Backend tarafında bu token authMiddleware ile kontrol edilir.

Admin işlemleri için kullanıcının Firebase custom claim içinde admin: true olması gerekir.