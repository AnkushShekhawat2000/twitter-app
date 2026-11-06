const postModel = require("../model/postModel.js");
const userModel = require("../model/userModel.js");
const followModel = require("../model/followModel.js");
const notificationModel = require("../model/notificationModel.js");
const commentModel = require("../model/commentModel.js");
const mongoose = require("mongoose");


const sendNotification = (req, receiverId, notification) => {

  if (!receiverId || receiverId.toString() === req.user.id.toString()) {
    return;
  }

  const io = req.app.get("io");

  if (io) {
    io.to(receiverId.toString()).emit(
      "notification:new",
      notification
    );
  }

};



const createNotification = async (req, data) => {

  const notification = await notificationModel.create(data);

  sendNotification(
    req,
    notification.receiverId,
    notification.toObject()
  );

  return notification;

};



const isValidId = (id) => mongoose.isValidObjectId(id);





const createPostController = async (req, res) => {

  try {

    const { postBody, postImage } = req.body;

    const userId = req.user.id;

    if (!postBody || !postBody.trim()) {
      return res.status(400).json({
        success: false,
        message: "Post body is required",
      });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const post = await postModel.create({

      userId: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      profilePhoto: user.profilePhoto,

      postBody: postBody.trim(),
      postImage: postImage || "",

    });

    const usernames = [
      ...new Set(
        (postBody.match(/@([A-Za-z0-9_]+)/g) || [])
          .map((item) => item.slice(1))
      ),
    ];


    const mentionedUsers = await userModel.find({
      username: { $in: usernames },
    });

    for (const mentionedUser of mentionedUsers) {

      if (mentionedUser._id.toString() === userId.toString()) {
        continue;
      }

      await createNotification(req, {

        senderId: userId,
        receiverId: mentionedUser._id,
        senderName: user.name,
        senderProfile: user.profilePhoto,
        type: "mention",
        postId: post._id,
        text: `${user.name} mentioned you in a post`,

      });

    }


    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      post,
    });

  } catch (error) {

    console.error("Create post error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });

  }

};



const deletePostController = async (req, res) => {

  try {

    const postId = req.params.id;
    const userId = req.user.id;

    const post = await postModel.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can delete only your own post",
      });
    }

    await postModel.findByIdAndDelete(postId);

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });

  } catch (error) {

    console.error("Delete post error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });

  }

};



const editPostController = async (req, res) => {

  try {

    const postId = req.params.id;
    const userId = req.user.id;

    const { postBody, postImage } = req.body;

    const post = await postModel.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can edit only your own post",
      });
    }

    if (postBody !== undefined) {

      if (typeof postBody !== "string" || !postBody.trim()) {
        return res.status(400).json({
          success: false,
          message: "Post body cannot be empty",
        });
      }

      post.postBody = postBody.trim();

    }

    if (postImage !== undefined) {
      post.postImage = postImage;
    }

    const updatedPost = await post.save();

    return res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post: updatedPost,
    });

  } catch (error) {

    console.error("Edit post error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });

  }

};


const getAllPostsController = async (req, res) => {

  try {

    const userId = req.user?.id;

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 5));

    const cursor = req.query.cursor
      ? Number(req.query.cursor)
      : null;

    const skip = cursor ? 0 : (page - 1) * limit;

    const query = cursor
      ? { creationDateTime: { $lt: cursor } }
      : {};


    const posts = await postModel
      .find(query)
      .sort({ creationDateTime: -1 })
      .skip(skip)
      .limit(limit);


    const updatedPosts = await Promise.all(

      posts.map(async (post) => {

        let isFollowing = false;
        let isLiked = false;
        let isBookmarked = false;
        let isReposted = false;

        if (userId) {

          const following = await followModel.findOne({
            followerUserId: userId,
            followingUserId: post.userId,
          });

          isFollowing = !!following;

          isLiked = post.likes.some(
            (id) => id.toString() === userId.toString()
          );

          isBookmarked = post.bookmarks.some(
            (id) => id.toString() === userId.toString()
          );

          isReposted = post.reposts.some(
            (id) => id.toString() === userId.toString()
          );

        }

        return {

          _id: post._id,
          userId: post.userId,

          name: post.name,
          username: post.username,
          profilePhoto: post.profilePhoto,

          postBody: post.postBody,
          postImage: post.postImage,

          creationDateTime: post.creationDateTime,

          isFollowing,
          isLiked,
          isBookmarked,
          isReposted,

          likeCount: post.likes.length,
          repostCount: post.reposts.length,

        };

      })

    );


    const nextCursor = posts.length === limit
      ? posts[posts.length - 1].creationDateTime
      : null;


    return res.status(200).json({
      success: true,
      posts: updatedPosts,
      nextCursor,
    });

  } catch (error) {

    console.error("Get all posts error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });

  }

};


