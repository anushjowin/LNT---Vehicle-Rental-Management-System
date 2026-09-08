const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");

exports.searchAvailableVehicles = async (req, res, next) => {
  try {
    const { branchId, startDate, endDate, type } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate are required",
        errorCode: "VALIDATION_ERROR",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: "startDate must be before endDate",
        errorCode: "VALIDATION_ERROR",
      });
    }

    const vehicleFilter = { status: "available" };
    if (branchId) vehicleFilter.branchId = branchId;
    if (type) vehicleFilter.type = type;

    const allVehicles = await Vehicle.find(vehicleFilter).populate(
      "branchId",
      "name city"
    );

    const bookedVehicleIds = await Booking.distinct("vehicleId", {
      status: { $in: ["reserved", "picked_up"] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } },
      ],
    });

    const availableVehicles = allVehicles.filter(
      (v) => !bookedVehicleIds.some((id) => id.toString() === v._id.toString())
    );

    res.status(200).json({
      success: true,
      data: availableVehicles,
    });
  } catch (err) {
    next(err);
  }
};
