const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: [true, "Branch is required"],
    },
    type: {
      type: String,
      enum: ["car", "bike"],
      required: [true, "Vehicle type is required"],
    },
    model: {
      type: String,
      required: [true, "Vehicle model is required"],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
    },
    licensePlate: {
      type: String,
      required: [true, "License plate is required"],
      unique: true,
      trim: true,
    },
    perDayRate: {
      type: Number,
      required: [true, "Per-day rate is required"],
      min: [0, "Rate cannot be negative"],
    },
    status: {
      type: String,
      enum: ["available", "booked", "maintenance"],
      default: "available",
    },
    fuelType: {
      type: String,
      enum: ["petrol", "diesel", "electric", "hybrid"],
      default: "petrol",
    },
    transmission: {
      type: String,
      enum: ["manual", "automatic"],
      default: "manual",
    },
    seats: {
      type: Number,
      default: 5,
    },
  },
  { timestamps: true }
);

vehicleSchema.index({ branchId: 1 });
vehicleSchema.index({ licensePlate: 1 }, { unique: true });

module.exports = mongoose.model("Vehicle", vehicleSchema);
