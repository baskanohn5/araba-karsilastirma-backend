const db = require("../config/firebase");

const getAllCars = async (req, res) => {
  try {
    const carsSnapshot = await db.collection("cars").get();

    const cars = [];

    carsSnapshot.forEach((doc) => {
      cars.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      total: cars.length,
      data: cars
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
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
        message: "Araba bulunamadı"
      });
    }

    res.json({
      success: true,
      data: {
        id: carDoc.id,
        ...carDoc.data()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const createCar = async (req, res) => {
  try {
    const carData = req.body;

    const newCarRef = await db.collection("cars").add(carData);

    res.status(201).json({
      success: true,
      message: "Araba başarıyla eklendi",
      data: {
        id: newCarRef.id,
        ...carData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const searchCars = async (req, res) => {
  try {
    const { brand, fuelType, transmission, maxPrice } = req.query;

    let query = db.collection("cars");

    if (brand) {
      query = query.where("brand", "==", brand);
    }

    if (fuelType) {
      query = query.where("fuelType", "==", fuelType);
    }

    if (transmission) {
      query = query.where("transmission", "==", transmission);
    }

    const snapshot = await query.get();

    const cars = [];

    snapshot.forEach((doc) => {
      const data = {
        id: doc.id,
        ...doc.data()
      };

      if (maxPrice) {
        if (data.minPrice <= Number(maxPrice)) {
          cars.push(data);
        }
      } else {
        cars.push(data);
      }
    });

    res.json({
      success: true,
      total: cars.length,
      data: cars
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
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
        message: "Araba bulunamadı"
      });
    }

    await db.collection("cars").doc(id).set(
      {
        ...updateData,
        updatedAt: new Date()
      },
      { merge: true }
    );

    res.json({
      success: true,
      message: "Araba başarıyla güncellendi"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
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
        message: "Araba bulunamadı"
      });
    }

    await db.collection("cars").doc(id).delete();

    res.json({
      success: true,
      message: "Araba başarıyla silindi"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
module.exports = {
  getAllCars,
  getCarById,
  createCar,
  searchCars,
  updateCar,
  deleteCar
};