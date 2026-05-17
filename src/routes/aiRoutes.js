const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const { aiLimiter } = require("../middlewares/rateLimitMiddleware");

const { chatWithAI } = require("../controllers/aiController");

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: Yapay zeka ile araç danışmanlığı sohbeti yapar
 *     tags:
 *       - AI
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *             example:
 *               message: "900 bin TL bütçem var, az yakan otomatik araba önerir misin?"
 *     responses:
 *       200:
 *         description: AI cevabı başarıyla döndü
 *       401:
 *         description: Token bulunamadı veya geçersiz
 */
router.post("/chat", aiLimiter, authMiddleware, chatWithAI);

module.exports = router;