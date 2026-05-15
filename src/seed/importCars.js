const db = require("../config/firebase");
const cars = require("../data/cars.json");

const importCars = async () => {
  try {
    for (const car of cars) {
      if (!car.slug) {
        console.log("Slug eksik:", car.brand, car.model);
        continue;
      }

      await db.collection("cars").doc(car.slug).set(
        {
          ...car,
          updatedAt: new Date()
        },
        { merge: true }
      );

      console.log(`${car.brand} ${car.model} güncellendi/eklendi`);
    }

    console.log("Tüm araçlar başarıyla içe aktarıldı");
    process.exit();
  } catch (error) {
    console.error("Hata:", error.message);
    process.exit(1);
  }
};

importCars();