const mongoose = require("mongoose");

const accessSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },
  lastRequestTime: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

module.exports = mongoose.model("access", accessSchema);
