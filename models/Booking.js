const mongoose = require("mongoose");

const addOnSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ["insurance", "driver", "gps"],
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
});

const bookingSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer is required"],
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: [true, "Vehicle is required"],
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: [true, "Branch is required"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    status: {
      type: String,
      enum: ["reserved", "picked_up", "returned", "cancelled"],
      default: "reserved",
    },
    baseRate: {
      type: Number,
      required: true,
    },
    totalDays: {
      type: Number,
      required: true,
    },
    addOns: [addOnSchema],
    addOnsTotal: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    cancellationCharge: {
      type: Number,
      default: 0,
    },
    damageCharge: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

bookingSchema.index({ customerId: 1 });
bookingSchema.index({ vehicleId: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ branchId: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
