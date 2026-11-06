const Follow = require("../model/followModel");
const User = require("../model/userModel");
const Post = require("../model/postModel");

const toId = (value) => value?.toString();

const getSuggestedUsersController = async (req, res) => {
  try {
    const userId = req.user.id;
    const followingIds = await Follow.find({ followerUserId: userId }).distinct("followingUserId");
    const followingSet = new Set(followingIds.map(toId));
    followingSet.add(userId);

    const candidateRelations = await Follow.find({
      followerUserId: { $in: [...followingSet].filter((id) => id !== userId) },
      followingUserId: { $nin: [...followingSet] },
    });

    const counts = new Map();
    candidateRelations.forEach((relation) => {
      const id = toId(relation.followingUserId);
      counts.set(id, (counts.get(id) || 0) + 1);
    });

    const candidateIds = [...counts.keys()].slice(0, 20);
    const candidates = await User.find({ _id: { $in: candidateIds } })
      .select("name username profilePhoto bio")
      .lean();
    const users = candidates.map((user) => ({
      ...user,
      mutualFriends: counts.get(toId(user._id)) || 0,
    })).sort((a, b) => b.mutualFriends - a.mutualFriends);

    return res.status(200).json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to load suggestions" });
  }
};

const getRecommendedFeedController = async (req, res) => {
  try {
    const userId = req.user.id;
    const followingIds = await Follow.find({ followerUserId: userId }).distinct("followingUserId");
    const posts = await Post.find({ creationDateTime: { $gte: Date.now() - 14 * 24 * 60 * 60 * 1000 } }).lean();

    const ranked = posts.map((post) => {
      const ageHours = Math.max(1, (Date.now() - (post.creationDateTime || Date.now())) / 3600000);
      const isFollowed = followingIds.some((id) => id.toString() === post.userId.toString());
      const likes = post.likes?.length || 0;
      const reposts = post.reposts?.length || 0;
      const bookmarkBonus = post.bookmarks?.length || 0;
      const score = (isFollowed ? 30 : 0) + likes * 2 + reposts * 3 + bookmarkBonus + 100 / (ageHours + 2);
      return { ...post, recommendationScore: Number(score.toFixed(2)) };
    }).sort((a, b) => b.recommendationScore - a.recommendationScore);

    return res.status(200).json({ success: true, posts: ranked.slice(0, 50) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to build feed" });
  }
};

const getTrendingPostsController = async (req, res) => {
  try {
    const posts = await Post.find({ creationDateTime: { $gte: Date.now() - 7 * 24 * 60 * 60 * 1000 } }).lean();
    const ranked = posts.map((post) => {
      const ageHours = Math.max(1, (Date.now() - (post.creationDateTime || Date.now())) / 3600000);
      const likes = post.likes?.length || 0;
      const reposts = post.reposts?.length || 0;
      const bookmarks = post.bookmarks?.length || 0;
      const score = (likes * 2 + reposts * 3 + bookmarks) / Math.pow(ageHours + 2, 0.8);
      return { ...post, trendingScore: Number(score.toFixed(2)) };
    }).sort((a, b) => b.trendingScore - a.trendingScore);

    return res.status(200).json({ success: true, posts: ranked.slice(0, 30) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to load trending posts" });
  }
};

module.exports = { getSuggestedUsersController, getRecommendedFeedController, getTrendingPostsController };
