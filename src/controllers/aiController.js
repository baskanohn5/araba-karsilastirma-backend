const axios = require("axios");
const db = require("../config/firebase");

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

const getCarsFromDatabase = async () => {
  const snapshot = await db.collection("cars").get();

  const cars = [];

  snapshot.forEach((doc) => {
    cars.push({
      id: doc.id,
      ...doc.data()
    });
  });

  return cars;
};

const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.uid;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Mesaj alanı zorunludur"
      });
    }

    const cars = await getCarsFromDatabase();

    const carDataText = cars
      .map((car) => {
        return `
Araç ID: ${car.id}
Marka: ${car.brand}
Model: ${car.model}
Yıl: ${car.year}
Motor: ${car.engine}
Yakıt: ${car.fuelType}
Vites: ${car.transmission}
Kasa: ${car.bodyType}
Fiyat: ${car.minPrice} - ${car.maxPrice} TL
Yakıt Tüketimi: ${car.averageFuel} L/100 km
Tutulma: ${car.marketPopularity}/10
Parça Bulunabilirliği: ${car.sparePartAvailability}/10
Bakım Maliyeti: ${car.maintenanceCost}/10
İkinci El Değeri: ${car.secondHandValue}/10
Kronik Sorun Puanı: ${car.chronicProblemScore}/10
Segment: ${car.segment || "Bilinmiyor"}
Konfor: ${car.comfortScore || 0}/10
Performans: ${car.performanceScore || 0}/10
Güvenlik: ${car.safetyScore || 0}/10
Aile Kullanımı: ${car.familyFriendly ? "Uygun" : "Uygun değil"}
Şehir İçi: ${car.cityUseScore || 0}/10
Uzun Yol: ${car.longRoadScore || 0}/10
Beygir: ${car.horsePower || 0} HP
Bagaj: ${car.trunkVolume || 0} L
`;
      })
      .join("\n----------------------\n");

    const aiResponse = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `
Sen AutoCompare uygulamasının araç danışmanı yapay zekasısın.

Sadece aşağıdaki araç verilerine göre cevap ver.
Veritabanında olmayan araçları kesin önerme.
Fiyatların güncel olmayabileceğini belirt.
Kullanıcının bütçe, yakıt, konfor, aile kullanımı, şehir içi, uzun yol, bakım maliyeti ve kronik sorun beklentisine göre açıklama yap.

Araç verileri:
${carDataText}
`
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.4
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const answer = aiResponse.data.choices[0].message.content;

    await db.collection("chatHistory").add({
      userId,
      question: message,
      answer,
      createdAt: new Date()
    });

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
      error: error.message
    });
  }
};

const recommendCars = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.uid;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Mesaj alanı zorunludur"
      });
    }

    const cars = await getCarsFromDatabase();

    if (cars.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Veritabanında araç bulunamadı"
      });
    }

    const carDataText = cars
      .map((car) => {
        return `
Araç ID: ${car.id}
Marka: ${car.brand}
Model: ${car.model}
Yıl: ${car.year}
Motor: ${car.engine}
Yakıt: ${car.fuelType}
Vites: ${car.transmission}
Kasa: ${car.bodyType}
Fiyat: ${car.minPrice} - ${car.maxPrice} TL
Yakıt Tüketimi: ${car.averageFuel} L/100 km
Tutulma: ${car.marketPopularity}/10
Parça Bulunabilirliği: ${car.sparePartAvailability}/10
Bakım Maliyeti: ${car.maintenanceCost}/10
İkinci El Değeri: ${car.secondHandValue}/10
Kronik Sorun Puanı: ${car.chronicProblemScore}/10
Segment: ${car.segment || "Bilinmiyor"}
Konfor: ${car.comfortScore || 0}/10
Performans: ${car.performanceScore || 0}/10
Güvenlik: ${car.safetyScore || 0}/10
Aile Kullanımı: ${car.familyFriendly ? "Uygun" : "Uygun değil"}
Şehir İçi: ${car.cityUseScore || 0}/10
Uzun Yol: ${car.longRoadScore || 0}/10
Beygir: ${car.horsePower || 0} HP
Bagaj: ${car.trunkVolume || 0} L
`;
      })
      .join("\n----------------------\n");

    const aiResponse = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `
Sen AutoCompare uygulamasının profesyonel araç öneri motorusun.

Görevin:
Kullanıcının ihtiyacını analiz et.
Sadece veritabanındaki araçlardan öneri yap.
Veritabanında olmayan araçları önerme.
En uygun aracı veya araçları seç.
Neden seçtiğini sade Türkçe ile açıkla.
Fiyatların değişebileceğini mutlaka belirt.

Cevap formatın şu şekilde olsun:

1. En uygun öneri:
- Araç:
- Neden uygun:
- Güçlü yönleri:
- Dikkat edilmesi gerekenler:

2. Alternatif:
- Araç:
- Neden alternatif:

3. Kısa sonuç:
- Kullanıcının ihtiyacına göre net öneri.

Araç verileri:
${carDataText}
`
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.3
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const answer = aiResponse.data.choices[0].message.content;

    await db.collection("chatHistory").add({
      userId,
      question: `[Öneri] ${message}`,
      answer,
      createdAt: new Date()
    });

    res.json({
      success: true,
      data: {
        answer
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Araç önerisi alınamadı",
      error: error.message
    });
  }
};

module.exports = {
  chatWithAI,
  recommendCars
};