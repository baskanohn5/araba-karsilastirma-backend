const axios = require("axios");
const db = require("../config/firebase");

const DEEPSEEK_API_URL =
  "https://api.deepseek.com/chat/completions";

const MAX_CARS_FOR_AI = 25;

const sanitizeUserMessage = (message = "") => {
  return message
    .replace(/ignore previous instructions/gi, "")
    .replace(/system prompt/gi, "")
    .replace(/developer message/gi, "")
    .trim()
    .slice(0, 1500);
};

const getCarsFromDatabase = async () => {
  const snapshot = await db
    .collection("cars")
    .limit(MAX_CARS_FOR_AI)
    .get();

  const cars = [];

  snapshot.forEach((doc) => {
    cars.push({
      id: doc.id,
      ...doc.data(),
    });
  });

  return cars;
};

const formatEquipment = (equipment = {}) => {
  const labels = {
    multimedia: "Multimedya",
    appleCarPlay: "Apple CarPlay",
    androidAuto: "Android Auto",
    sunroof: "Sunroof",
    leatherSeat: "Deri Koltuk",
    adaptiveCruiseControl:
      "Adaptif hız sabitleyici",
    laneAssist: "Şerit takip",
    blindSpotWarning:
      "Kör nokta uyarı",
    rearCamera: "Geri görüş kamerası",
    parkingSensor: "Park sensörü",
    digitalDisplay:
      "Dijital gösterge",
    automaticClimate:
      "Otomatik klima",
  };

  return Object.entries(labels)
    .map(([key, label]) => {
      return `${label}: ${
        equipment[key] ? "Var" : "Yok"
      }`;
    })
    .join("\n");
};

const formatList = (items = []) => {
  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return "Bilgi yok";
  }

  return items
    .slice(0, 5)
    .map((item) => `- ${item}`)
    .join("\n");
};

const createCarDataText = (cars) => {
  return cars
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
Parça: ${car.sparePartAvailability}/10
Bakım: ${car.maintenanceCost}/10
2. El: ${car.secondHandValue}/10
Kronik Sorun: ${car.chronicProblemScore}/10
Konfor: ${car.comfortScore || 0}/10
Performans: ${car.performanceScore || 0}/10
Güvenlik: ${car.safetyScore || 0}/10
HP: ${car.horsePower || 0}
Bagaj: ${car.trunkVolume || 0}L

Donanım:
${formatEquipment(car.equipment)}

Artılar:
${formatList(car.pros)}

Eksiler:
${formatList(car.cons)}
`;
    })
    .join("\n------------------\n");
};

const askDeepSeek = async (
  systemPrompt,
  userMessage
) => {
  const response = await axios.post(
    DEEPSEEK_API_URL,
    {
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: 0.35,
      max_tokens: 1200,
    },
    {
      timeout: 25000,
      headers: {
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        "Content-Type":
          "application/json",
      },
    }
  );

  return response.data.choices[0].message.content;
};

const chatWithAI = async (req, res) => {
  try {
    const userId = req.user.uid;

    const rawMessage = req.body.message;

    if (!rawMessage) {
      return res.status(400).json({
        success: false,
        message:
          "Mesaj alanı zorunludur",
      });
    }

    const message =
      sanitizeUserMessage(rawMessage);

    const cars =
      await getCarsFromDatabase();

    const carDataText =
      createCarDataText(cars);

    const systemPrompt = `
Sen AutoCompare uygulamasının premium araç uzmanı, ikinci el danışmanı ve profesyonel ekspertiz yorumcususun.

Görevlerin:
- Kullanıcıya araç seçimi konusunda yardımcı olmak
- Teknik analiz yapmak
- Avantaj/dezavantaj belirtmek
- Kullanıcıyı riskli araçlardan korumak
- Premium danışman hissi vermek

Kurallar:
- Gereksiz uzun cevap verme
- Maddeli yaz
- Profesyonel konuş
- Teknik ama anlaşılır ol
- Emin olmadığın konuda kesin konuşma
- Gerektiğinde ekspertiz öner
- Kullanıcıyı yanıltma
- Fiyatların değişebileceğini belirt

Araç varsa:
- Motor
- Yakıt
- Performans
- Konfor
- Güvenlik
- Kronik sorun
- İkinci el piyasası
- Donanım
- Uzun yol
- Şehir içi kullanım

konularında yorum yap.

Araç yoksa:
- Genel ikinci el mantığıyla yorum yap
- Kesin donanım veya arıza iddiası verme

Cevap tonu:
Premium, güven veren, uzman seviyesi.

Araç verileri:
${carDataText}
`;

    const answer =
      await askDeepSeek(
        systemPrompt,
        message
      );

    await db.collection("chatHistory").add({
      userId,
      question: message,
      answer,
      createdAt: new Date(),
    });

    return res.json({
      success: true,
      data: {
        answer,
      },
    });
  } catch (error) {
    console.error(
      "AI CHAT ERROR:",
      error.response?.data ||
        error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Yapay zeka cevabı alınamadı",
    });
  }
};

const recommendCars = async (
  req,
  res
) => {
  try {
    const userId = req.user.uid;

    const rawMessage = req.body.message;

    if (!rawMessage) {
      return res.status(400).json({
        success: false,
        message:
          "Mesaj alanı zorunludur",
      });
    }

    const message =
      sanitizeUserMessage(rawMessage);

    const cars =
      await getCarsFromDatabase();

    if (cars.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Veritabanında araç bulunamadı",
      });
    }

    const carDataText =
      createCarDataText(cars);

    const systemPrompt = `
Sen AutoCompare uygulamasının premium araç öneri uzmanısın.

Görev:
- Kullanıcıya en uygun araçları seçmek
- Uzun vadeli mantıklı seçim önermek
- Teknik analiz yapmak
- Kullanıcıyı yanlış tercihten korumak

Dikkate alınacaklar:
- Yakıt tüketimi
- Bakım maliyeti
- Performans
- Aile kullanımı
- Şehir içi kullanım
- Uzun yol
- İkinci el değeri
- Kronik sorun riski
- Güvenlik
- Donanım

Cevap formatı:
1. Genel değerlendirme
2. En mantıklı araç
3. Avantajlar
4. Dezavantajlar
5. Uzun vadeli yorum
6. Sonuç

Cevap tonu:
Premium, profesyonel, güven veren.

Araç verileri:
${carDataText}
`;

    const answer =
      await askDeepSeek(
        systemPrompt,
        message
      );

    await db.collection("chatHistory").add({
      userId,
      question: `[ÖNERİ] ${message}`,
      answer,
      createdAt: new Date(),
    });

    return res.json({
      success: true,
      data: {
        answer,
      },
    });
  } catch (error) {
    console.error(
      "AI RECOMMEND ERROR:",
      error.response?.data ||
        error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Araç önerisi alınamadı",
    });
  }
};

module.exports = {
  chatWithAI,
  recommendCars,
};