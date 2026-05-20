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

    let car1Score = 0;
    let car2Score = 0;

    const fuelResult = compareNumber(
      car1.averageFuel,
      car2.averageFuel,
      false
    );

    car1Score += fuelResult.car1Point;
    car2Score += fuelResult.car2Point;

    const comfortResult = compareNumber(
      car1.comfortScore,
      car2.comfortScore,
      true
    );

    car1Score += comfortResult.car1Point;
    car2Score += comfortResult.car2Point;

    const performanceResult = compareNumber(
      car1.performanceScore,
      car2.performanceScore,
      true
    );

    car1Score += performanceResult.car1Point;
    car2Score += performanceResult.car2Point;

    const safetyResult = compareNumber(
      car1.safetyScore,
      car2.safetyScore,
      true
    );

    car1Score += safetyResult.car1Point;
    car2Score += safetyResult.car2Point;

    let winner = "Berabere";

    if (car1Score > car2Score) {
      winner = carName(car1);
    } else if (car2Score > car1Score) {
      winner = carName(car2);
    }

    const comment = `
${carName(car1)} toplam ${car1Score} puan aldı.
${carName(car2)} toplam ${car2Score} puan aldı.

Kazanan araç: ${winner}
`.trim();

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
      .get();

    const results = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort((a, b) => {
        const dateA = a.createdAt
          ? new Date(a.createdAt).getTime()
          : 0;

        const dateB = b.createdAt
          ? new Date(b.createdAt).getTime()
          : 0;

        return dateB - dateA;
      });

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("GET USER COMPARE RESULTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const deleteCompareResult = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "id zorunludur",
      });
    }

    await db.collection("compareResults").doc(id).delete();

    res.json({
      success: true,
      message: "Karşılaştırma kaydı silindi",
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
  deleteCompareResult,
};