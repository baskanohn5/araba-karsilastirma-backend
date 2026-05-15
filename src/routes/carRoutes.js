const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const validateCarMiddleware = require("../middlewares/validateCarMiddleware");

const {
  getAllCars,
  getCarById,
  createCar,
  searchCars,
  updateCar,
  deleteCar
} = require("../controllers/carController");

router.get("/search", searchCars);

router.get("/", getAllCars);

router.get("/:id", getCarById);

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  validateCarMiddleware,
  createCar
);

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  updateCar
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteCar
);

module.exports = router;