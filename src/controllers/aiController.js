const axios = require("axios");

const db = require("../config/firebase");

const normalizeText = (text = "") => {
  return text
    .toString()
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .trim();
};

const findRelevantCars = (
  cars = [],
  message = ""
) => {
  const normalizedMessage =
    normalizeText(message);

  const matchedCars = cars.filter(
    (car) => {
      const brand = normalizeText(
        car.brand
      );

      const model = normalizeText(
        car.model
      );

      const engine = normalizeText(
        car.engine
      );

      const fuelType = normalizeText(
        car.fuelType
      );

      const transmission =
        normalizeText(
          car.transmission
        );

      return (
        normalizedMessage.includes(
          brand
        ) ||
        normalizedMessage.includes(
          model
        ) ||
        normalizedMessage.includes(
          `${brand} ${model}`
        ) ||
        normalizedMessage.includes(
          engine
        ) ||
        normalizedMessage.includes(
          fuelType
        ) ||
        normalizedMessage.includes(
          transmission
        )
      );
    }
  );

  return matchedCars.slice(0, 10);
};

const getCarsFromDatabase =
  async () => {
    const snapshot =
      await db.collection("cars").get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  };

const createCarDataText = (
  cars = []
) => {
  return cars
    .map((car) => {
      return `
Marka: ${car.brand || ""}
Model: ${car.model || ""}
Yıl: ${car.year || ""}
Motor: ${car.engine || ""}
Yakıt: ${car.fuelType || ""}
Vites: ${car.transmission || ""}
Kasa: ${car.bodyType || ""}
Minimum Fiyat: ${
        car.minPrice || 0
      }
Maximum Fiyat: ${
        car.maxPrice || 0
      }
Yakıt Tüketimi: ${
        car.averageFuel || 0
      }
Piyasa Popülerliği: ${
        car.marketPopularity || 0
      }
Yedek Parça: ${
        car.sparePartAvailability || 0
      }
Bakım Maliyeti: ${
        car.maintenanceCost || 0
      }
2. El Değeri: ${
        car.secondHandValue || 0
      }
Kronik Problem Skoru: ${
        car.chronicProblemScore || 0
      }
`;
    })
    .join("\n-----------------\n");
};

const getRecentChatHistory =
  async (userId) => {
    if (
      !userId ||
      userId === "anonymous"
    ) {
      return [];
    }

    const snapshot = await db
      .collection("chatHistory")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(5)
      .get();

    const history = [];

    snapshot.docs.reverse().forEach(
      (doc) => {
        const data = doc.data();

        if (
          data.message &&
          data.answer
        ) {
          history.push({
            role: "user",
            content: data.message,
          });

          history.push({
            role: "assistant",
            content: data.answer,
          });
        }
      }
    );

    return history;
  };

const saveChatHistory =
  async ({
    userId,
    message,
    answer,
  }) => {
    await db
      .collection("chatHistory")
      .add({
        userId,
        message,
        question: message,
        answer,
        createdAt:
          new Date().toISOString(),
      });
  };

