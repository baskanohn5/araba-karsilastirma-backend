const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

const {
  getChatHistory
} = require("../controllers/chatHistoryController");

router.get("/", authMiddleware, getChatHistory);

module.exports = router;