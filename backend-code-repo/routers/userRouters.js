const express = require("express");
const router = express.Router();
const {userUpdateController, getUserNotificationsController} = require("../controllers/userController.js");

router.patch("/userupdate/:email",  userUpdateController);
router.get("/notifications/:userId",  getUserNotificationsController);

module.exports = router;