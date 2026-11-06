const express = require("express");
const auth = require("../middlewares/isAuthMiddleware");
const {
  getSuggestedUsersController,
  getRecommendedFeedController,
  getTrendingPostsController,
} = require("../controllers/discoveryController");

const router = express.Router();
router.get("/suggested-users", auth, getSuggestedUsersController);
router.get("/personalized-feed", auth, getRecommendedFeedController);
router.get("/trending-posts", getTrendingPostsController);

module.exports = router;
