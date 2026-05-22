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
    text.includes("mi alinir") ||
    text.includes("corolla mi") ||
    text.includes("civic mi") ||
    text.includes("passat mi") ||
    text.includes("megane mi") ||
    text.includes("egea mi");

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
        "Detaylı ve profesyonel cevap ver. Cevabı bölümlere ayır. Her bölümü tamamlanmış cümlelerle bitir. Maddeyi veya cümleyi yarım bırakma. Gerekiyorsa uzun cevap ver ama anlaşılır ve düzenli yaz.",
    };
  }

  if (wantsScore) {
    return {
      maxTokens: 4000,
      timeout: 90000,
      responseRule:
        "Orta uzunlukta profesyonel cevap ver. Skor, alınabilirlik, risk ve kısa sonuç ekle. Cümleleri yarım bırakma.",
    };
  }

  return {
    maxTokens: 2500,
    timeout: 60000,
    responseRule:
      "Kısa ama profesyonel cevap ver. Gereksiz uzatma. Cevabı tamamlanmış cümlelerle bitir.",
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
${index + 1}. ${car.brand || ""} ${car.model || ""} ${car.year || ""} ${
        car.engine || ""
      } ${car.fuelType || ""} ${car.transmission || ""}

Temel Bilgiler:
- ID: ${car.id || car.slug || ""}
- Marka: ${car.brand || "Bilinmiyor"}
- Model: ${car.model || "Bilinmiyor"}
- Yıl: ${car.year || "Bilinmiyor"}
- Motor: ${car.engine || "Bilinmiyor"}
- Yakıt: ${car.fuelType || "Bilinmiyor"}
- Vites: ${car.transmission || "Bilinmiyor"}
- Kasa: ${car.bodyType || "Bilinmiyor"}
- Segment: ${car.segment || "Bilinmiyor"}

Fiyat ve Tüketim:
- Minimum fiyat: ${car.minPrice || "Bilinmiyor"}
- Maksimum fiyat: ${car.maxPrice || "Bilinmiyor"}
- Ortalama yakıt: ${car.averageFuel || "Bilinmiyor"}

Puanlar:
- Türkiye'de tutulma: ${car.marketPopularity || "Bilinmiyor"}/10
- Parça bulunabilirliği: ${car.sparePartAvailability || "Bilinmiyor"}/10
- Bakım maliyeti avantajı: ${car.maintenanceCost || "Bilinmiyor"}/10
- İkinci el değeri: ${car.secondHandValue || "Bilinmiyor"}/10
- Kronik sorun güven puanı: ${car.chronicProblemScore || "Bilinmiyor"}/10
- Konfor: ${car.comfortScore || "Bilinmiyor"}/10
- Performans: ${car.performanceScore || "Bilinmiyor"}/10
- Güvenlik: ${car.safetyScore || "Bilinmiyor"}/10
- Şehir içi kullanım: ${car.cityUseScore || "Bilinmiyor"}/10
- Uzun yol: ${car.longRoadScore || "Bilinmiyor"}/10

Teknik:
- Beygir: ${car.horsePower || "Bilinmiyor"}
- Bagaj: ${car.trunkVolume || "Bilinmiyor"}
- Aileye uygun: ${car.familyFriendly === true ? "Evet" : "Hayır/Bilinmiyor"}

Donanım:
${
  Array.isArray(car.equipment)
    ? car.equipment.map((item) => `- ${item}`).join("\n")
    : "Donanım bilgisi bulunmuyor."
}

Güvenlik:
${
  Array.isArray(car.safetyFeatures)
    ? car.safetyFeatures.map((item) => `- ${item}`).join("\n")
    : "Güvenlik bilgisi bulunmuyor."
}

Konfor:
${
  Array.isArray(car.comfortFeatures)
    ? car.comfortFeatures.map((item) => `- ${item}`).join("\n")
    : "Konfor bilgisi bulunmuyor."
}

Yaygın Kullanıcı Şikayetleri:
${
  Array.isArray(car.commonComplaints)
    ? car.commonComplaints.map((item) => `- ${item}`).join("\n")
    : "Kullanıcı şikayeti bilgisi bulunmuyor."
}

Artılar:
${
  Array.isArray(car.pros)
    ? car.pros.map((item) => `- ${item}`).join("\n")
    : "Artı bilgisi bulunmuyor."
}

Eksiler:
${
  Array.isArray(car.cons)
    ? car.cons.map((item) => `- ${item}`).join("\n")
    : "Eksi bilgisi bulunmuyor."
}

Kullanım Tipi:
${
  Array.isArray(car.usageTypes)
    ? car.usageTypes.map((item) => `- ${item}`).join("\n")
    : "Kullanım tipi bilgisi bulunmuyor."
}
`;
    })
    .join("\n-------------------------\n");
};

const getDatabaseMatchInfo = (message = "", cars = []) => {
  const text = normalizeText(message);

  const matchedCars = cars.filter((car) => {
    const brand = normalizeText(car.brand || "");
    const model = normalizeText(car.model || "");
    const engine = normalizeText(car.engine || "");

    return (
      (brand && text.includes(brand)) ||
      (model && text.includes(model)) ||
      (engine && text.includes(engine))
    );
  });

  if (matchedCars.length === 0) {
    return {
      hasMatch: false,
      matchedCars: [],
      matchText:
        "Kullanıcının sorduğu araç veritabanında net olarak eşleşmedi.",
    };
  }

  return {
    hasMatch: true,
    matchedCars,
    matchText: `Kullanıcının sorusunda veritabanındaki şu araçlarla eşleşme bulundu: ${matchedCars
      .map((car) => `${car.brand} ${car.model} ${car.year} ${car.engine}`)
      .join(", ")}`,
  };
};

const buildSystemPrompt = ({ message, cars, answerProfile }) => {
  const carDataText = createCarDataText(cars);
  const matchInfo = getDatabaseMatchInfo(message, cars);

  return `
Sen AutoCompare uygulamasının profesyonel araç danışmanı yapay zekasısın.

Temel çalışma mantığın:
1. Önce veritabanındaki araç bilgilerini kontrol et.
2. Kullanıcının sorduğu araç veritabanında varsa:
   - Veritabanındaki bilgileri öncelikli kullan.
   - Donanım, güvenlik, konfor, kullanıcı şikayetleri, artılar, eksiler, kullanım tipi, yakıt, bakım, ikinci el ve risk bilgilerine göre yorum yap.
3. Kullanıcının sorduğu araç veritabanında yoksa:
   - Cevap vermeyi reddetme.
   - "Bu araç veritabanımda yok, bu yüzden model özelinde kesin konuşamam" diye belirt.
   - Genel ikinci el mantığına göre yorum yap.
   - Kesin fiyat, kesin kronik sorun, kesin donanım veya kesin piyasa bilgisi iddiasında bulunma.
   - Emin olmadığın yerde "öneri olarak", "genel olarak", "kontrol edilmesi gerekir" ifadelerini kullan.

Veritabanı eşleşme durumu:
${matchInfo.matchText}

Cevap uzunluğu ve tarzı:
${answerProfile.responseRule}

Fiyat Kuralları:
- Veritabanında olmayan araçlar için kesin fiyat aralığı verme.
- Veritabanında olan araçlarda bile fiyatların güncel piyasaya göre değişebileceğini belirt.
- Fiyatı kesin hüküm gibi yazma.

İkinci El Değerlendirme Kuralları:
- Düşük kilometre avantajdır ama tek başına yeterli değildir.
- Boyasız araç genelde ikinci elde avantajdır.
- Lokal boya tek başına büyük problem değildir; boyanın yeri ve sebebi önemlidir.
- Değişen parça daha dikkatli incelenmelidir.
- Şase, podye, direk, airbag, tavan veya ağır hasar varsa risk ciddi şekilde artar.
- Hasar kaydı miktarı kadar hasarın nerede olduğu da önemlidir.
- Düzenli bakım geçmişi, ekspertiz raporu ve satıcının şeffaflığı önemlidir.
- Kesin karar için bağımsız ekspertiz öner.

Karşılaştırma Kuralları:
- Kullanıcı iki aracı karşılaştırırsa:
  1. Genel Bakış
  2. Motor / Performans
  3. Yakıt
  4. Bakım ve Parça
  5. İkinci El
  6. Konfor ve Güvenlik
  7. Kronik Sorun / Risk
  8. Kim Hangisini Almalı?
  9. Sonuç
  formatını kullanabilirsin.
- Kazananı tek cümleyle belirt ama kullanım amacına göre değişebileceğini söyle.

Risk Analizi Kuralları:
- Kullanıcı bir araç hakkında risk analizi istiyorsa:
  - Motor dayanıklılığını değerlendir.
  - Şanzıman riskini değerlendir.
  - Kronik arıza ihtimalini değerlendir.
  - Uzun vadeli bakım maliyetini değerlendir.
  - Parça bulunabilirliğini değerlendir.
  - İkinci el piyasasını değerlendir.
  - Kullanıcıya dikkat edilmesi gereken noktaları yaz.
  - Alınabilirlik durumunu belirt.
- Sonunda şu formatta risk puanı ver:
  Risk Seviyesi: X/10
- Risk puanı:
  1-3 düşük risk
  4-6 orta risk
  7-10 yüksek risk
- Eğer araç güvenilir görünüyorsa:
  "Genel olarak güven veren bir araçtır" diyebilirsin.
- Eğer riskli görünüyorsa:
  "Ekspertiz kesinlikle önerilir" ifadesini kullan.
- Kullanıcıyı korkutmadan objektif analiz yap.
- Emin olmadığın kronik arızalarda kesin konuşma.

AI Skor Kuralları:
- Kullanıcı bir araç hakkında genel değerlendirme, alınır mı, mantıklı mı, riskli mi diye sorarsa 100 üzerinden AI skor ver.
- Skoru hesaplarken şu kriterleri dikkate al:
  - İkinci el değeri
  - Bakım maliyeti
  - Kronik sorun riski
  - Yakıt tüketimi
  - Konfor
  - Güvenlik
  - Parça bulunabilirliği
  - Piyasa popülerliği
- Cevap sonunda şu formatı kullan:
  AutoCompare AI Skoru: X/100
  Alınabilirlik: Düşük / Orta / Yüksek
  Kısa Sonuç: ...

Cevap Kalitesi Kuralları:
- Türkçe cevap ver.
- Açık, anlaşılır ve kullanıcı dostu ol.
- Çok teknik konuşma ama profesyonel görün.
- Cümleleri yarım bırakma.
- Liste kullanabilirsin.
- Gereksiz tekrar yapma.
- Bilmediğin konuda kesin konuşma.
- Cevabın sonunda mutlaka kısa bir sonuç yaz.

Araç Veritabanı:
${carDataText}
`;
};

const callDeepSeek = async ({ systemPrompt, message, answerProfile }) => {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY bulunamadı");
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
      max_tokens: answerProfile.maxTokens,
      stream: false,
    },
    {
      timeout: answerProfile.timeout,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    }
  );

  const answer =
    response.data &&
    response.data.choices &&
    response.data.choices[0] &&
    response.data.choices[0].message &&
    response.data.choices[0].message.content
      ? response.data.choices[0].message.content
      : "";

  if (!answer || !answer.trim()) {
    throw new Error("AI boş cevap döndürdü");
  }

  return answer.trim();
};

const saveChatHistory = async ({ userId, message, answer }) => {
  if (!userId) return;

  await db.collection("chatHistory").add({
    userId,
    message,
    answer,
    createdAt: new Date(),
  });
};

const generateAIAnswer = async ({ req, message }) => {
  const cars = await getCarsFromDatabase();

  const answerProfile = getAnswerProfile(message);

  const systemPrompt = buildSystemPrompt({
    message,
    cars,
    answerProfile,
  });

  const answer = await callDeepSeek({
    systemPrompt,
    message,
    answerProfile,
  });

  const userId = req.user && req.user.uid ? req.user.uid : null;

  await saveChatHistory({
    userId,
    message,
    answer,
  });

  return answer;
};

const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Mesaj alanı zorunludur",
      });
    }

    const answer = await generateAIAnswer({
      req,
      message: message.trim(),
    });

    return res.json({
      success: true,
      data: {
        answer,
      },
    });
  } catch (error) {
    console.error("AI CHAT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Yapay zeka cevabı alınamadı",
      error: error.message,
    });
  }
};

const recommendCars = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Mesaj alanı zorunludur",
      });
    }

    const answer = await generateAIAnswer({
      req,
      message: message.trim(),
    });

    return res.json({
      success: true,
      data: {
        answer,
      },
    });
  } catch (error) {
    console.error("AI RECOMMEND ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Yapay zeka önerisi alınamadı",
      error: error.message,
    });
  }
};

module.exports = {
  chatWithAI,
  recommendCars,
};