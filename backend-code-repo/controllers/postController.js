const postModel = require("../model/postModel.js");
const userModel = require("../model/userModel.js");
const followModel = require("../model/followModel.js");
const notificationModel = require("../model/notificationModel.js");




const createPostController = async (req, res) => {

  try {

    const {
      profilePhoto,
      postBody,
      postImage,
      username,
      name,
      email,
      userId,
    } = req.body;

    const postObj = new postModel({
      profilePhoto,
      postBody,
      postImage,
      username,
      name,
      email,
      userId,
    });

    const savedPost = await postObj.save();

    return res.status(201).json({
      status: 201,
      message: "Post created successfully",
      post: savedPost,
    });

  } catch (err) {

    return res.status(500).json({
      status: 500,
      message: "Server Error",
      error: err.message,
    });

  }
};




const deletePostController = async (req, res) => {

  const postId = req.params.id;

  const { email } = req.body;

  try {

    const post = await postModel.findById(postId);

    if (!post) {

      return res.status(404).json({
        status: 404,
        message: "Post not found",
      });

    }

    if (post.email !== email) {

      return res.status(403).json({
        status: 403,
        message: "Unauthorized: You can delete only your post",
      });

    }

    await postModel.findByIdAndDelete(postId);

    return res.status(200).json({
      status: 200,
      message: "Post deleted successfully",
    });

  } catch (error) {

    return res.status(500).json({
      status: 500,
      message: "Server Error",
      error: error.message,
    });

  }
};



const editPostController = async (req, res) => {

  const postId = req.params.id;

  const { email, postBody, postImage } = req.body;

  try {

    const post = await postModel.findById(postId);

    if (!post) {

      return res.status(404).json({
        status: 404,
        message: "Post not found",
      });

    }

    if (post.email !== email) {

      return res.status(403).json({
        status: 403,
        message: "Unauthorized: You can edit only your post",
      });

    }

    post.postBody =
      postBody !== undefined ? postBody : post.postBody;

    post.postImage =
      postImage !== undefined ? postImage : post.postImage;

    const updatedPost = await post.save();

    return res.status(200).json({
      status: 200,
      message: "Post updated successfully",
      post: updatedPost,
    });

  } catch (error) {

    return res.status(500).json({
      status: 500,
      message: "Server Error",
      error: error.message,
    });

  }
};




const getAllPostsController = async (req, res) => {

  const { userId } = req.body;

  const page = Number(req.query.page) || 1;

  const limit = Number(req.query.limit) || 5;

  const skip = (page - 1) * limit;

  try {

    const posts = await postModel
      .find()
      .sort({ creationDateTime: -1 })
      .skip(skip)
      .limit(limit);

    const updatedPosts = await Promise.all(

      posts.map(async (post) => {

        const isFollowing = await followModel.findOne({
          followerUserId: userId,
          followingUserId: post.userId,
        });

        const isLiked = post.likes.includes(userId);

        const isBookmarked = post.bookmarks.some(
          (id) => id.toString() === userId
        );

        return {

          _id: post._id,

          postBody: post.postBody,

          postImage: post.postImage,

          userId: post.userId,

          name: post.name,

          username: post.username,

          profilePhoto: post.profilePhoto,

          creationDateTime: post.creationDateTime,

          isFollowing: !!isFollowing,

          isLiked,

          likeCount: post.likes.length,

          isBookmarked,

        };

      })

    );

    return res.status(200).json(updatedPosts);

  } catch (error) {

    return res.status(500).json({
      status: 500,
      message: "Server Error",
      error: error.message,
    });

  }
};




const getUserPostsController = async (req, res) => {

  const email = req.query.email;

  try {

    const posts = await postModel
      .find({ email })
      .sort({ creationDateTime: -1 });

    return res.status(200).send(posts);

  } catch (error) {

    return res.status(500).json({
      status: 500,
      message: "Server Error",
      error: error.message,
    });

  }
};




const likePostController = async (req, res) => {

  const { postId, userId } = req.body;

  try {

    const post = await postModel.findById(postId);

    if (!post) {

      return res.status(404).json({
        message: "Post not found",
      });

    }

    if (!userId) {

    return res.status(401).json({
      message: "Please login first"
    });
  }

    const user = await userModel.findById(userId);

    if (!user) {

      return res.status(404).json({
        message: "User not found",
      });

    }

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {

      return res.json({
        message: "Already liked",
      });

    }

    post.likes.push(userId);

    await post.save();

    if (post.userId.toString() !== userId.toString()) {

      const notification = new notificationModel({

        senderId: userId,

        receiverId: post.userId,

        senderName: user.name,

        senderProfile: user.profilePhoto,

        type: "like",

        postId,

        text: `${user.name} liked your post`,

      });

      await notification.save();

    }

    return res.json({
      message: "Liked successfully",
    });

  } catch (error) {

    return res.status(500).json({
      message: error.message,
    });

  }
};




const unlikePostController = async (req, res) => {

  const { postId, userId } = req.body;

  try {

    await postModel.findByIdAndUpdate(postId, {
      $pull: {
        likes: userId,
      },
    });

    return res.json({
      message: "Unliked",
    });

  } catch (error) {

    return res.status(500).json({
      message: error.message,
    });

  }
};




const bookmarkPostController = async (req, res) => {

  const { postId, userId } = req.body;

  try {

    await postModel.findByIdAndUpdate(postId, {
      $addToSet: {
        bookmarks: userId,
      },
    });

    return res.json({
      message: "Bookmarked",
    });

  } catch (error) {

    return res.status(500).json({
      message: error.message,
    });

  }
};




const unbookmarkPostController = async (req, res) => {

  const { postId, userId } = req.body;

  try {

    await postModel.findByIdAndUpdate(postId, {
      $pull: {
        bookmarks: userId,
      },
    });

    return res.json({
      message: "Unbookmarked",
    });

  } catch (error) {

    return res.status(500).json({
      message: error.message,
    });

  }
};



// GET BOOKMARK POSTS
const getBookmarkedPostsController = async (req, res) => {

  const { userId } = req.body;

  try {

    const posts = await postModel.find({
      bookmarks: userId,
    });

    return res.status(200).json({
      success: true,
      bookmarks: posts,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      bookmarks: [],
      message: error.message,
    });

  }
};




const explorePostsController = async (req, res) => {

  const { userId } = req.body;

  try {

    const posts = await postModel
      .find()
      .sort({ creationDateTime: -1 });

    const trendingPosts = await postModel
      .find()
      .sort({ likes: -1 })
      .limit(5);

    const imagePosts = await postModel.find({
      postImage: { $ne: "" },
    });

    const users = await userModel.find().limit(8);

    const followingList = await followModel.find({
      followerUserId: userId,
    });

    const followingIds = followingList.map(
      (f) => f.followingUserId.toString()
    );

    const updatedUsers = users.map((user) => ({

      ...user._doc,

      isFollowing: followingIds.includes(
        user._id.toString()
      ),

    }));

    return res.status(200).json({
      success: true,
      latestPosts: posts,
      trendingPosts,
      imagePosts,
      users: updatedUsers,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
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

};