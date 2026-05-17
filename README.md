# AutoCompare Backend

AI destekli araba karşılaştırma uygulaması için geliştirilmiş Node.js + Express backend API.

## Kullanılan Teknolojiler

- Node.js
- Express.js
- Firebase Firestore
- Firebase Authentication
- DeepSeek AI API
- Swagger API Docs
- Render Deploy
- Joi Validation
- Rate Limit

## Canlı API

https://autocompare-backend.onrender.com

## API Dokümantasyonu

https://autocompare-backend.onrender.com/api-docs

## Ana Özellikler

- Araç listeleme
- Araç detay görüntüleme
- Gelişmiş araç filtreleme
- Araç karşılaştırma
- DeepSeek AI destekli araç önerisi
- Kullanıcı favorileri
- AI sohbet geçmişi
- Admin araç ekleme/güncelleme/silme
- Swagger API dokümantasyonu
- Rate limit koruması
- Joi validation sistemi

## Kurulum

```bash
npm install
PORT=5000
DEEPSEEK_API_KEY=your_deepseek_api_key
FIREBASE_SERVICE_ACCOUNT=your_firebase_service_account_json
NODE_ENV=production

GET /api/cars
GET /api/cars/:id
GET /api/cars/search
POST /api/cars
PUT /api/cars/:id
DELETE /api/cars/:id

POST /api/compare

POST /api/ai/chat

POST /api/favorites
GET /api/favorites
DELETE /api/favorites/:favoriteId

GET /api/chat-history

