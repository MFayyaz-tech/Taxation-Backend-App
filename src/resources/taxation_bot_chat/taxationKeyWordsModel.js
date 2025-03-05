// models/Chat.js
const mongoose = require("mongoose");
const taxationKeyWordSchema = new mongoose.Schema({
  keywords: String,
});

module.exports = mongoose.model("TaxationKeyWord", taxationKeyWordSchema);
