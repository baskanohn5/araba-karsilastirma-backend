const db = require("../config/firebase");

const addFavorite = async (req, res) => {
  try {
    const { carId } = req.body;
    const userId = req.user.uid;

    if (!carId) {
      return res.status(400).json({
        success: false,
        message: "carId alanı zorunludur",
      });
    }

    const existingFavorite = await db
      .collection("favorites")
      .where("userId", "==", userId)
      .where("carId", "==", carId)
      .get();

    if (!existingFavorite.empty) {
      return res.status(400).json({
        success: false,
        message: "Araç zaten favorilerde",
      });
    }

    await db.collection("favorites").add({
      userId,
      carId,
      createdAt: new Date(),
    });

    res.json({
      success: true,
      message: "Favorilere eklendi",
    });
  } catch (error) {
    console.error("ADD FAVORITE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Favori ekleme işlemi başarısız oldu",
    });
  }
};

const getFavorites = async (req, res) => {
  try {
    const userId = req.user.uid;

    const snapshot = await db
      .collection("favorites")
      .where("userId", "==", userId)
      .get();

    const favorites = [];

    for (const doc of snapshot.docs) {
      const favorite = doc.data();

      const carDoc = await db
        .collection("cars")
        .doc(favorite.carId)
        .get();

      if (carDoc.exists) {
        favorites.push({
          favoriteId: doc.id,
          car: {
            id: carDoc.id,
            ...carDoc.data(),
          },
        });
      }
    }

    res.json({
      success: true,
      total: favorites.length,
      data: favorites,
    });
  } catch (error) {
    console.error("GET FAVORITES ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Favoriler alınamadı",
    });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const { favoriteId } = req.params;
    const userId = req.user.uid;

    if (!favoriteId) {
      return res.status(400).json({
        success: false,
        message: "favoriteId zorunludur",
      });
    }

    const favoriteDoc = await db
      .collection("favorites")
      .doc(favoriteId)
      .get();

    if (!favoriteDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Favori bulunamadı",
      });
    }

    const favoriteData = favoriteDoc.data();

    if (favoriteData.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Bu favoriyi silme yetkin yok",
      });
    }

    await db.collection("favorites").doc(favoriteId).delete();

    res.json({
      success: true,
      message: "Favorilerden çıkarıldı",
    });
  } catch (error) {
    console.error("REMOVE FAVORITE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Favori silme işlemi başarısız oldu",
    });
  }
};

module.exports = {
  addFavorite,
  getFavorites,
  removeFavorite,
};