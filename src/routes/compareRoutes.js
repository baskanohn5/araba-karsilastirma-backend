const express = require("express");
const router = express.Router();

const {
  compareCars,
  saveCompareResult,
  getUserCompareResults,
} = require("../controllers/compareController");

router.post("/", compareCars);

router.post("/save", saveCompareResult);

router.get("/user/:userId", getUserCompareResults);

module.exports = router;