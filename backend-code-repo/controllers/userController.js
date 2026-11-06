const notificationModel = require("../model/notificationModel.js");
const userModel = require("../model/userModel.js");

const userUpdateController = async (req, res) => {

  try {

    const userId = req.user.id;

    const {
      name,
      username,
      profilePhoto,
      profileCoverImage,
      bio,
      location,
      website,
      dob,
    } = req.body;

    const updatedInfo = await userModel.findByIdAndUpdate(

      userId,

      {
        $set: {
          name,
          username,
          profilePhoto,
          profileCoverImage,
          bio,
          location,
          website,
          dob,
        },
      },

      {
        new: true,
        runValidators: true,
      }

    ).select("-password");

    if (!updatedInfo) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      updatedInfo,
    });

  } catch (error) {

    console.error("Profile update error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });

  }

};


const getUserNotificationsController = async (req, res) => {

  try {

    const userId = req.user.id;

    const notifications = await notificationModel
      .find({ receiverId: userId })
      .sort({ createdAt: -1 });

    const unreadCount = notifications.filter(
      (item) => !item.isRead
    ).length;

    return res.status(200).json({

      success: true,
      notifications,
      unreadCount,

    });

  } catch (error) {

    console.error("Get notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch notifications",
    });

  }

};


const markNotificationReadController = async (req, res) => {

  try {

    const userId = req.user.id;

    const notificationId = req.params.notificationId;

    if (notificationId) {

      const notification = await notificationModel.findOneAndUpdate(

        {
          _id: notificationId,
          receiverId: userId,
        },

        {
          isRead: true,
        },

        { new: true }

      );

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found",
        });
      }

    } else {

      await notificationModel.updateMany(

        { receiverId: userId },

        { isRead: true }

      );

    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });

  } catch (error) {

    console.error("Mark notification error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update notifications",
    });

  }

};


module.exports = {

  userUpdateController,

  getUserNotificationsController,

  markNotificationReadController,

};