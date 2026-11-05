import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { Avatar, IconButton, Tooltip } from "@mui/material";

import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import RepeatIcon from "@mui/icons-material/Repeat";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PublishIcon from "@mui/icons-material/Publish";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import { authenticatedRequest } from "../Posts/services/postService"
import { formatPostAge } from "../../../utils/postUtils";

import "./Posts.css";
import "./editModel.css";
import posts from "../../../Pages/Profile/Posts/posts";


const API_URL = process.env.REACT_APP_BASE_URL;
const IMGBB_API_KEY = process.env.IMGBB_KEY

const Post = ({ p, onDelete, onUpdate }) => {
  const token = localStorage.getItem("token");
 
  const loggedInUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const {
    name,
    username,
    postImage,
    postBody,
    profilePhoto,
    _id
  } = p;

  const postOwnerId = p.userId?._id || p.userId;

  const currentUserId = loggedInUser?._id || loggedInUser?.id;

  const isOwnPost =
    String(postOwnerId || "") === String(currentUserId || "");

  const [isEditing, setIsEditing] = useState(false);
  const [editBody, setEditBody] = useState(p.postBody ?? "");
  const [editImage, setEditImage] = useState(p.postImage || null);

  const [isFollowing, setIsFollowing] = useState(
    Boolean(p.isFollowing)
  );

  const [isLiked, setIsLiked] = useState(
    Boolean(p.isLiked)
  );

  const [isBookmarked, setIsBookmarked] = useState(
    Boolean(p.isBookmarked)
  );

  const [likeCount, setLikeCount] = useState(
    p.likeCount ?? 0
  );

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentBody, setCommentBody] = useState("");
  const [replyTo, setReplyTo] = useState(null);

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentBody, setEditingCommentBody] = useState("");

  const [repostCount, setRepostCount] = useState(
    p.repostCount ?? 0
  );

  const [isReposted, setIsReposted] = useState(
    Boolean(p.isReposted)
  );

  useEffect(() => {
    setIsFollowing(Boolean(p.isFollowing));
    setIsLiked(Boolean(p.isLiked));
    setIsBookmarked(Boolean(p.isBookmarked));

    setLikeCount(p.likeCount ?? 0);

    setRepostCount(p.repostCount ?? 0);
    setIsReposted(Boolean(p.isReposted));

    setEditBody(p.postBody ?? "");
    setEditImage(p.postImage || null);

  }, [
    p.isFollowing,
    p.isLiked,
    p.isBookmarked,
    p.likeCount,
    p.repostCount,
    p.isReposted,
    p.postBody,
    p.postImage
  ]);



  const loadComments = async () => {
    try {
      const response = await fetch(
        `${API_URL}/post/comments/${_id}`
      );

      if (!response.ok) {
        throw new Error("Unable to load comments");
      }

      const data = await response.json();

      setComments(
        Array.isArray(data.comments) ? data.comments : []
      );

    } catch (error) {
      setComments([]);
      toast.error("Unable to load comments");
    }
  };


  const toggleComments = () => {
    const willOpen = !commentsOpen;

    setCommentsOpen(willOpen);

    if (willOpen) {
      loadComments();
    }
  };

 
  const submitComment = async () => {
    const body = commentBody.trim();

    if (!body) return;

    const data = await authenticatedRequest(
      "/post/comments",
      "POST",
      {
        postId: _id,
        parentCommentId: replyTo,
        body,
      }
    );

    if (!data?.comment) return;

    if (replyTo) {
      await loadComments();
    } else {
      setComments((current) => [
        ...current,
        { ...data.comment, replies: [] }
      ]);
    }

    setCommentBody("");
    setReplyTo(null);
  };


  const startCommentEdit = (comment) => {
    setEditingCommentId(comment._id);
    setEditingCommentBody(comment.body);
  };

 
  const saveCommentEdit = async () => {
    const body = editingCommentBody.trim();

    if (!body) return;

    const data = await authenticatedRequest(
      `/post/comments/${editingCommentId}`,
      "PATCH",
      { body }
    );

    if (!data?.comment) return;

    setEditingCommentId(null);
    setEditingCommentBody("");

    await loadComments();

    toast.success("Comment updated");
  };


  const deleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment and its replies?")) {
      return;
    }

    const data = await authenticatedRequest(
      `/post/comments/${commentId}`,
      "DELETE"
    );

    if (!data) return;

    await loadComments();

    toast.success("Comment deleted");
  };


  const renderComment = (comment, depth = 0) => (
    <div
      key={comment._id}
      className={`post-comment ${
        depth ? "post-comment-reply" : ""
      }`}
      style={{
        "--comment-depth": Math.min(depth, 5)
      }}
    >
      <div className="post-comment-main">

        <div className="post-comment-avatar">
          {comment.userId?.profilePhoto ? (
            <img
              src={comment.userId.profilePhoto}
              alt=""
            />
          ) : (
            (
              comment.userId?.name ||
              comment.userId?.username ||
              "U"
            ).charAt(0).toUpperCase()
          )}
        </div>

        <div className="post-comment-content">

          <div className="post-comment-header">
            <strong>
              {comment.userId?.name ||
                comment.userId?.username ||
                "User"}
            </strong>

            <span>
              @{comment.userId?.username || "user"}
            </span>
          </div>

          {editingCommentId === comment._id ? (
            <div className="post-comment-edit">

              <textarea
                value={editingCommentBody}
                maxLength={500}
                onChange={(event) =>
                  setEditingCommentBody(event.target.value)
                }
              />

              <div>
                <button
                  type="button"
                  className="post-comment-edit-cancel"
                  onClick={() => setEditingCommentId(null)}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="post-comment-save"
                  onClick={saveCommentEdit}
                >
                  Save
                </button>
              </div>

            </div>
          ) : (
            <p>{comment.body}</p>
          )}

          <div className="post-comment-actions">

            <button
              type="button"
              className="post-reply-button"
              onClick={() => {
                setReplyTo(comment._id);
                setCommentBody("");
              }}
            >
              Reply
            </button>

            {String(comment.userId?._id) === String(currentUserId) && (
              <>
                <button
                  type="button"
                  className="post-comment-edit-button"
                  onClick={() => startCommentEdit(comment)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="post-comment-delete-button"
                  onClick={() => deleteComment(comment._id)}
                >
                  Delete
                </button>
              </>
            )}

          </div>
        </div>
      </div>

      {comment.replies?.map((reply) =>
        renderComment(reply, depth + 1)
      )}

    </div>
  );


  const handleFollow = async () => {
    const data = await authenticatedRequest(
      "/follow/follow-user",
      "POST",
      {
        followingUserId: p.userId?._id || p.userId
      }
    );

    if (!data) return;

    setIsFollowing(true);

    toast.success(data.message || "User followed successfully");
  };


  const handleUnfollow = async () => {
    const data = await authenticatedRequest(
      "/follow/unfollow-user",
      "POST",
      {
        followingUserId: p.userId?._id || p.userId
      }
    );

    if (!data) return;

    setIsFollowing(false);

    toast.success(data.message || "User unfollowed successfully");
  };


  const handleLike = async () => {
    if (isLiked) return;

    const data = await authenticatedRequest(
      "/post/like",
      "POST",
      { postId: _id }
    );

    if (!data) return;

    setIsLiked(true);
    setLikeCount((count) => count + 1);

    toast.success("You liked this post!");
  };

  const handleUnlike = async () => {
    if (!isLiked) return;

    const data = await authenticatedRequest(
      "/post/unlike",
      "POST",
      { postId: _id }
    );

    if (!data) return;

    setIsLiked(false);

    setLikeCount((count) => Math.max(0, count - 1));

    toast.info("Like removed");
  };


  const handleBookmark = async () => {
    if (isBookmarked) return;

    const data = await authenticatedRequest(
      "/post/bookmark",
      "POST",
      { postId: _id }
    );

    if (!data) return;

    setIsBookmarked(true);

    toast.success(data.message || "Post bookmarked");
  };

  const handleUnbookmark = async () => {
    if (!isBookmarked) return;

    const data = await authenticatedRequest(
      "/post/unbookmark",
      "POST",
      { postId: _id }
    );

    if (!data) return;

    setIsBookmarked(false);

    toast.success("Bookmark removed");
  };


  const toggleRepost = async () => {
    const data = await authenticatedRequest(
      isReposted ? "/post/undo-repost" : "/post/repost",
      "POST",
      { postId: _id }
    );

    if (!data) return;

    setRepostCount(data.repostCount ?? 0);
    setIsReposted((previous) => !previous);

    toast.success(
      isReposted
        ? "Retweet removed"
        : "Retweeted successfully"
    );
  };


  const handleUpdate = async () => {
    try {
      await onUpdate({
        ...p,
        postBody: editBody,
        postImage: editImage
      });

      setIsEditing(false);

      toast.success("Post updated successfully!");

    } catch (error) {
      toast.error(error.message || "Failed to update post");
    }
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image.");
      event.target.value = "";
      return;
    }

    try {
      const formData = new FormData();

      formData.append("image", file);

      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        {
          method: "POST",
          body: formData
        }
      );

      const data = await response.json();

      if (
        !response.ok ||
        !data.success ||
        !data.data?.display_url
      ) {
        throw new Error(
          data.error?.message || "Image upload failed"
        );
      }

      setEditImage(data.data.display_url);

      toast.success("Image uploaded successfully");

    } catch (error) {
      toast.error(error.message || "Unable to upload image");

    } finally {
      event.target.value = "";
    }
  };


  const removeImage = () => {
    setEditImage(null);
  };

