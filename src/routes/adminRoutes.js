const express = require("express");

const router = express.Router();

const db = require("../config/firebase");

const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

router.get(
  "/test",
  authMiddleware,
  adminMiddleware,
  (req, res) => {
    return res.json({
      success: true,
      message: "Admin erişimi başarılı",
      user: {
        uid: req.user?.uid,
        email: req.user?.email,
        admin: req.user?.admin === true,
      },
    });
  }
);

router.get(
  "/stats",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const [
        carsSnapshot,
        favoritesSnapshot,
        compareSnapshot,
        aiSnapshot,
      ] = await Promise.all([
        db.collection("cars").get(),
        db.collection("favorites").get(),
        db.collection("compareResults").get(),
        db.collection("chatHistory").get(),
      ]);

      return res.json({
        success: true,
        data: {
          totalCars: carsSnapshot.size,
          totalFavorites: favoritesSnapshot.size,
          totalCompareHistory: compareSnapshot.size,
          totalAiChats: aiSnapshot.size,
        },
      });
    } catch (error) {
      console.error("ADMIN STATS ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Admin istatistikleri alınamadı",
      });
    }
  }
);

module.exports = router;