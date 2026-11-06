const mongoose = require("mongoose");

const Follow = require("../model/followModel.js");
const User = require("../model/userModel.js");
const notificationModel = require("../model/notificationModel.js");



const followUserController = async (req, res) => {
  try {
    const followerUserId = req.userId;
    const { followingUserId } = req.body;

    if (!mongoose.isValidObjectId(followingUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (followerUserId === followingUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    const follower = await User.findById(followerUserId);
    const followingUser = await User.findById(followingUserId);

    if (!follower) {
      return res.status(404).json({
        success: false,
        message: "Follower not found",
      });
    }

    if (!followingUser) {
      return res.status(404).json({
        success: false,
        message: "User to follow not found",
      });
    }

    const alreadyFollow = await Follow.findOne({
      followerUserId,
      followingUserId,
    });

    if (alreadyFollow) {
      return res.status(409).json({
        success: false,
        message: "Already following",
      });
    }

    await Follow.create({
      followerUserId,
      followingUserId,
    });

    const notification = await notificationModel.create({
      senderId: followerUserId,
      receiverId: followingUserId,
      senderName: follower.name,
      senderProfile: follower.profilePhoto,
      type: "follow",
      text: `${follower.name} started following you`,
    });

    req.app.get("io").to(followingUserId.toString()).emit(
      "notification:new",
      {
        _id: notification._id,
        senderId: followerUserId,
        senderName: follower.name,
        senderProfile: follower.profilePhoto,
        type: "follow",
        text: `${follower.name} started following you`,
        isRead: false,
        createdAt: notification.createdAt,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Follow successful",
    });

  } catch (error) {
    console.error("Follow Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};



const unfollowUserController = async (req, res) => {
  try {
    const followerUserId = req.userId;
    const { followingUserId } = req.body;

    if (!mongoose.isValidObjectId(followingUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (followerUserId === followingUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot unfollow yourself",
      });
    }

    const follow = await Follow.findOneAndDelete({
      followerUserId,
      followingUserId,
    });

    if (!follow) {
      return res.status(404).json({
        success: false,
        message: "You are not following this user",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Unfollow successful",
    });

  } catch (error) {
    console.error("Unfollow Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};



const getFollowingUsers = async (req, res) => {
  try {
    const userId = req.userId;

    const followingRelations = await Follow.find({
      followerUserId: userId,
    }).populate(
      "followingUserId",
      "name username profilePhoto bio"
    );

    const currentFollowingIds = await Follow.find({
      followerUserId: userId,
    }).distinct("followingUserId");

    const following = await Promise.all(
      followingRelations.map(async (relation) => ({
        ...relation.toObject(),
        mutualFriends: await getMutualCount(
          userId,
          relation.followingUserId?._id
        ),
        isFollowing: currentFollowingIds.some(
          (id) => id.toString() === relation.followingUserId?._id?.toString()
        ),
      }))
    );

    return res.status(200).json({
      success: true,
      message: "Following users fetched",
      following,
    });

  } catch (error) {
    console.error("Get Following Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};



const getFollowers = async (req, res) => {
  try {
    const userId = req.userId;

    const followerRelations = await Follow.find({
      followingUserId: userId,
    }).populate(
      "followerUserId",
      "name username profilePhoto bio"
    );

    const currentFollowingIds = await Follow.find({
      followerUserId: userId,
    }).distinct("followingUserId");

    const followers = await Promise.all(
      followerRelations.map(async (relation) => ({
        ...relation.toObject(),
        mutualFriends: await getMutualCount(
          userId,
          relation.followerUserId?._id
        ),
        isFollowing: currentFollowingIds.some(
          (id) => id.toString() === relation.followerUserId?._id?.toString()
        ),
      }))
    );

    return res.status(200).json({
      success: true,
      message: "Followers fetched",
      followers,
    });

  } catch (error) {
    console.error("Get Followers Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};



const getMutualCount = async (firstUserId, secondUserId) => {
  if (!secondUserId) {
    return 0;
  }

  const [firstFollowing, secondFollowing] = await Promise.all([
    Follow.find({
      followerUserId: firstUserId,
    }).distinct("followingUserId"),

    Follow.find({
      followerUserId: secondUserId,
    }).distinct("followingUserId"),
  ]);

  const firstSet = new Set(
    firstFollowing.map((id) => id.toString())
  );

  const mutualFriends = secondFollowing.filter(
    (id) => firstSet.has(id.toString())
  );

  return mutualFriends.length;
};



const checkFollowStatusController = async (req, res) => {
  try {
    const followerUserId = req.userId;
    const { followingUserId } = req.body;

    if (!mongoose.isValidObjectId(followingUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (followerUserId === followingUserId.toString()) {
      return res.status(200).json({
        success: true,
        isFollowing: false,
      });
    }

    const follow = await Follow.findOne({
      followerUserId,
      followingUserId,
    });

    return res.status(200).json({
      success: true,
      isFollowing: !!follow,
    });

  } catch (error) {
    console.error("Check Follow Status Error:", error);

    return res.status(500).json({
      success: false,
      isFollowing: false,
      message: "Server Error",
    });
  }
};



module.exports = {
  followUserController,
  unfollowUserController,
  getFollowingUsers,
  getFollowers,
  checkFollowStatusController,
};
