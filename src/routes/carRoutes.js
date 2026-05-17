const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const validateCarMiddleware = require("../middlewares/validateCarMiddleware");

const {
  getAllCars,
  getCarById,
  createCar,
  searchCars,
  updateCar,
  deleteCar
} = require("../controllers/carController");

/**
 * @swagger
 * /api/cars/search:
 *   get:
 *     summary: Arabaları filtreler
 *     tags:
 *       - Cars
 *     parameters:
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Marka filtresi
 *       - in: query
 *         name: fuelType
 *         schema:
 *           type: string
 *         description: Yakıt tipi filtresi
 *       - in: query
 *         name: transmission
 *         schema:
 *           type: string
 *         description: Vites filtresi
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maksimum bütçe
 *     responses:
 *       200:
 *         description: Başarılı
 */
router.get("/search", searchCars);

/**
 * @swagger
 * /api/cars:
 *   get:
 *     summary: Tüm arabaları listeler
 *     tags:
 *       - Cars
 *     responses:
 *       200:
 *         description: Başarılı
 */
router.get("/", getAllCars);

/**
 * @swagger
 * /api/cars/{id}:
 *   get:
 *     summary: Tek araba detayını getirir
 *     tags:
 *       - Cars
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Araba ID değeri
 *     responses:
 *       200:
 *         description: Başarılı
 *       404:
 *         description: Araba bulunamadı
 */
router.get("/:id", getCarById);

/**
 * @swagger
 * /api/cars:
 *   post:
 *     summary: Yeni araba ekler
 *     tags:
 *       - Cars
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Araba başarıyla eklendi
 */
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  validateCarMiddleware,
  createCar
);

/**
 * @swagger
 * /api/cars/{id}:
 *   put:
 *     summary: Arabayı günceller
 *     tags:
 *       - Cars
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Güncellenecek araba ID değeri
 *     responses:
 *       200:
 *         description: Araba başarıyla güncellendi
 */
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  updateCar
);

/**
 * @swagger
 * /api/cars/search:
 *   get:
 *     summary: Arabaları gelişmiş filtrelerle arar
 *     tags:
 *       - Cars
 *     parameters:
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Marka filtresi
 *       - in: query
 *         name: model
 *         schema:
 *           type: string
 *         description: Model filtresi
 *       - in: query
 *         name: fuelType
 *         schema:
 *           type: string
 *         description: Yakıt tipi
 *       - in: query
 *         name: transmission
 *         schema:
 *           type: string
 *         description: Vites tipi
 *       - in: query
 *         name: bodyType
 *         schema:
 *           type: string
 *         description: Kasa tipi
 *       - in: query
 *         name: engine
 *         schema:
 *           type: string
 *         description: Motor seçeneği
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum bütçe
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maksimum bütçe
 *       - in: query
 *         name: minYear
 *         schema:
 *           type: number
 *         description: Minimum yıl
 *       - in: query
 *         name: maxYear
 *         schema:
 *           type: number
 *         description: Maksimum yıl
 *       - in: query
 *         name: maxFuel
 *         schema:
 *           type: number
 *         description: Maksimum yakıt tüketimi
 *     responses:
 *       200:
 *         description: Başarılı
 */
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteCar
);

module.exports = router;