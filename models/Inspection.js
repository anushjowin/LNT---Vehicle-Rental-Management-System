const mongoose = require("mongoose");

const inspectionSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Booking is required"],
    },
    stage: {
      type: String,
      enum: ["pickup", "return"],
      required: [true, "Inspection stage is required"],
    },
    odometer: {
      type: Number,
      required: [true, "Odometer reading is required"],
      min: [0, "Odometer cannot be negative"],
    },
    fuelLevel: {
      type: Number,
      required: [true, "Fuel level is required"],
      min: [0, "Fuel level cannot be less than 0"],
      max: [100, "Fuel level cannot exceed 100"],
    },
    damageNotes: {
      type: String,
      trim: true,
      default: "",
    },
    inspectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

inspectionSchema.index({ bookingId: 1 });

module.exports = mongoose.model("Inspection", inspectionSchema);
