const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const authenticate = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const {
  createBooking,
  getBookingById,
  pickupBooking,
  returnBooking,
  cancelBooking,
  getCustomerBookings,
} = require("../controllers/bookingController");

router.post(
  "/",
  authenticate,
  authorize("customer"),
  [
    body("vehicleId").notEmpty().withMessage("Vehicle ID is required"),
    body("startDate").isISO8601().withMessage("Valid start date is required"),
    body("endDate").isISO8601().withMessage("Valid end date is required"),
  ],
  validate,
  createBooking
);

router.get("/:id", authenticate, getBookingById);

router.post(
  "/:id/pickup",
  authenticate,
  authorize("staff", "admin"),
  [
    body("odometer").isNumeric().withMessage("Odometer reading is required"),
    body("fuelLevel")
      .isFloat({ min: 0, max: 100 })
      .withMessage("Fuel level must be between 0 and 100"),
  ],
  validate,
  pickupBooking
);

router.post(
  "/:id/return",
  authenticate,
  authorize("staff", "admin"),
  [
    body("odometer").isNumeric().withMessage("Odometer reading is required"),
    body("fuelLevel")
      .isFloat({ min: 0, max: 100 })
      .withMessage("Fuel level must be between 0 and 100"),
  ],
  validate,
  returnBooking
);

router.post("/:id/cancel", authenticate, cancelBooking);

router.get(
  "/customer/:id",
  authenticate,
  getCustomerBookings
);

module.exports = router;
