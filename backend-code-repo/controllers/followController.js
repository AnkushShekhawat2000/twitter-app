const Follow = require("../model/followModel.js");
const User = require("../model/userModel.js");
const notificationModel = require("../model/notificationModel.js");


const followUserController = async (req, res) => {

  const { followerUserId, followingUserId } = req.body;

  try {

    const follower = await User.findById(followerUserId);

    if (!follower) {
      return res.status(404).json({
        message: "Follower not found",
      });
    }

    const followingUser = await User.findById(followingUserId);

    if (!followingUser) {
      return res.status(404).json({
        message: "User to follow not found",
      });
    }

    if (followerUserId === followingUserId) {
      return res.status(400).json({
        message: "You cannot follow yourself",
      });
    }

    const alreadyFollow = await Follow.findOne({
      followerUserId,
      followingUserId,
    });

    if (alreadyFollow) {
      return res.status(400).json({
        message: "Already following",
      });
    }

    // FOLLOW SAVE

    const follow = new Follow({
      followerUserId,
      followingUserId,
    });

    await follow.save();

    // NOTIFICATION

    if (
      followerUserId.toString() !==
      followingUserId.toString()
    ) {

      const notification = new notificationModel({

        senderId: followerUserId,

        receiverId: followingUserId,

        senderName: follower.name,

        senderProfile: follower.profilePhoto,

        type: "follow",

        text: `${follower.name} started following you `

      });

      await notification.save();

    }

    return res.status(200).json({
      success: true,
      message: "Follow successful",
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};


const unfollowUserController = async (req, res) => {
  const { followerUserId, followingUserId } = req.body;

  try {
  
    if (followerUserId === followingUserId) {
      return res.status(400).json({
        message: "You cannot unfollow yourself",
      });
    }

  
    const follow = await Follow.findOne({
      followerUserId,
      followingUserId,
    });

    if (!follow) {
      return res.status(400).json({
        message: "You are not following this user",
      });
    }

    
    await Follow.deleteOne({
      followerUserId,
      followingUserId,
    });

    return res.status(200).json({
      message: "Unfollow successful",
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};





const getFollowingUsers = async (req, res) => {
  console.log("hitted");

  const { userId } = req.body;
  console.log("userId:", userId);

  try {
  
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const following = await Follow.find({
      followerUserId: userId,
    }).populate("followingUserId", "name username profilePhoto");

    return res.status(200).json({
      message: "Following users fetched",
      following,
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};



const getFollowers = async (req, res) => {
  const { userId } = req.body;

  try {
  
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const followers = await Follow.find({
      followingUserId: userId,
    }).populate("followerUserId", "name username profilePhoto");

    return res.status(200).json({
      message: "Followers fetched",
      followers,
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};




const checkFollowStatusController = async (req, res) => {

  const { followerUserId, followingUserId } = req.body;

  try {

    if (followerUserId === followingUserId) {

      return res.status(200).json({
        success: true,
        isFollowing: false,
      });

    }

    const follow = await followModel.findOne({
      followerUserId,
      followingUserId,
    });

    return res.status(200).json({
      success: true,
      isFollowing: !!follow,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      isFollowing: false,
      message: error.message,
    });

  }
};






module.exports ={followUserController, unfollowUserController, getFollowingUsers, getFollowers, checkFollowStatusController}