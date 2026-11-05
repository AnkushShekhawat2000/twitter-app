
import React, { useEffect, useState } from "react";
import { Avatar, IconButton, Tooltip } from "@mui/material";

import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import BookmarkIcon from "@mui/icons-material/Bookmark";

import "./Bookmarks.css";
import { useLoggedInUser } from "../../context/LoggedInUserContex";
import { authFetch } from "../../utils/authfetch";

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [search, setSearch] = useState("");

    const { loggedInUser } = useLoggedInUser();


  const getBookmarks = async () => {
    try {
      const res = await authFetch(
        "/post/get-bookmarked-posts",
        {
          method: "POST",
          body: JSON.stringify({}),
        },
      );

      const data = await res.json();

      setBookmarks(data.bookmarks || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (loggedInUser?._id) {
      getBookmarks();
    }
  }, [loggedInUser]);


  const handleUnbookmark = async (postId) => {
    try {
      const res = await authFetch(
        "/post/unbookmark",
        {
          method: "POST",
          body: JSON.stringify({ postId }),
        },
      );

      if (res.ok) {
        setBookmarks((prev) =>
          prev.filter((post) => post._id !== postId),
        );
      }
    } catch (error) {
      console.log(error);
    }
  };


  const filteredBookmarks = (bookmarks || []).filter(
    (post) =>
      post.name?.toLowerCase().includes(search.toLowerCase()) ||
      post.username?.toLowerCase().includes(search.toLowerCase()) ||
      post.postBody?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="bookmark-container">

      <div className="bookmark-header-main">
        <div>
          <h2>Bookmarks</h2>
          <p>Saved posts for later</p>
        </div>

        <input
          className="bookmark-search"
          placeholder="Search bookmarks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>


      {filteredBookmarks.length === 0 ? (
        <div className="bookmark-empty">
          <img
            src="https://cdn-icons-png.flaticon.com/512/7486/7486740.png"
            alt=""
          />

          <h2>No Bookmarks Yet</h2>

          <p>Your saved posts will appear here.</p>
        </div>
      ) : (
        <div className="bookmark-list">
          {filteredBookmarks.map((post) => (
            <div className="bookmark-card" key={post._id}>

              <div className="bookmark-top">
                <div className="bookmark-user">
                  <Avatar src={post.profilePhoto} />

                  <div>
                    <h3>
                      {post.name}

                      <VerifiedUserIcon className="verified-icon" />
                    </h3>

                    <p>@{post.username}</p>
                  </div>
                </div>


                <Tooltip title="Remove Bookmark">
                  <IconButton
                    onClick={() => handleUnbookmark(post._id)}
                  >
                    <BookmarkIcon className="bookmark-active-icon" />
                  </IconButton>
                </Tooltip>
              </div>


              <div className="bookmark-content">
                <p>{post.postBody}</p>
              </div>


              {post.postImage && (
                <img
                  className="bookmark-post-image"
                  src={post.postImage}
                  alt=""
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;