const db = require("../config/firebase");

const compareNumber = (
  car1Value,
  car2Value,
  higherIsBetter = true
) => {
  if (car1Value === undefined || car2Value === undefined) {
    return { car1Point: 0, car2Point: 0 };
  }

  if (car1Value === car2Value) {
    return { car1Point: 5, car2Point: 5 };
  }

  if (higherIsBetter) {
    return car1Value > car2Value
      ? { car1Point: 10, car2Point: 0 }
      : { car1Point: 0, car2Point: 10 };
  }

  return car1Value < car2Value
    ? { car1Point: 10, car2Point: 0 }
    : { car1Point: 0, car2Point: 10 };
};

const carName = (car) => {
  return `${car.brand} ${car.model} ${car.year} ${car.engine} ${car.fuelType} ${car.transmission}`;
};

const listText = (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    return "Bilgi yok";
  }

  return items.join(", ");
};

const createDetailedComment = ({
  car1,
  car2,
  car1Score,
  car2Score,
  winner,
}) => {
  const car1FullName = carName(car1);
  const car2FullName = carName(car2);

  const fuelWinner =
    car1.averageFuel < car2.averageFuel
      ? car1FullName
      : car2.averageFuel < car1.averageFuel
      ? car2FullName
      : "İki araç da benzer";

  const comfortWinner =
    car1.comfortScore > car2.comfortScore
      ? car1FullName
      : car2.comfortScore > car1.comfortScore
      ? car2FullName
      : "İki araç da benzer";

  const safetyWinner =
    car1.safetyScore > car2.safetyScore
      ? car1FullName
      : car2.safetyScore > car1.safetyScore
      ? car2FullName
      : "İki araç da benzer";

  const longRoadWinner =
    car1.longRoadScore > car2.longRoadScore
      ? car1FullName
      : car2.longRoadScore > car1.longRoadScore
      ? car2FullName
      : "İki araç da benzer";

  const maintenanceWinner =
    car1.maintenanceCost < car2.maintenanceCost
      ? car1FullName
      : car2.maintenanceCost < car1.maintenanceCost
      ? car2FullName
      : "İki araç da benzer";

  if (winner === "Berabere") {
    return `
İki araç genel puanlamada birbirine yakın görünüyor.

${car1FullName}, artıları bakımından şu noktalarda öne çıkıyor: ${listText(
      car1.pros
    )}.
Dikkat edilmesi gereken yönleri: ${listText(car1.cons)}.
Yaygın kullanıcı şikayetleri açısından kontrol edilmesi gerekenler: ${listText(
      car1.commonComplaints
    )}.

${car2FullName}, artıları bakımından şu noktalarda öne çıkıyor: ${listText(
      car2.pros
    )}.
Dikkat edilmesi gereken yönleri: ${listText(car2.cons)}.
Yaygın kullanıcı şikayetleri açısından kontrol edilmesi gerekenler: ${listText(
      car2.commonComplaints
    )}.

Yakıt ekonomisinde: ${fuelWinner}.
Konforda: ${comfortWinner}.
Güvenlikte: ${safetyWinner}.
Uzun yolda: ${longRoadWinner}.
Bakım maliyeti tarafında: ${maintenanceWinner}.

Sonuç olarak karar, kullanım amacına göre verilmelidir.
`.trim();
  }

  return `
Genel puanlamaya göre ${winner} daha avantajlı görünüyor.

${car1FullName} toplam ${car1Score} puan aldı.
${car2FullName} toplam ${car2Score} puan aldı.

Yakıt ekonomisinde: ${fuelWinner}.
Konforda: ${comfortWinner}.
Güvenlikte: ${safetyWinner}.
Uzun yol kullanımında: ${longRoadWinner}.
Bakım maliyeti açısından: ${maintenanceWinner}.

${car1FullName} için güçlü yönler: ${listText(car1.pros)}.
${car1FullName} için dikkat edilmesi gerekenler: ${listText(
    car1.cons
  )}.
${car1FullName} yaygın kullanıcı şikayetleri: ${listText(
    car1.commonComplaints
  )}.

${car2FullName} için güçlü yönler: ${listText(car2.pros)}.
${car2FullName} için dikkat edilmesi gerekenler: ${listText(
    car2.cons
  )}.
${car2FullName} yaygın kullanıcı şikayetleri: ${listText(
    car2.commonComplaints
  )}.

Kısa sonuç: ${winner}, genel skor ve kullanım avantajlarıyla daha mantıklı seçenek gibi duruyor.
`.trim();
};

