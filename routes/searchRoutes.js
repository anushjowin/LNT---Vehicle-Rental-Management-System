const express = require("express");
const router = express.Router();
const { searchAvailableVehicles } = require("../controllers/searchController");

router.get("/", searchAvailableVehicles);

module.exports = router;
