const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");
const Inspection = require("../models/Inspection");

exports.createBooking = async (req, res, next) => {
  try {
    const { vehicleId, branchId, startDate, endDate, addOns } = req.body;
    const customerId = req.user._id;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
        errorCode: "NOT_FOUND",
      });
    }

    if (vehicle.status !== "available") {
      return res.status(409).json({
        success: false,
        message: "Vehicle is not available for booking",
        errorCode: "VEHICLE_UNAVAILABLE",
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

    const conflict = await Booking.findOne({
      vehicleId,
      status: { $in: ["reserved", "picked_up"] },
      $or: [{ startDate: { $lte: end }, endDate: { $gte: start } }],
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: "Vehicle is already booked for the selected dates",
        errorCode: "DOUBLE_BOOKING",
      });
    }

    const diffTime = Math.abs(end - start);
    const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const processedAddOns = (addOns || []).map((a) => ({
      name: a.name,
      price: a.price || getAddOnPrice(a.name),
    }));

    const addOnsTotal = processedAddOns.reduce((sum, a) => sum + a.price, 0);
    const totalAmount = vehicle.perDayRate * totalDays + addOnsTotal;

    const booking = await Booking.create({
      customerId,
      vehicleId,
      branchId: branchId || vehicle.branchId,
      startDate: start,
      endDate: end,
      baseRate: vehicle.perDayRate,
      totalDays,
      addOns: processedAddOns,
      addOnsTotal,
      totalAmount,
    });

    await Vehicle.findByIdAndUpdate(vehicleId, { status: "booked" });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("customerId", "name email")
      .populate("vehicleId", "model brand type licensePlate")
      .populate("branchId", "name city");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
        errorCode: "NOT_FOUND",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

exports.pickupBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
        errorCode: "NOT_FOUND",
      });
    }

    if (booking.status !== "reserved") {
      return res.status(409).json({
        success: false,
        message: `Cannot pickup. Booking status is ${booking.status}`,
        errorCode: "INVALID_STATUS",
      });
    }

    const { odometer, fuelLevel, damageNotes } = req.body;

    await Inspection.create({
      bookingId: booking._id,
      stage: "pickup",
      odometer,
      fuelLevel,
      damageNotes: damageNotes || "",
      inspectedBy: req.user._id,
    });

    booking.status = "picked_up";
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Pickup inspection recorded. Booking status: picked_up",
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

exports.returnBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
        errorCode: "NOT_FOUND",
      });
    }

    if (booking.status !== "picked_up") {
      return res.status(409).json({
        success: false,
        message: `Cannot return. Booking status is ${booking.status}`,
        errorCode: "INVALID_STATUS",
      });
    }

    const { odometer, fuelLevel, damageNotes } = req.body;

    await Inspection.create({
      bookingId: booking._id,
      stage: "return",
      odometer,
      fuelLevel,
      damageNotes: damageNotes || "",
      inspectedBy: req.user._id,
    });

    const pickupInspection = await Inspection.findOne({
      bookingId: booking._id,
      stage: "pickup",
    });

    let damageCharge = 0;
    if (damageNotes && damageNotes.trim().length > 0) {
      damageCharge = 500;
    }

    if (pickupInspection && fuelLevel < pickupInspection.fuelLevel) {
      const fuelDiff = pickupInspection.fuelLevel - fuelLevel;
      damageCharge += Math.round(fuelDiff * 10);
    }

    booking.damageCharge = damageCharge;
    booking.totalAmount += damageCharge;
    booking.status = "returned";
    await booking.save();

    await Vehicle.findByIdAndUpdate(booking.vehicleId, { status: "available" });

    res.status(200).json({
      success: true,
      message: "Return inspection recorded. Booking status: returned",
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
        errorCode: "NOT_FOUND",
      });
    }

    if (!["reserved", "picked_up"].includes(booking.status)) {
      return res.status(409).json({
        success: false,
        message: `Cannot cancel. Booking status is ${booking.status}`,
        errorCode: "INVALID_STATUS",
      });
    }

    const now = new Date();
    const pickupDate = new Date(booking.startDate);
    const hoursUntilPickup = (pickupDate - now) / (1000 * 60 * 60);

    let cancellationCharge = 0;
    if (booking.status === "reserved") {
      if (hoursUntilPickup < 24) {
        cancellationCharge = Math.round(booking.totalAmount * 0.5);
      } else if (hoursUntilPickup < 48) {
        cancellationCharge = Math.round(booking.totalAmount * 0.25);
      }
    } else {
      cancellationCharge = Math.round(booking.totalAmount * 0.5);
    }

    booking.cancellationCharge = cancellationCharge;
    booking.totalAmount = cancellationCharge;
    booking.status = "cancelled";
    await booking.save();

    await Vehicle.findByIdAndUpdate(booking.vehicleId, { status: "available" });

    res.status(200).json({
      success: true,
      message: "Booking cancelled",
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

exports.getCustomerBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ customerId: req.params.id })
      .populate("vehicleId", "model brand type licensePlate")
      .populate("branchId", "name city")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
};

function getAddOnPrice(name) {
  const prices = { insurance: 200, driver: 500, gps: 100 };
  return prices[name] || 0;
}
