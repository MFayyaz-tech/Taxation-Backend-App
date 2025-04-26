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
    email_verified: {
      type: Boolean,
      default: false,
    },
    otp_type: {
      type: String,
      enum: ["signup", "resetPassword", null],
      default: null,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    device_id: {
      type: String,
    },
    is_login: {
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