const generateAIAnswer =
  async ({
    message,
    cars,
    userId,
  }) => {
    const relevantCars =
      findRelevantCars(
        cars,
        message
      );

    const dataSourceMode =
      relevantCars.length > 0
        ? "DATABASE_MATCH"
        : "GENERAL_KNOWLEDGE";

    const carsForAI =
      relevantCars.length > 0
        ? relevantCars
        : cars.slice(0, 10);

    const carDataText =
      createCarDataText(
        carsForAI
      );

    const recentHistory =
      await getRecentChatHistory(
        userId
      );

    const systemPrompt = `
Sen profesyonel bir otomotiv uzmanısın.

Öncelikli çalışma mantığın:
1. Önce veritabanındaki araç bilgilerine bak.
2. Veritabanında ilgili araç/veri varsa buna göre cevap ver.
3. Veritabanında doğrudan bilgi yoksa genel otomotiv bilgisine göre cevap ver.
4. Emin olmadığın konularda kesin konuşma, öneri dili kullan.

Bilgi kaynağı modu:
${dataSourceMode}

Kurallar:

Eğer DATABASE_MATCH ise:
- Öncelikle veritabanındaki araç bilgilerine göre cevap ver.
- "Veritabanındaki bilgiye göre" ifadesini kullan.
- Veritabanındaki verileri öncelikli kabul et.
- Teknik detayları veritabanındaki değerlere göre açıkla.
- Veritabanında olmayan kesin bilgiler uydurma.

Eğer GENERAL_KNOWLEDGE ise:
- "Bu araç/veri veritabanımda doğrudan bulunmuyor" ifadesini kullan.
- Genel otomotiv bilgisine göre yorum yap.
- Emin olmadığın konularda kesin konuşma.
- "Genel olarak", "önerilir", "kontrol edilmelidir", "ekspertiz tavsiye edilir" gibi ifadeler kullan.

Karşılaştırma Kuralları:
- Kullanıcı iki veya daha fazla araç karşılaştırıyorsa:
  - Her araç için ayrı analiz yap.
  - Motor performansı karşılaştır.
  - Yakıt tüketimini karşılaştır.
  - Bakım maliyetini karşılaştır.
  - Kronik sorun risklerini karşılaştır.
  - Şehir içi kullanım uygunluğunu değerlendir.
  - Uzun yol performansını değerlendir.
  - İkinci el değer kaybını değerlendir.
  - Kullanıcı tipine göre hangisinin daha mantıklı olduğunu açıkla.
  - Sonunda mutlaka "Genel Kazanan" bölümü oluştur.

- Karşılaştırma cevaplarını başlıklar halinde düzenle.
- Markdown listeleme kullanabilirsin.
- Cevabı profesyonel ekspertiz raporu gibi hazırla.

Konuşma hafızası:
- Kullanıcı önceki mesajlarda bir araç, marka, model veya karşılaştırma söylediyse bunu bağlam olarak kullan.
- Kullanıcı "peki", "hangisi", "yakıtı nasıl", "o araç" gibi takip soruları sorarsa önceki konuşmayı dikkate al.
- Ama önceki konuşmadan emin değilsen açıkça belirt.

Cevap tarzı:
- Detaylı cevap ver.
- Gerekirse uzun analiz yap.
- Teknik detayları açıklayabilirsin.
- Karşılaştırmaları detaylandır.
- Cevabı yarım bırakma.
- Sonunda mutlaka kısa bir "Sonuç" bölümü yaz.

Araç Verileri:
${carDataText}
`;

    const response =
      await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model:
            "deepseek/deepseek-chat-v3-0324:free",

          messages: [
            {
              role: "system",
              content:
                systemPrompt,
            },

            ...recentHistory,

            {
              role: "user",
              content: message,
            },
          ],

          temperature: 0.35,

          max_tokens: 5000,
        },
        {
          timeout: 90000,

          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type":
              "application/json",
          },
        }
      );

    let finalAnswer =
      response.data.choices[0]
        .message.content || "";

    finalAnswer =
      finalAnswer.trim();

    const endsCorrectly =
      finalAnswer.endsWith(".") ||
      finalAnswer.endsWith("!") ||
      finalAnswer.endsWith("?");

    if (!endsCorrectly) {
      finalAnswer +=
        "\n\nSonuç: Bu değerlendirme genel analiz niteliğindedir. Satın alma öncesi ekspertiz ve test sürüşü önerilir.";
    }

    return {
      answer: finalAnswer,

      mode: dataSourceMode,

      matchedCars:
        relevantCars.length,
    };
  };

const chatWithAI = async (
  req,
  res
) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message:
          "Mesaj alanı zorunludur",
      });
    }

    const userId =
      req.user?.uid ||
      "anonymous";

    const cars =
      await getCarsFromDatabase();

    const aiResult =
      await generateAIAnswer({
        message,
        cars,
        userId,
      });

    await saveChatHistory({
      userId,
      message,
      answer:
        aiResult.answer,
    });

    return res.json({
      success: true,
      data: aiResult,
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
        "AI cevabı alınamadı",
    });
  }
};

const recommendCars =
  async (req, res) => {
    try {
      const { message } =
        req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          message:
            "Mesaj alanı zorunludur",
        });
      }

      const userId =
        req.user?.uid ||
        "anonymous";

      const cars =
        await getCarsFromDatabase();

      const aiResult =
        await generateAIAnswer({
          message,
          cars,
          userId,
        });

      await saveChatHistory({
        userId,
        message,
        answer:
          aiResult.answer,
      });

      return res.json({
        success: true,
        data: aiResult,
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