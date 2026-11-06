const express = require("express");
const router = express.Router();
const {userUpdateController, getUserNotificationsController, markNotificationReadController} = require("../controllers/userController.js");
const authMiddleware = require("../middlewares/isAuthMiddleware.js");

router.patch("/userupdate/:email", authMiddleware,  userUpdateController);
router.get("/notifications/:userId",  authMiddleware,  getUserNotificationsController);
router.patch("/notifications/read/:notificationId?", authMiddleware, markNotificationReadController);

module.exports = router;