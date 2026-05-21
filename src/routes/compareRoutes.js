const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

const {
  compareCars,
  saveCompareResult,
  getUserCompareResults,
  deleteCompareResult,
} = require("../controllers/compareController");

router.post("/", compareCars);

router.post("/save", authMiddleware, saveCompareResult);

router.get("/user", authMiddleware, getUserCompareResults);

router.delete("/saved/:id", authMiddleware, deleteCompareResult);

module.exports = router;