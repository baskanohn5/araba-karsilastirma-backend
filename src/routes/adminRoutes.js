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
      user: req.user,
    });
  }
);

router.get(
  "/stats",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const carsSnapshot =
        await db.collection("cars").get();

      const favoritesSnapshot =
        await db.collection("favorites").get();

      const compareSnapshot =
        await db
          .collection("compareHistory")
          .get();

      const aiSnapshot =
        await db
          .collection("chatHistory")
          .get();

      return res.json({
        success: true,

        data: {
          totalCars:
            carsSnapshot.size,

          totalFavorites:
            favoritesSnapshot.size,

          totalCompareHistory:
            compareSnapshot.size,

          totalAiChats:
            aiSnapshot.size,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

module.exports = router;