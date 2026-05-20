const express = require("express");
const router = express.Router();

const {
  compareCars,
  saveCompareResult,
  getUserCompareResults,
  deleteCompareResult,
} = require("../controllers/compareController");

router.post("/", compareCars);

router.post("/save", saveCompareResult);

router.get("/user/:userId", getUserCompareResults);

router.delete("/saved/:id", deleteCompareResult);

module.exports = router;