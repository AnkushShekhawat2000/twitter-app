
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
    ,
    getCommentsController,
    addCommentController,
    editCommentController,
    deleteCommentController,
    repostController,
    undoRepostController

} = require("../controllers/postController");
const authMiddleware = require("../middlewares/isAuthMiddleware");
const optionalAuth = require("../middlewares/optionalAuth");
const rateLimitting = require("../middlewares/rateLimitting");


postRouter.post("/create-post", authMiddleware, rateLimitting, createPostController)
            .delete("/delete-post/:id", authMiddleware, deletePostController)
            .patch("/edit-post/:id", authMiddleware,  editPostController)
            .post("/get-all-posts", optionalAuth, getAllPostsController)
            .get("/userpost", authMiddleware, getUserPostsController)
            .post("/like", authMiddleware, likePostController)
            .post("/unlike", authMiddleware,  unlikePostController)
            .post("/bookmark", authMiddleware, bookmarkPostController)
            .post("/unbookmark", authMiddleware, unbookmarkPostController)
            .post("/get-bookmarked-posts", authMiddleware, getBookmarkedPostsController)
            .post("/explore-posts",authMiddleware, explorePostsController);
            
postRouter.get("/comments/:postId", optionalAuth, getCommentsController)
            .post("/comments", authMiddleware, addCommentController)
            .patch("/comments/:commentId", authMiddleware, editCommentController)
            .delete("/comments/:commentId", authMiddleware, deleteCommentController)
            .post("/repost", authMiddleware, repostController)
            .post("/undo-repost", authMiddleware, undoRepostController);

module.exports = postRouter;