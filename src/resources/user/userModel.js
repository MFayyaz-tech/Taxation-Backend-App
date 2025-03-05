const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    otp: {
      type: Number,
      default: null,
    },
    fcmToken: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
    },
    otpExpiry: {
      type: Date,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: "active",
      enum: ["active", "blocked"],
    },
    country: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
