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

const saveChatHistory = async ({
  userId,
  message,
  answer,
}) => {
  await db
    .collection("chatHistory")
    .add({
      userId,
      message,
      answer,
      createdAt:
        new Date().toISOString(),
    });
};

const generateAIAnswer = async ({
  message,
  cars,
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

  const systemPrompt = `
Sen profesyonel bir otomotiv uzmanısın.

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

Kullanıcıya kısa, profesyonel ve anlaşılır cevap ver.

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
          {
            role: "user",
            content: message,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type":
            "application/json",
        },
      }
    );

  return {
    answer:
      response.data.choices[0]
        .message.content,

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

    const cars =
      await getCarsFromDatabase();

    const aiResult =
      await generateAIAnswer({
        message,
        cars,
      });

    await saveChatHistory({
      userId:
        req.user?.uid || "anonymous",
      message,
      answer: aiResult.answer,
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

const recommendCars = async (
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

    const cars =
      await getCarsFromDatabase();

    const aiResult =
      await generateAIAnswer({
        message,
        cars,
      });

    await saveChatHistory({
      userId:
        req.user?.uid || "anonymous",
      message,
      answer: aiResult.answer,
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