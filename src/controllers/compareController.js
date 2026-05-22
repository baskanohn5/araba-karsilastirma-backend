const db = require("../config/firebase");

const numberValue = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const fuelScore = (averageFuel) => {
  const fuel = numberValue(averageFuel);

  if (fuel <= 0) return 0;

  const score = 10 - fuel;

  return score < 0 ? 0 : score;
};

const sumScores = (breakdown) => {
  return Object.values(breakdown).reduce((total, value) => {
    return total + numberValue(value);
  }, 0);
};

const carName = (car) => {
  return `${car.brand} ${car.model} ${car.year} ${car.engine} ${car.fuelType} ${car.transmission}`;
};

const createBreakdown = (car) => {
  return {
    comfort: numberValue(car.comfortScore),
    performance: numberValue(car.performanceScore),
    safety: numberValue(car.safetyScore),
    longRoad: numberValue(car.longRoadScore),
    secondHand: numberValue(car.secondHandValue),
    fuel: fuelScore(car.averageFuel),
    maintenance: numberValue(car.maintenanceCost),
    sparePart: numberValue(car.sparePartAvailability),
    popularity: numberValue(car.marketPopularity),
  };
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

    const car1Doc = await db.collection("cars").doc(car1Id).get();
    const car2Doc = await db.collection("cars").doc(car2Id).get();

    if (!car1Doc.exists || !car2Doc.exists) {
      return res.status(404).json({
        success: false,
        message: "Araç bulunamadı",
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

    const car1Breakdown = createBreakdown(car1);
    const car2Breakdown = createBreakdown(car2);

    const car1Score = sumScores(car1Breakdown);
    const car2Score = sumScores(car2Breakdown);

    let winner = "Berabere";

    if (car1Score > car2Score) {
      winner = carName(car1);
    } else if (car2Score > car1Score) {
      winner = carName(car2);
    }

    const comment = `
🏆 Sonuç

${carName(car1)} toplam ${car1Score.toFixed(1)} puan aldı.

- Konfor: ${car1Breakdown.comfort}
- Performans: ${car1Breakdown.performance}
- Güvenlik: ${car1Breakdown.safety}
- Uzun Yol: ${car1Breakdown.longRoad}
- İkinci El: ${car1Breakdown.secondHand}
- Yakıt: ${car1Breakdown.fuel.toFixed(1)}
- Bakım: ${car1Breakdown.maintenance}
- Parça: ${car1Breakdown.sparePart}
- Popülerlik: ${car1Breakdown.popularity}

----------------------------

${carName(car2)} toplam ${car2Score.toFixed(1)} puan aldı.

- Konfor: ${car2Breakdown.comfort}
- Performans: ${car2Breakdown.performance}
- Güvenlik: ${car2Breakdown.safety}
- Uzun Yol: ${car2Breakdown.longRoad}
- İkinci El: ${car2Breakdown.secondHand}
- Yakıt: ${car2Breakdown.fuel.toFixed(1)}
- Bakım: ${car2Breakdown.maintenance}
- Parça: ${car2Breakdown.sparePart}
- Popülerlik: ${car2Breakdown.popularity}

🏁 Kazanan: ${winner}
`.trim();

    return res.json({
      success: true,
      data: {
        car1: {
          id: car1.id,
          name: carName(car1),
          score: car1Score,
          breakdown: car1Breakdown,
        },
        car2: {
          id: car2.id,
          name: carName(car2),
          score: car2Score,
          breakdown: car2Breakdown,
        },
        winner,
        comment,
      },
    });
  } catch (error) {
    console.error("COMPARE CARS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Karşılaştırma işlemi başarısız oldu",
    });
  }
};

const saveCompareResult = async (req, res) => {
  try {
    const userId = req.user.uid;

    const {
      car1Id,
      car2Id,
      car1Name,
      car2Name,
      car1Score,
      car2Score,
      winner,
      comment,
    } = req.body;

    if (!car1Id || !car2Id) {
      return res.status(400).json({
        success: false,
        message: "car1Id ve car2Id zorunludur",
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

    const docRef = await db.collection("compareResults").add(savedCompare);

    return res.json({
      success: true,
      message: "Karşılaştırma sonucu kaydedildi",
      data: {
        id: docRef.id,
        ...savedCompare,
      },
    });
  } catch (error) {
    console.error("SAVE COMPARE RESULT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Karşılaştırma sonucu kaydedilemedi",
    });
  }
};

const getUserCompareResults = async (req, res) => {
  try {
    const userId = req.user.uid;

    const snapshot = await db
      .collection("compareResults")
      .where("userId", "==", userId)
      .get();

    const results = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

        return dateB - dateA;
      });

    return res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("GET USER COMPARES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Karşılaştırmalar alınamadı",
    });
  }
};

const deleteCompareResult = async (req, res) => {
  try {
    const userId = req.user.uid;

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "id zorunludur",
      });
    }

    const compareDoc = await db.collection("compareResults").doc(id).get();

    if (!compareDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Karşılaştırma bulunamadı",
      });
    }

    const compareData = compareDoc.data();

    if (compareData.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Bu işlem için yetkiniz yok",
      });
    }

    await db.collection("compareResults").doc(id).delete();

    return res.json({
      success: true,
      message: "Karşılaştırma kaydı silindi",
    });
  } catch (error) {
    console.error("DELETE COMPARE RESULT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Karşılaştırma silinemedi",
    });
  }
};

module.exports = {
  compareCars,
  saveCompareResult,
  getUserCompareResults,
  deleteCompareResult,
};