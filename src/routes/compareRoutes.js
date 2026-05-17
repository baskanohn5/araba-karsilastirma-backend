const express = require("express");
const router = express.Router();

const { compareCars } = require("../controllers/compareController");

/**
 * @swagger
 * /api/compare:
 *   post:
 *     summary: İki arabayı karşılaştırır
 *     tags:
 *       - Compare
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               car1Id:
 *                 type: string
 *               car2Id:
 *                 type: string
 *             example:
 *               car1Id: toyota-corolla-2018-1-6-benzin-otomatik
 *               car2Id: renault-megane-2018-1-5-dci-dizel-manuel
 *     responses:
 *       200:
 *         description: Karşılaştırma başarılı
 */

router.post("/", compareCars);

module.exports = router;