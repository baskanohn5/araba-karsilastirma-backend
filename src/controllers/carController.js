const db = require("../config/firebase");

const getAllCars = async (req, res) => {
  try {
    const carsSnapshot = await db.collection("cars").get();

    const cars = [];

    carsSnapshot.forEach((doc) => {
      cars.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.json({
      success: true,
      total: cars.length,
      data: cars,
    });
  } catch (error) {
    console.error("GET ALL CARS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Araçlar alınamadı",
    });
  }
};

const getCarById = async (req, res) => {
  try {
    const { id } = req.params;

    const carDoc = await db.collection("cars").doc(id).get();

    if (!carDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Araba bulunamadı",
      });
    }

    res.json({
      success: true,
      data: {
        id: carDoc.id,
        ...carDoc.data(),
      },
    });
  } catch (error) {
    console.error("GET CAR BY ID ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Araç detayı alınamadı",
    });
  }
};

const createCar = async (req, res) => {
  try {
    const carData = req.body;

    const newCarRef = await db.collection("cars").add({
      ...carData,
      createdAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Araba başarıyla eklendi",
      data: {
        id: newCarRef.id,
        ...carData,
      },
    });
  } catch (error) {
    console.error("CREATE CAR ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Araba eklenemedi",
    });
  }
};

const searchCars = async (req, res) => {
  try {
    const {
      brand,
      model,
      fuelType,
      transmission,
      bodyType,
      engine,
      minPrice,
      maxPrice,
      minYear,
      maxYear,
      maxFuel,
    } = req.query;

    let query = db.collection("cars");

    if (brand) {
      query = query.where("brand", "==", brand);
    }

    if (model) {
      query = query.where("model", "==", model);
    }

    if (fuelType) {
      query = query.where("fuelType", "==", fuelType);
    }

    if (transmission) {
      query = query.where("transmission", "==", transmission);
    }

    if (bodyType) {
      query = query.where("bodyType", "==", bodyType);
    }

    if (engine) {
      query = query.where("engine", "==", engine);
    }

    const snapshot = await query.get();

    const cars = [];

    snapshot.forEach((doc) => {
      const car = {
        id: doc.id,
        ...doc.data(),
      };

      let isValid = true;

      if (minPrice && car.maxPrice < Number(minPrice)) {
        isValid = false;
      }

      if (maxPrice && car.minPrice > Number(maxPrice)) {
        isValid = false;
      }

      if (minYear && car.year < Number(minYear)) {
        isValid = false;
      }

      if (maxYear && car.year > Number(maxYear)) {
        isValid = false;
      }

      if (maxFuel && car.averageFuel > Number(maxFuel)) {
        isValid = false;
      }

      if (isValid) {
        cars.push(car);
      }
    });

    res.json({
      success: true,
      total: cars.length,
      data: cars,
    });
  } catch (error) {
    console.error("SEARCH CARS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Araç arama işlemi başarısız",
    });
  }
};

const updateCar = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const carDoc = await db.collection("cars").doc(id).get();

    if (!carDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Araba bulunamadı",
      });
    }

    await db.collection("cars").doc(id).set(
      {
        ...updateData,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    res.json({
      success: true,
      message: "Araba başarıyla güncellendi",
    });
  } catch (error) {
    console.error("UPDATE CAR ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Araba güncellenemedi",
    });
  }
};

const deleteCar = async (req, res) => {
  try {
    const { id } = req.params;

    const carDoc = await db.collection("cars").doc(id).get();

    if (!carDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Araba bulunamadı",
      });
    }

    await db.collection("cars").doc(id).delete();

    res.json({
      success: true,
      message: "Araba başarıyla silindi",
    });
  } catch (error) {
    console.error("DELETE CAR ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Araba silinemedi",
    });
  }
};

module.exports = {
  getAllCars,
  getCarById,
  createCar,
  searchCars,
  updateCar,
  deleteCar,
};