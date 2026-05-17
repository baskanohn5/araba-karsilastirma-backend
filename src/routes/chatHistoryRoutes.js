const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

const {
  getChatHistory
} = require("../controllers/chatHistoryController");

/**
 * @swagger
 * /api/chat-history:
 *   get:
 *     summary: Kullanıcının AI sohbet geçmişini getirir
 *     tags:
 *       - Chat History
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chat geçmişi başarıyla getirildi
 *       401:
 *         description: Token bulunamadı veya geçersiz
 */
router.get("/", authMiddleware, getChatHistory);

module.exports = router;