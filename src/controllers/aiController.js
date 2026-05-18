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

const formatEquipment = (equipment = {}) => {
  const labels = {
    multimedia: "Multimedya",
    appleCarPlay: "Apple CarPlay",
    androidAuto: "Android Auto",
    sunroof: "Sunroof",
    leatherSeat: "Deri Koltuk",
    adaptiveCruiseControl: "Adaptif hız sabitleyici",
    laneAssist: "Şerit takip",
    blindSpotWarning: "Kör nokta uyarı",
    rearCamera: "Geri görüş kamerası",
    parkingSensor: "Park sensörü",
    digitalDisplay: "Dijital gösterge",
    automaticClimate: "Otomatik klima"
  };

  return Object.entries(labels)
    .map(([key, label]) => {
      return `${label}: ${equipment[key] ? "Var" : "Yok"}`;
    })
    .join("\n");
};

const formatList = (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    return "Bilgi yok";
  }

  return items.map((item) => `- ${item}`).join("\n");
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

Donanım:
${formatEquipment(car.equipment)}

Artılar:
${formatList(car.pros)}

Eksiler:
${formatList(car.cons)}

Yaygın Kullanıcı Şikayetleri:
${formatList(car.commonComplaints)}

Önerilen Kullanım Tipi:
${formatList(car.recommendedUsage)}
`;
    })
    .join("\n----------------------\n");
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
    const carDataText = createCarDataText(cars);

    const aiResponse = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `
Sen AutoCompare uygulamasının araç danışmanı yapay zekasısın.

İki farklı cevap modun var:

1. Veritabanında olan araçlar:
- Aşağıdaki araç verilerini kullan.
- Model, donanım, artılar, eksiler, yaygın kullanıcı şikayetleri ve kullanım tipine göre yorum yap.
- Kullanıcı km, boya, değişen, hasar kaydı, tramer veya ekspertiz bilgisi verirse bunları ayrıca ikinci el mantığıyla değerlendir.

2. Veritabanında olmayan araçlar:
- Cevap vermeyi reddetme.
- "Bu araç veritabanımda yok, bu yüzden model özelinde kesin konuşamam" diye belirt.
- Kullanıcının verdiği km, boya, değişen, hasar kaydı, tramer, ekspertiz, ağır hasar, airbag, şase, podye gibi bilgilere göre genel ikinci el değerlendirmesi yap.
- Düşük km, boyasız olması, değişen parça, ağır hasar gibi durumların avantaj/dezavantajlarını açıkla.
- Bu araç hakkında kesin kronik sorun veya kesin donanım iddiasında bulunma.
- Kesin fiyat aralığı verme.
- Genel yorum yapabilirsin.
- Cevabı sade, kısa ve yardımcı olacak şekilde yaz.

Genel ikinci el değerlendirme kuralları:
- Düşük km avantajdır ama tek başına yeterli değildir.
- Boyasız araç genelde ikinci elde avantajdır.
- Lokal boya tek başına büyük problem değildir; boyanın yeri ve sebebi önemlidir.
- Değişen parça daha dikkatli incelenmelidir.
- Şase, podye, direk, airbag, tavan veya ağır hasar varsa risk ciddi şekilde artar.
- Hasar kaydı miktarı kadar hasarın nerede olduğu da önemlidir.
- Düzenli bakım geçmişi, ekspertiz raporu ve satıcının şeffaflığı önemlidir.
- Kesin karar için bağımsız ekspertiz öner.
- Cevabı sade, anlaşılır ve kullanıcıya karar vermesine yardımcı olacak şekilde yaz.

Fiyatların değişebileceğini belirt.

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

    const carDataText = createCarDataText(cars);

    const aiResponse = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `
Sen AutoCompare uygulamasının profesyonel araç öneri ve ikinci el değerlendirme asistanısın.

İki farklı cevap modun var:

1. Veritabanında olan araçlar:
- Aşağıdaki araç verilerini kullan.
- Model, donanım, güvenlik, konfor, artılar, eksiler, yaygın kullanıcı şikayetleri ve kullanım tipine göre yorum yap.
- Kullanıcının bütçe, yakıt, aile kullanımı, şehir içi, uzun yol ve bakım beklentisine göre öneri yap.
- Kullanıcı km, boya, değişen, hasar kaydı, tramer veya ekspertiz bilgisi verirse bunları ayrıca ikinci el mantığıyla değerlendir.

2. Veritabanında olmayan araçlar:
- Cevap vermeyi reddetme.
- "Bu araç veritabanımda yok, bu yüzden model özelinde kesin konuşamam" diye belirt.
- Kullanıcının verdiği km, boya, değişen, hasar kaydı, tramer, ekspertiz, ağır hasar, airbag, şase, podye gibi bilgilere göre genel ikinci el değerlendirmesi yap.
- Düşük km, boyasız olması, değişen parça, ağır hasar gibi durumların avantaj/dezavantajlarını açıkla.
- Bu araç hakkında kesin kronik sorun veya kesin donanım iddiasında bulunma.
- Kesin fiyat aralığı verme.
- Genel yorum yapabilirsin.
- Cevabı sade, kısa ve yardımcı olacak şekilde yaz.

Genel ikinci el değerlendirme kuralları:
- Düşük km avantajdır ama tek başına yeterli değildir.
- Boyasız araç genelde ikinci elde avantajdır.
- Lokal boya tek başına büyük problem değildir; boyanın yeri ve sebebi önemlidir.
- Değişen parça daha dikkatli incelenmelidir.
- Şase, podye, direk, airbag, tavan veya ağır hasar varsa risk ciddi şekilde artar.
- Hasar kaydı miktarı kadar hasarın nerede olduğu da önemlidir.
- Düzenli bakım geçmişi, ekspertiz raporu ve satıcının şeffaflığı önemlidir.
- Kesin karar için bağımsız ekspertiz öner.

Cevap formatı:
1. Kısa değerlendirme
2. Km / boya / hasar yorumu
3. Riskler
4. Sonuç ve ekspertiz önerisi

Eğer veritabanındaki araçlardan biri uygunsa ayrıca onu da alternatif olarak söyle.

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