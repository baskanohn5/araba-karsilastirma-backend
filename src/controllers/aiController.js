const axios = require("axios");
const db = require("../config/firebase");

const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Mesaj alanı zorunludur"
      });
    }

    const carsSnapshot = await db.collection("cars").get();

    const cars = [];

    carsSnapshot.forEach((doc) => {
      cars.push({
        id: doc.id,
        ...doc.data()
      });
    });

    const carsText = cars
      .map((car) => {
        return `
Araç:
ID: ${car.id}
Marka: ${car.brand}
Model: ${car.model}
Yıl: ${car.year}
Motor: ${car.engine || "Bilinmiyor"}
Yakıt: ${car.fuelType || "Bilinmiyor"}
Vites: ${car.transmission || "Bilinmiyor"}
Kasa Tipi: ${car.bodyType || "Bilinmiyor"}
Minimum Fiyat: ${car.minPrice || "Bilinmiyor"} TL
Maksimum Fiyat: ${car.maxPrice || "Bilinmiyor"} TL
Ortalama Yakıt: ${car.averageFuel || "Bilinmiyor"} L/100 km
Türkiye'de Tutulma: ${car.marketPopularity || "Bilinmiyor"}/10
Parça Bulunabilirliği: ${car.sparePartAvailability || "Bilinmiyor"}/10
Bakım Maliyeti: ${car.maintenanceCost || "Bilinmiyor"}/10
İkinci El Değeri: ${car.secondHandValue || "Bilinmiyor"}/10
Kronik Sorun Puanı: ${car.chronicProblemScore || "Bilinmiyor"}/10
`;
      })
      .join("\n");

    const response = await axios.post(
      "https://api.deepseek.com/chat/completions",
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `Sen Türkiye otomobil piyasasına göre kullanıcıya yardımcı olan bir araba danışmanısın.

ÇOK ÖNEMLİ KURALLAR:
1. Sadece aşağıda verilen veritabanı araçlarına göre öneri yap.
2. Veritabanında olmayan aracı kesin önerme.
3. Kullanıcı bütçe belirtirse fiyat aralığı bütçeyi aşan araçları kesin önerme.
4. Bütçeye uygun araç yoksa açıkça "Bu bütçeye uygun araç listede bulunamadı" de.
5. Fiyatların tahmini olduğunu ve güncel ilanların kontrol edilmesi gerektiğini belirt.
6. Cevabı kısa, sade ve anlaşılır ver.
7. Yakıt, bakım, parça, ikinci el ve kronik sorunları dikkate al.
8. Araç önerirken motor, yıl, yakıt ve vites bilgisini mutlaka belirt.

VERİTABANINDAKİ ARAÇLAR:
${carsText}`
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 700,
        temperature: 0.4
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const answer = response.data.choices[0].message.content;

    if (req.user && req.user.uid) {
      await db.collection("chatHistory").add({
        userId: req.user.uid,
        question: message,
        answer,
        createdAt: new Date()
      });
    }

    res.json({
      success: true,
      data: {
        answer
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Yapay zeka cevabı alınamadı",
      error: error.response?.data || error.message
    });
  }
};

module.exports = {
  chatWithAI
};