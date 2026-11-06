const express = require('express');
const {followUserController, unfollowUserController, getFollowingUsers, getFollowers, checkFollowStatusController} = require('../controllers/followController');
const authMiddleware = require('../middlewares/isAuthMiddleware');
const followRouter = express.Router();

followRouter.post('/follow-user', authMiddleware, followUserController)
                .post("/unfollow-user", authMiddleware,  unfollowUserController)
                .post("/get-followings", authMiddleware, getFollowingUsers )
                .post("/get-followers", authMiddleware, getFollowers)
                .post("/check-follow-status", authMiddleware, checkFollowStatusController);

module.exports = followRouter;