
const notificationModel = require("../model/notificationModel.js");
const userModel = require("../model/userModel.js");


const userUpdateController = async (req, res) => {

  const email = req.params.email;

  const needToUpdateInfo = req.body;

  try {

    const updatedInfo = await userModel.findOneAndUpdate(
      { email },
      needToUpdateInfo,
      { new: true }
    );

    if (!updatedInfo) {

      return res.status(404).json({
        message: "User not found",
      });

    }

    return res.status(200).json({
      message: "Profile updated successfully",
      updatedInfo,
    });

  } catch (error) {

    return res.status(500).json({
      message: "Something went wrong",
      error,
    });

  }
};



const getUserNotificationsController = async (req, res) => {

  const userId = req.params.userId;

  try {

    const notifications = await notificationModel
      .find({ receiverId: userId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      notifications,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
}




module.exports = {userUpdateController, getUserNotificationsController};