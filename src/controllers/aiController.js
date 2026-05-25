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

const getAnswerProfile = (message = "") => {
  const text = normalizeText(message);

  const wantsDetailed =
    text.includes("detayli") ||
    text.includes("kapsamli") ||
    text.includes("uzun") ||
    text.includes("tum detay") ||
    text.includes("tum detaylari") ||
    text.includes("ekspertiz") ||
    text.includes("rapor") ||
    text.includes("analiz") ||
    text.includes("profesyonel");

  const wantsCompare =
    text.includes("karsilastir") ||
    text.includes("kiyasla") ||
    text.includes("hangisi") ||
    text.includes("mi daha iyi") ||
    text.includes("mi mantikli") ||
    text.includes("mi alinır") ||
    text.includes("mi alinir");

  const wantsScore =
    text.includes("skor") ||
    text.includes("puan") ||
    text.includes("alinir mi") ||
    text.includes("alınır mı") ||
    text.includes("mantikli mi") ||
    text.includes("mantıklı mı");

  const wantsRisk =
    text.includes("risk") ||
    text.includes("kronik") ||
    text.includes("sanziman") ||
    text.includes("şanzıman") ||
    text.includes("motor riski") ||
    text.includes("masraf") ||
    text.includes("ariza") ||
    text.includes("arıza");

  if (wantsDetailed || wantsCompare || wantsRisk) {
    return {
      maxTokens: 7000,
      timeout: 120000,
      responseRule:
        "Detaylı ve profesyonel cevap ver.",
    };
  }

  if (wantsScore) {
    return {
      maxTokens: 4000,
      timeout: 90000,
      responseRule:
        "Orta uzunlukta profesyonel cevap ver.",
    };
  }

  return {
    maxTokens: 2500,
    timeout: 60000,
    responseRule:
      "Kısa ama profesyonel cevap ver.",
  };
};

const getCarsFromDatabase = async () => {
  const snapshot = await db.collection("cars").get();

  const cars = [];

  snapshot.forEach((doc) => {
    cars.push({
      id: doc.id,
      ...doc.data(),
    });
  });

  return cars;
};

const createCarDataText = (cars = []) => {
  if (!cars.length) {
    return "Veritabanında araç bulunamadı.";
  }

  return cars
    .map((car, index) => {
      return `
${index + 1}. ${car.brand || ""} ${car.model || ""}
- Yakıt: ${car.fuelType || "Bilinmiyor"}
- Vites: ${car.transmission || "Bilinmiyor"}
- Konfor: ${car.comfortScore || 0}/10
- Performans: ${car.performanceScore || 0}/10
- Güvenlik: ${car.safetyScore || 0}/10
- Uzun yol: ${car.longRoadScore || 0}/10
- İkinci el: ${car.secondHandValue || 0}/10
`;
    })
    .join("\n-------------------\n");
};

const buildSystemPrompt = ({
  message,
  cars,
  answerProfile,
}) => {
  const carDataText =
    createCarDataText(cars);

  return `
Sen AutoCompare uygulamasının profesyonel araç danışmanı yapay zekasısın.

Türkçe cevap ver.
Kısa ve anlaşılır ol.
Bilmediğin konuda kesin konuşma.

${answerProfile.responseRule}

Araç Veritabanı:
${carDataText}
`;
};

const callDeepSeek = async ({
  systemPrompt,
  message,
  answerProfile,
}) => {
  const apiKey =
    process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error(
      "DEEPSEEK_API_KEY bulunamadı"
    );
  }

  const response = await axios.post(
    "https://api.deepseek.com/chat/completions",
    {
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.45,
      max_tokens:
        answerProfile.maxTokens,
      stream: false,
    },
    {
      timeout: answerProfile.timeout,
      headers: {
        "Content-Type":
          "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    }
  );

  const answer =
    response.data?.choices?.[0]
      ?.message?.content || "";

  if (!answer.trim()) {
    throw new Error(
      "AI boş cevap döndürdü"
    );
  }

  return answer.trim();
};

const saveChatHistory = async ({
  userId,
  message,
  answer,
}) => {
  if (!userId) return;

  await db.collection("chatHistory").add({
    userId,
    message,
    answer,
    createdAt: new Date(),
  });
};

const generateAIAnswer = async ({
  req,
  message,
}) => {
  const cars =
    await getCarsFromDatabase();

  const answerProfile =
    getAnswerProfile(message);

  const systemPrompt =
    buildSystemPrompt({
      message,
      cars,
      answerProfile,
    });

  const answer =
    await callDeepSeek({
      systemPrompt,
      message,
      answerProfile,
    });

  const userId =
    req.user && req.user.uid
      ? req.user.uid
      : null;

  await saveChatHistory({
    userId,
    message,
    answer,
  });

  return answer;
};

const validateMessage = (message) => {
  if (
    !message ||
    typeof message !== "string"
  ) {
    return {
      valid: false,
      error:
        "Geçersiz mesaj formatı",
    };
  }

  const cleanMessage =
    message.trim();

  if (!cleanMessage) {
    return {
      valid: false,
      error:
        "Mesaj alanı zorunludur",
    };
  }

  if (cleanMessage.length < 2) {
    return {
      valid: false,
      error: "Mesaj çok kısa",
    };
  }

  if (cleanMessage.length > 2000) {
    return {
      valid: false,
      error: "Mesaj çok uzun",
    };
  }

  return {
    valid: true,
    cleanMessage,
  };
};

const chatWithAI = async (
  req,
  res
) => {
  try {
    const { message } = req.body;

    const validation =
      validateMessage(message);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const answer =
      await generateAIAnswer({
        req,
        message:
          validation.cleanMessage,
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
      error
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
    const { message } = req.body;

    const validation =
      validateMessage(message);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const answer =
      await generateAIAnswer({
        req,
        message:
          validation.cleanMessage,
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
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Yapay zeka önerisi alınamadı",
    });
  }
};

module.exports = {
  chatWithAI,
  recommendCars,
};