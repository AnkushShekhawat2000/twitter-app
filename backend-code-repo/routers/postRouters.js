
const express = require("express");

const postRouter = express.Router();

const {

    createPostController,

    deletePostController,

    editPostController,

    getAllPostsController,

    getUserPostsController,

    likePostController,

    unlikePostController,

    bookmarkPostController,

    unbookmarkPostController,

    getBookmarkedPostsController,

    explorePostsController

} = require("../controllers/postController");



postRouter.post("/create-post", createPostController)
            .delete("/delete-post/:id", deletePostController)
            .patch("/edit-post/:id", editPostController)
            .post("/get-all-posts", getAllPostsController)
            .get("/userpost", getUserPostsController)
            .post("/like", likePostController)
            .post("/unlike", unlikePostController)
            .post("/bookmark", bookmarkPostController)
            .post("/unbookmark", unbookmarkPostController)
            .post("/get-bookmarked-posts",getBookmarkedPostsController)
            .post("/explore-posts", explorePostsController);

module.exports = postRouter;