return (
  <div className="post">

    <div className="avtar-icons">

      <div className="profile-info">
        <div className="post_avatar">
          <Avatar src={profilePhoto} />
        </div>

        <div className="post__headerText">
          <h3>
            {name}{" "}
            <span className="post__headerSpecial">
              <VerifiedUserIcon className="post_badge" />
              @{username}
            </span>

            {p.creationDateTime && (
              <span
                className="post__age"
                title={new Date(p.creationDateTime).toLocaleString()}
              >
                {formatPostAge(p.creationDateTime)}
              </span>
            )}
          </h3>
        </div>
      </div>

      {/* Edit / Delete / Follow */}
      <div className="flex items-center space-x-1">

        {isOwnPost ? (
          <>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => setIsEditing(true)}
                className="!text-zinc-400 hover:!text-sky-500"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={() => onDelete(_id)}
                className="!text-zinc-400 hover:!text-rose-500"
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <button
            onClick={isFollowing ? handleUnfollow : handleFollow}
            className={`follow-btn ${isFollowing ? "following" : ""}`}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
        )}

      </div>
    </div>

    <div className="post__body">

      {p.isRepost && (
        <div className="post-retweet-label">
          <RepeatIcon fontSize="small" />
          <span>Retweeted by you</span>
        </div>
      )}

      <div className="post_header">
        <div className="post__headerDescription">
          <p>{postBody}</p>
        </div>
      </div>

      {postImage && (
        <img
          src={postImage}
          alt="post"
          width="500"
        />
      )}

      <div className="post__footer">

        <ChatBubbleOutlineIcon
          className="post__footer__icon"
          fontSize="small"
          onClick={toggleComments}
        />

        <div className="flex items-center space-x-1">
          <RepeatIcon
            className={`post__footer__icon ${isReposted ? "retweeted" : ""}`}
            fontSize="small"
            onClick={toggleRepost}
            titleAccess={isReposted ? "Undo retweet" : "Retweet"}
          />
          <span>{repostCount}</span>
        </div>

        <div className="flex items-center space-x-1 gp-btw">
          <FavoriteBorderIcon
            onClick={isLiked ? handleUnlike : handleLike}
            className={`post__footer__icon ${isLiked ? "liked" : ""}`}
            fontSize="small"
          />
          <span>{likeCount}</span>
        </div>

        <div className="flex items-center space-x-1">
          {isBookmarked ? (
            <BookmarkIcon
              onClick={handleUnbookmark}
              className="post__footer__icon bookmarked"
              fontSize="small"
            />
          ) : (
            <BookmarkBorderIcon
              onClick={handleBookmark}
              className="post__footer__icon"
              fontSize="small"
            />
          )}
        </div>

      </div>

      {commentsOpen && (
        <div className="post-comments">

          <div className="post-comment-list">
            {comments.map((comment) => renderComment(comment))}
          </div>

          <div className="post-comment-form">

            {replyTo && (
              <button
                type="button"
                className="post-comment-cancel-reply"
                onClick={() => setReplyTo(null)}
              >
                Cancel reply
              </button>
            )}

            <input
              value={commentBody}
              onChange={(event) => setCommentBody(event.target.value)}
              placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
            />

            <button
              type="button"
              onClick={submitComment}
            >
              {replyTo ? "Post reply" : "Comment"}
            </button>

          </div>
        </div>
      )}

      {isEditing && (
        <div
          className="modal-overlay"
          onClick={() => setIsEditing(false)}
        >
          <div
            className="modal-container"
            onClick={(event) => event.stopPropagation()}
          >

            {/* Modal Header */}
            <div className="modal-header">
              <h2>Edit Tweet</h2>

              <button
                className="btn-cancel"
                style={{
                  background: "transparent",
                  fontSize: "20px"
                }}
                onClick={() => setIsEditing(false)}
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">

              <textarea
                autoFocus
                className="modal-textarea"
                value={editBody}
                onChange={(event) => setEditBody(event.target.value)}
              />

              {/* Image Preview */}
              {editImage && (
                <div className="modal-image-preview">

                  <img
                    src={editImage}
                    alt="Preview"
                  />

                  <button
                    className="remove-image-btn"
                    onClick={removeImage}
                  >
                    ×
                  </button>

                </div>
              )}

              {/* Image Upload */}
              <div className="image-upload-wrapper">
                <label className="image-upload-btn">

                  <PublishIcon fontSize="small" />

                  <span>
                    {editImage ? "Change Image" : "Add Image"}
                  </span>

                  {editImage && (
                    <p style={{ fontSize: "12px", color: "gray" }}>
                      Image selected
                    </p>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />

                </label>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="modal-footer">

              <button
                className="btn"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>

              <button
                className="btn btn-update"
                onClick={handleUpdate}
                disabled={
                  !editBody.trim() ||
                  (
                    editBody === postBody &&
                    editImage === postImage
                  )
                }
              >
                Update
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  </div>
);
}


export default Post;