const express = require("express");

const {
  getChatHistory
} = require("../controllers/chatController");

const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get(
  "/history",
  authMiddleware,
  getChatHistory
);

module.exports = router;