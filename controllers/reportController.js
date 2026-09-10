const Booking = require("../models/Booking");

exports.getUtilizationReport = async (req, res, next) => {
  try {
    // Generate fleet utilization report aggregating bookings by vehicle and branch
    const report = await Booking.aggregate([
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicleId",
          foreignField: "_id",
          as: "vehicle",
        },
      },
      { $unwind: "$vehicle" },
      {
        $lookup: {
          from: "branches",
          localField: "branchId",
          foreignField: "_id",
          as: "branch",
        },
      },
      { $unwind: "$branch" },
      {
        $group: {
          _id: {
            vehicleId: "$vehicleId",
            vehicleModel: "$vehicle.model",
            vehicleBrand: "$vehicle.brand",
            branchId: "$branchId",
            branchName: "$branch.name",
          },
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          totalDays: { $sum: "$totalDays" },
        },
      },
      {
        $group: {
          _id: "$_id.branchId",
          branchName: { $first: "$_id.branchName" },
          vehicles: {
            $push: {
              vehicleId: "$_id.vehicleId",
              model: "$_id.vehicleModel",
              brand: "$_id.vehicleBrand",
              totalBookings: "$totalBookings",
              totalRevenue: "$totalRevenue",
              totalDays: "$totalDays",
            },
          },
          branchRevenue: { $sum: "$totalRevenue" },
          branchBookings: { $sum: "$totalBookings" },
          branchDays: { $sum: "$totalDays" },
        },
      },
      { $sort: { branchRevenue: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (err) {
    next(err);
  }
};

exports.getRevenueByDateRange = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const matchFilter = { status: { $in: ["returned", "picked_up"] } };
    if (startDate && endDate) {
      matchFilter.startDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const report = await Booking.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$startDate" },
          },
          totalRevenue: { $sum: "$totalAmount" },
          totalBookings: { $sum: 1 },
          totalDays: { $sum: "$totalDays" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (err) {
    next(err);
  }
};