const compareCars = async (req, res) => {
  try {
    const { car1Id, car2Id } = req.body;

    if (!car1Id || !car2Id) {
      return res.status(400).json({
        success: false,
        message: "car1Id ve car2Id zorunludur",
      });
    }

    const car1Doc = await db
      .collection("cars")
      .doc(car1Id)
      .get();

    const car2Doc = await db
      .collection("cars")
      .doc(car2Id)
      .get();

    if (!car1Doc.exists || !car2Doc.exists) {
      return res.status(404).json({
        success: false,
        message: "Araçlardan biri bulunamadı",
      });
    }

    const car1 = {
      id: car1Doc.id,
      ...car1Doc.data(),
    };

    const car2 = {
      id: car2Doc.id,
      ...car2Doc.data(),
    };

    let car1Score = 0;
    let car2Score = 0;

    const details = [];

    const rules = [
      {
        label: "Yakıt tüketimi",
        field: "averageFuel",
        higherIsBetter: false,
        unit: "L/100 km",
      },
      {
        label: "Türkiye'de tutulma",
        field: "marketPopularity",
        higherIsBetter: true,
        unit: "/10",
      },
      {
        label: "Parça bulunabilirliği",
        field: "sparePartAvailability",
        higherIsBetter: true,
        unit: "/10",
      },
      {
        label: "Bakım maliyeti",
        field: "maintenanceCost",
        higherIsBetter: false,
        unit: "/10",
      },
      {
        label: "İkinci el değeri",
        field: "secondHandValue",
        higherIsBetter: true,
        unit: "/10",
      },
      {
        label: "Konfor",
        field: "comfortScore",
        higherIsBetter: true,
        unit: "/10",
      },
      {
        label: "Performans",
        field: "performanceScore",
        higherIsBetter: true,
        unit: "/10",
      },
      {
        label: "Güvenlik",
        field: "safetyScore",
        higherIsBetter: true,
        unit: "/10",
      },
    ];

    for (const rule of rules) {
      const result = compareNumber(
        car1[rule.field],
        car2[rule.field],
        rule.higherIsBetter
      );

      car1Score += result.car1Point;
      car2Score += result.car2Point;

      details.push({
        label: rule.label,
        car1Value: car1[rule.field],
        car2Value: car2[rule.field],
        car1Point: result.car1Point,
        car2Point: result.car2Point,
        unit: rule.unit,
      });
    }

    let winner = "Berabere";

    if (car1Score > car2Score) {
      winner = `${car1.brand} ${car1.model} ${car1.engine}`;
    } else if (car2Score > car1Score) {
      winner = `${car2.brand} ${car2.model} ${car2.engine}`;
    }

    const comment = createDetailedComment({
      car1,
      car2,
      car1Score,
      car2Score,
      winner,
    });

    res.json({
      success: true,
      data: {
        car1: {
          id: car1.id,
          name: carName(car1),
          score: car1Score,
        },
        car2: {
          id: car2.id,
          name: carName(car2),
          score: car2Score,
        },
        winner,
        comment,
        details,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const saveCompareResult = async (req, res) => {
  try {
    const {
      userId,
      car1Id,
      car2Id,
      car1Name,
      car2Name,
      car1Score,
      car2Score,
      winner,
      comment,
    } = req.body;


    if (!userId || !car1Id || !car2Id) {
      return res.status(400).json({
        success: false,
        message: "userId, car1Id ve car2Id zorunludur",
      });
    }

    const savedCompare = {
      userId,
      car1Id,
      car2Id,
      car1Name,
      car2Name,
      car1Score,
      car2Score,
      winner,
      comment,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db
      .collection("compareResults")
      .add(savedCompare);

    res.json({
      success: true,
      message: "Karşılaştırma sonucu kaydedildi",
      data: {
        id: docRef.id,
        ...savedCompare,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getUserCompareResults = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId zorunludur",
      });
    }

    const snapshot = await db
      .collection("compareResults")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const results = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  compareCars,
  saveCompareResult,
  getUserCompareResults,
};