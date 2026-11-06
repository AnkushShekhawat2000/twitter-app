const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    postId: {
       type: mongoose.Schema.Types.ObjectId,
        ref: "post", required: true,
         index: true 
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    parentCommentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },
    body: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
