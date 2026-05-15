const db = require("../config/firebase");

const compareNumber = (car1Value, car2Value, higherIsBetter = true) => {
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

const compareCars = async (req, res) => {
  try {
    const { car1Id, car2Id } = req.body;

    if (!car1Id || !car2Id) {
      return res.status(400).json({
        success: false,
        message: "car1Id ve car2Id zorunludur"
      });
    }

    const car1Doc = await db.collection("cars").doc(car1Id).get();
    const car2Doc = await db.collection("cars").doc(car2Id).get();

    if (!car1Doc.exists || !car2Doc.exists) {
      return res.status(404).json({
        success: false,
        message: "Araçlardan biri veya ikisi bulunamadı"
      });
    }

    const car1 = {
      id: car1Doc.id,
      ...car1Doc.data()
    };

    const car2 = {
      id: car2Doc.id,
      ...car2Doc.data()
    };

    let car1Score = 0;
    let car2Score = 0;

    const details = [];

    const rules = [
      {
        label: "Yakıt tüketimi",
        field: "averageFuel",
        higherIsBetter: false,
        unit: "L/100 km"
      },
      {
        label: "Türkiye'de tutulma",
        field: "marketPopularity",
        higherIsBetter: true,
        unit: "/10"
      },
      {
        label: "Parça bulunabilirliği",
        field: "sparePartAvailability",
        higherIsBetter: true,
        unit: "/10"
      },
      {
        label: "Bakım maliyeti",
        field: "maintenanceCost",
        higherIsBetter: false,
        unit: "/10"
      },
      {
        label: "İkinci el değeri",
        field: "secondHandValue",
        higherIsBetter: true,
        unit: "/10"
      },
      {
        label: "Kronik sorun puanı",
        field: "chronicProblemScore",
        higherIsBetter: true,
        unit: "/10"
      },
      {
        label: "Minimum fiyat",
        field: "minPrice",
        higherIsBetter: false,
        unit: "TL"
      }
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
        unit: rule.unit
      });
    }

    let winner = "Berabere";

    if (car1Score > car2Score) {
      winner = `${car1.brand} ${car1.model} ${car1.engine}`;
    } else if (car2Score > car1Score) {
      winner = `${car2.brand} ${car2.model} ${car2.engine}`;
    }

    const comment =
      winner === "Berabere"
        ? "İki araç genel olarak birbirine yakın görünüyor. Kullanım amacı ve bütçeye göre karar verilmelidir."
        : `${winner} genel puanlamaya göre daha avantajlı görünüyor. Yine de fiyatlar ve araç kondisyonu değişebileceği için ekspertiz ve güncel ilan kontrolü önerilir.`;

    res.json({
      success: true,
      data: {
        car1: {
          id: car1.id,
          name: `${car1.brand} ${car1.model} ${car1.year} ${car1.engine} ${car1.fuelType} ${car1.transmission}`,
          score: car1Score
        },
        car2: {
          id: car2.id,
          name: `${car2.brand} ${car2.model} ${car2.year} ${car2.engine} ${car2.fuelType} ${car2.transmission}`,
          score: car2Score
        },
        winner,
        comment,
        details
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  compareCars
};