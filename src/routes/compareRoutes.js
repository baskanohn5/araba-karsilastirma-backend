const express = require("express");

const router = express.Router();

const {
  compareCars
} = require("../controllers/compareController");

router.post("/", compareCars);

module.exports = router;