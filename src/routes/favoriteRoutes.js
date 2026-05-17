const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

const {
  addFavorite,
  getFavorites,
  removeFavorite
} = require("../controllers/favoriteController");

/**
 * @swagger
 * /api/favorites:
 *   post:
 *     summary: Arabayı favorilere ekler
 *     tags:
 *       - Favorites
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               carId:
 *                 type: string
 *             example:
 *               carId: toyota-corolla-2018-1-6-benzin-otomatik
 *     responses:
 *       200:
 *         description: Favorilere eklendi
 *       401:
 *         description: Token bulunamadı veya geçersiz
 */
router.post("/", authMiddleware, addFavorite);

/**
 * @swagger
 * /api/favorites:
 *   get:
 *     summary: Kullanıcının favori arabalarını listeler
 *     tags:
 *       - Favorites
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Favoriler listelendi
 *       401:
 *         description: Token bulunamadı veya geçersiz
 */
router.get("/", authMiddleware, getFavorites);

/**
 * @swagger
 * /api/favorites/{favoriteId}:
 *   delete:
 *     summary: Arabayı favorilerden çıkarır
 *     tags:
 *       - Favorites
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: favoriteId
 *         required: true
 *         schema:
 *           type: string
 *         description: Favori ID değeri
 *     responses:
 *       200:
 *         description: Favorilerden çıkarıldı
 *       404:
 *         description: Favori bulunamadı
 */
router.delete("/:favoriteId", authMiddleware, removeFavorite);

module.exports = router;