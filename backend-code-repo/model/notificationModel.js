const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({

  senderId: String,
  receiverId: String,

  senderName: String,
  senderProfile: String,

  type: String,

  postId: String,

  text: String,

  isRead: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

});

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);