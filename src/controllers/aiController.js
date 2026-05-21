const axios = require("axios");
const db = require("../config/firebase");

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

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
    automaticClimate: "Otomatik klima",
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
        message: "Mesaj alanı zorunludur",
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
Sen AutoCompare uygulamasının premium araç uzmanı ve profesyonel ikinci el analiz danışmanısın.

Görevin:
- Kullanıcıya gerçek ekspertiz uzmanı gibi yardımcı olmak
- Araçları teknik, ekonomik ve kullanıcı deneyimi açısından analiz etmek
- Kullanıcının karar vermesini kolaylaştırmak
- Gerektiğinde riskleri açıkça belirtmek

Cevap kuralları:
- Gereksiz uzun cevap verme
- Profesyonel ama anlaşılır konuş
- Maddeli ve düzenli cevap ver
- Gerektiğinde avantaj/dezavantaj yaz
- Araç hakkında emin olmadığın konuda kesin konuşma
- Kullanıcıyı yanıltabilecek iddialardan kaçın
- Gerektiğinde ekspertiz öner
- Fiyatların piyasaya göre değişebileceğini belirt

Eğer araç veritabanında varsa:
- Motor
- Yakıt tüketimi
- Performans
- Kronik sorun
- İkinci el piyasası
- Konfor
- Uzun yol
- Şehir içi kullanım
- Bakım maliyeti
- Donanım
- Güvenlik

konularında yorum yap.

Eğer kullanıcı compare tarzı soru soruyorsa cevabı şu düzende ver:
1. Genel değerlendirme
2. Avantajlar
3. Dezavantajlar
4. Hangi kullanıcı için daha mantıklı
5. Sonuç

Eğer araç veritabanında yoksa:
- "Bu araç veritabanımda bulunmuyor" diye belirt
- Genel ikinci el mantığıyla yorum yap
- Kesin donanım/kronik arıza iddiası verme
- Kesin fiyat aralığı verme

İkinci el değerlendirme kuralları:
- Düşük km avantajdır ama tek başına yeterli değildir
- Boyasız araç genelde avantajlıdır
- Lokal boya tek başına büyük problem değildir
- Değişen parça dikkat gerektirir
- Şase, podye, direk, airbag, tavan veya ağır hasar ciddi risk oluşturur
- Hasar kaydı miktarı kadar hasarın nerede olduğu önemlidir
- Düzenli bakım geçmişi önemlidir
- Bağımsız ekspertiz öner

Cevap tonu:
Premium, profesyonel, güven veren ve uzman seviyesinde olmalı.

Araç verileri:
${carDataText}
`,
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.35,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const answer = aiResponse.data.choices[0].message.content;

    await db.collection("chatHistory").add({
      userId,
      question: message,
      answer,
      createdAt: new Date(),
    });

    res.json({
      success: true,
      data: {
        answer,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Yapay zeka cevabı alınamadı",
      error: error.message,
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
        message: "Mesaj alanı zorunludur",
      });
    }

    const cars = await getCarsFromDatabase();

    if (cars.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Veritabanında araç bulunamadı",
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
Sen AutoCompare uygulamasının premium araç öneri uzmanısın.

Görevin:
- Kullanıcının ihtiyacına en uygun araçları seçmek
- Teknik analiz yapmak
- Uzun vadeli kullanıcı deneyimini değerlendirmek
- Kullanıcıyı yanlış seçimden korumak

Öneri yaparken:
- Bütçe
- Yakıt tipi
- Şehir içi kullanım
- Uzun yol
- Aile kullanımı
- Performans beklentisi
- İkinci el değeri
- Bakım maliyeti
- Yakıt tüketimi
- Kronik sorun riski

gibi kriterleri dikkate al.

Cevap formatı:
1. Genel değerlendirme
2. En mantıklı seçenek
3. Avantajlar
4. Dezavantajlar
5. Uzun vadeli değerlendirme
6. Sonuç

Kurallar:
- Gereksiz uzun yazma
- Profesyonel ve güven veren konuş
- Araçların artı/eksi yönlerini dürüstçe belirt
- Emin olmadığın konuda kesin konuşma
- Kullanıcıya gerçek danışman hissi ver
- Fiyatların değişebileceğini belirt
- Satın alma öncesi ekspertiz öner

İkinci el araç yorumlarında:
- Km
- Boya
- Değişen
- Hasar kaydı
- Şase/podye
- Airbag
- Ekspertiz durumu

gibi bilgileri profesyonel şekilde değerlendir.

Eğer veritabanındaki araçlardan biri uygunsa onu alternatif olarak söyle.
Eğer kullanıcı veritabanında olmayan araç sorarsa genel ikinci el mantığıyla yorum yap ama kesin iddia kurma.

Araç verileri:
${carDataText}
`,
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const answer = aiResponse.data.choices[0].message.content;

    await db.collection("chatHistory").add({
      userId,
      question: `[Öneri] ${message}`,
      answer,
      createdAt: new Date(),
    });

    res.json({
      success: true,
      data: {
        answer,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Araç önerisi alınamadı",
      error: error.message,
    });
  }
};

module.exports = {
  chatWithAI,
  recommendCars,
};