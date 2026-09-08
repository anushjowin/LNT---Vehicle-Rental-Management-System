const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const authenticate = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} = require("../controllers/vehicleController");

router.get("/", getAllVehicles);
router.get("/:id", getVehicleById);

router.post(
  "/",
  authenticate,
  authorize("admin", "staff"),
  [
    body("type").isIn(["car", "bike"]).withMessage("Type must be car or bike"),
    body("model").trim().notEmpty().withMessage("Model is required"),
    body("brand").trim().notEmpty().withMessage("Brand is required"),
    body("year").isNumeric().withMessage("Year is required"),
    body("licensePlate").trim().notEmpty().withMessage("License plate is required"),
    body("perDayRate").isFloat({ min: 0 }).withMessage("Per-day rate must be a positive number"),
  ],
  validate,
  createVehicle
);

router.put(
  "/:id",
  authenticate,
  authorize("admin", "staff"),
  updateVehicle
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  deleteVehicle
);

module.exports = router;
