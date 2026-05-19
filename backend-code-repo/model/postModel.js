const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema({
  profilePhoto: {
    type: String,
  },

  postBody: {
    type: String,
  },

  postImage: {
    type: String,
  },

  username: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
  },
  email: {
    type: String,
  },
   likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  ],
   bookmarks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],

  creationDateTime: {
    type: Number,
    default: Date.now,
  },
});

module.exports = mongoose.model("post", postSchema);
