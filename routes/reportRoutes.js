const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const {
  getUtilizationReport,
  getRevenueByDateRange,
} = require("../controllers/reportController");

router.get(
  "/utilization",
  authenticate,
  authorize("admin", "staff"),
  getUtilizationReport
);

router.get(
  "/revenue",
  authenticate,
  authorize("admin", "staff"),
  getRevenueByDateRange
);

module.exports = router;
