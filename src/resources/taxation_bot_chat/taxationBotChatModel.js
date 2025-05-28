// models/Chat.js
const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  session: String,
  title: String,
  request: String,
  response: String,
  refrence: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("BotChat", chatSchema);
