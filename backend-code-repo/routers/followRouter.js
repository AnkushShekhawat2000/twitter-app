const express = require('express');
const {followUserController, unfollowUserController, getFollowingUsers, getFollowers, checkFollowStatusController} = require('../controllers/followController');
const followRouter = express.Router();

followRouter.post('/follow-user', followUserController)
                .post("/unfollow-user", unfollowUserController)
                .post("/get-followings", getFollowingUsers )
                .post("/get-followers", getFollowers)
                .post("/check-follow-status", checkFollowStatusController);

module.exports = followRouter;