const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

const {
  addFavorite,
  getFavorites,
  removeFavorite
} = require("../controllers/favoriteController");

router.post("/", authMiddleware, addFavorite);

router.get("/", authMiddleware, getFavorites);

router.delete("/:favoriteId", authMiddleware, removeFavorite);

module.exports = router;