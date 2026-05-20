const express = require("express");
const router = express.Router();

const {
  compareCars,
  saveCompareResult,
} = require("../controllers/compareController");

router.post("/", compareCars);
router.post("/save", saveCompareResult);

module.exports = router;