const getUserPostsController = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const email = req.user.email;

    const posts = await postModel
      .find({ userId })
      .sort({ creationDateTime: -1 })
      .lean();

    const reposts = await postModel
      .find({ reposts: userId })
      .lean();

    const timeline = [];

    posts.forEach((post) => {
      timeline.push({
        ...post,
        timelineDateTime: post.creationDateTime,
        isRepost: false,
      });
    });

    reposts.forEach((post) => {
      if (post.userId.toString() === userId.toString()) {
        return;
      }

      const activity = post.repostActivity?.find(
        (item) =>
          item.userId.toString() === userId.toString()
      );

      timeline.push({
        ...post,
        timelineDateTime:
          activity?.repostedAt || post.creationDateTime,
        isRepost: true,
        repostedBy: {
          _id: userId,
          name: req.user.name,
          username: req.user.username,
          profilePhoto: req.user.profilePhoto,
        },
      });
    });

    timeline.sort(
      (a, b) =>
        new Date(b.timelineDateTime) -
        new Date(a.timelineDateTime)
    );

    return res.status(200).json(timeline);

  } catch (error) {
    console.error("Get user posts error:", error);

    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};




const likePostController = async (req, res) => {

  try {

    const { postId } = req.body;
    const userId = req.user.id;

    const post = await postModel.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check already liked
    if (post.likes.includes(userId)) {
      return res.status(200).json({
        success: true,
        message: "Already liked",
      });
    }

    post.likes.push(userId);

    await post.save();

    if (post.userId.toString() !== userId.toString()) {

      const user = await userModel.findById(userId);

      if (user) {

        await createNotification(req, {

          senderId: userId,
          receiverId: post.userId,
          senderName: user.name,
          senderProfile: user.profilePhoto,
          type: "like",
          postId,
          text: `${user.name} liked your post`,

        });

      }

    }

    return res.status(200).json({
      success: true,
      message: "Liked successfully",
      likeCount: post.likes.length,
    });

  } catch (error) {

    console.error("Like post error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });

  }

};



const unlikePostController = async (req, res) => {

  try {

    const { postId } = req.body;
    const userId = req.user.id;

    const post = await postModel.findByIdAndUpdate(
      postId,
      {
        $pull: { likes: userId },
      },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Unliked successfully",
      likeCount: post.likes.length,
    });

  } catch (error) {

    console.error("Unlike post error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });

  }

};



const bookmarkPostController = async (req, res) => {

  try {

    const { postId } = req.body;
    const userId = req.user.id;

    const post = await postModel.findByIdAndUpdate(
      postId,
      {
        $addToSet: { bookmarks: userId },
      },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Bookmarked successfully",
    });

  } catch (error) {

    console.error("Bookmark error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });

  }

};



const unbookmarkPostController = async (req, res) => {

  try {

    const { postId } = req.body;
    const userId = req.user.id;

    const post = await postModel.findByIdAndUpdate(
      postId,
      {
        $pull: { bookmarks: userId },
      },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Unbookmarked successfully",
    });

  } catch (error) {

    console.error("Unbookmark error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });

  }

};


const getBookmarkedPostsController = async (req, res) => {

  try {

    const userId = req.user.id;

    const posts = await postModel
      .find({ bookmarks: userId })
      .sort({ creationDateTime: -1 });

    return res.status(200).json({
      success: true,
      bookmarks: posts,
    });

  } catch (error) {

    console.error("Get bookmarks error:", error);

    return res.status(500).json({
      success: false,
      bookmarks: [],
      message: "Server error",
    });

  }

};


const explorePostsController = async (req, res) => {

  try {

    const userId = req.user.id;

    const latestPosts = await postModel
      .find()
      .sort({ creationDateTime: -1 })
      .limit(20);

    const trendingPosts = await postModel
      .find()
      .sort({ likes: -1 })
      .limit(5);

    const imagePosts = await postModel
      .find({ postImage: { $ne: "" } })
      .sort({ creationDateTime: -1 })
      .limit(20);

    const users = await userModel
      .find({ _id: { $ne: userId } })
      .select("-password")
      .limit(8);

    const followingList = await followModel.find({
      followerUserId: userId,
    });

    const followingIds = followingList.map(
      (item) => item.followingUserId.toString()
    );

    const updatedUsers = users.map((user) => ({

      ...user.toObject(),

      isFollowing: followingIds.includes(
        user._id.toString()
      ),

    }));

    return res.status(200).json({

      success: true,
      latestPosts,
      trendingPosts,
      imagePosts,
      users: updatedUsers,

    });

  } catch (error) {

    console.error("Explore error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });

  }

};



const getCommentsController = async (req, res) => {

  try {

    const { postId } = req.params;

    const comments = await commentModel
      .find({ postId })
      .populate("userId", "name username profilePhoto")
      .sort({ createdAt: 1 });

    const commentMap = new Map();

    comments.forEach((comment) => {

      const item = comment.toObject();

      item.replies = [];

      commentMap.set(comment._id.toString(), item);

    });

    const rootComments = [];

    commentMap.forEach((comment) => {

      const parentId = comment.parentCommentId?.toString();

      if (parentId && commentMap.has(parentId)) {

        commentMap.get(parentId).replies.push(comment);

      } else {

        rootComments.push(comment);

      }

    });

    return res.status(200).json({
      success: true,
      comments: rootComments,
    });

  } catch (error) {

    console.error("Get comments error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });

  }

};



const addCommentController = async (req, res) => {

  try {

    const { postId, parentCommentId, body } = req.body;

    const userId = req.user.id;

    if (!postId || !body || !body.trim()) {
      return res.status(400).json({
        success: false,
        message: "Post ID and comment text are required",
      });
    }

    const post = await postModel.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (parentCommentId) {

      const parent = await commentModel.findOne({
        _id: parentCommentId,
        postId,
      });

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: "Parent comment not found",
        });
      }

    }

    const comment = await commentModel.create({

      postId,
      parentCommentId: parentCommentId || null,
      userId,
      body: body.trim(),

    });

    await comment.populate(
      "userId",
      "name username profilePhoto"
    );

    const user = comment.userId;


    if (post.userId.toString() !== userId.toString()) {

      await createNotification(req, {

        senderId: userId,
        receiverId: post.userId,
        senderName: user.name,
        senderProfile: user.profilePhoto,
        type: "comment",
        postId,
        text: `${user.name} commented on your post`,

      });

    }


    const usernames = [
      ...new Set(
        (body.match(/@([A-Za-z0-9_]+)/g) || [])
          .map((item) => item.slice(1))
      ),
    ];

    const mentionedUsers = await userModel.find({
      username: { $in: usernames },
    });


    for (const mentionedUser of mentionedUsers) {

      if (mentionedUser._id.toString() === userId.toString()) {
        continue;
      }

      await createNotification(req, {

        senderId: userId,
        receiverId: mentionedUser._id,
        senderName: user.name,
        senderProfile: user.profilePhoto,
        type: "mention",
        postId,
        text: `${user.name} mentioned you in a comment`,

      });

    }


    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment,
    });

  } catch (error) {

    console.error("Add comment error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });

  }

};



const editCommentController = async (req, res) => {

  try {

    const { commentId } = req.params;
    const { body } = req.body;

    const userId = req.user.id;

    if (!body || !body.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const comment = await commentModel.findOne({
      _id: commentId,
      userId,
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found or unauthorized",
      });
    }

    comment.body = body.trim();
    await comment.save();

    await comment.populate(
      "userId",
      "name username profilePhoto"
    );

    return res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      comment,
    });

  } catch (error) {

    console.error("Edit comment error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });

  }

};


const deleteCommentController = async (req, res) => {

  try {

    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await commentModel.findOne({
      _id: commentId,
      userId,
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found or unauthorized",
      });
    }

    let commentIds = [comment._id];

    let allIds = [comment._id];

    while (commentIds.length > 0) {

      const replies = await commentModel.find({
        parentCommentId: { $in: commentIds },
      }).select("_id");

      commentIds = replies.map((reply) => reply._id);

      allIds.push(...commentIds);

    }

    await commentModel.deleteMany({
      _id: { $in: allIds },
    });

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });

  } catch (error) {

    console.error("Delete comment error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });

  }

};



const repostController = async (req, res) => {

  try {

    const { postId } = req.body;
    const userId = req.user.id;

    const post = await postModel.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.reposts.includes(userId)) {
      return res.status(200).json({
        success: true,
        message: "Already reposted",
        repostCount: post.reposts.length,
      });
    }

    post.reposts.push(userId);

    post.repostActivity.push({
      userId,
      repostedAt: new Date(),
    });

    await post.save();


    if (post.userId.toString() !== userId.toString()) {

      const user = await userModel.findById(userId);

      if (user) {

        await createNotification(req, {

          senderId: userId,
          receiverId: post.userId,
          senderName: user.name,
          senderProfile: user.profilePhoto,
          type: "repost",
          postId,
          text: `${user.name} reposted your post`,

        });

      }

    }


    return res.status(200).json({
      success: true,
      message: "Reposted successfully",
      repostCount: post.reposts.length,
    });

  } catch (error) {

    console.error("Repost error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });

  }

};



const undoRepostController = async (req, res) => {

  try {

    const { postId } = req.body;
    const userId = req.user.id;

    const post = await postModel.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    post.reposts.pull(userId);

    post.repostActivity = post.repostActivity.filter(
      (item) => item.userId.toString() !== userId.toString()
    );

    await post.save();

    return res.status(200).json({
      success: true,
      message: "Repost removed successfully",
      repostCount: post.reposts.length,
    });

  } catch (error) {

    console.error("Undo repost error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });

  }

};



module.exports = {

  createPostController,
  deletePostController,
  editPostController,
  getAllPostsController,
  getUserPostsController,

  likePostController,
  unlikePostController,

  bookmarkPostController,
  unbookmarkPostController,
  getBookmarkedPostsController,

  explorePostsController,

  getCommentsController,
  addCommentController,
  editCommentController,
  deleteCommentController,

  repostController,
  undoRepostController,

};