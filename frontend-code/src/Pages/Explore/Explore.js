

import React, { useEffect, useState } from "react";
import useLoggedInUser from "../../hooks/useLoggedInUser";

import "./Explore.css";

const Explore = () => {

  const [data, setData] = useState({
    latestPosts: [],
    trendingPosts: [],
    imagePosts: [],
    users: [],
  });

  const [search, setSearch] = useState("");

  // const [loggedInUser] = useLoggedInUser();

    const { loggedInUser } = useLoggedInUser();



  const getExploreData = async () => {

    try {

      const res = await fetch(
        `${process.env.REACT_APP_BASE_URL}/post/explore-posts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: loggedInUser?._id,
          }),
        }
      );

      const result = await res.json();

      // REMOVE SELF + ALREADY FOLLOWING USERS

      const suggestedUsers = (result.users || []).filter(

        (user) =>

          user._id !== loggedInUser?._id &&
          !user.isFollowing

      );

      setData({
        latestPosts: result.latestPosts || [],
        trendingPosts: result.trendingPosts || [],
        imagePosts: result.imagePosts || [],
        users: suggestedUsers,
      });

    } catch (error) {

      console.log(error);

    }

  };

  useEffect(() => {

    if (loggedInUser?._id) {

      getExploreData();

    }

  }, [loggedInUser]);

  // ================= SEARCH =================

  const searchText = search.trim().toLowerCase();

  // POSTS FILTER

  const filteredPosts = data.latestPosts.filter((post) => {

    if (!searchText) return true;

    return (

      post.name?.toLowerCase().includes(searchText) ||
      post.username?.toLowerCase().includes(searchText) ||
      post.postBody?.toLowerCase().includes(searchText)

    );

  });

  // TRENDING FILTER

  const filteredTrending = data.trendingPosts.filter((post) => {

    if (!searchText) return true;

    return (

      post.name?.toLowerCase().includes(searchText) ||
      post.username?.toLowerCase().includes(searchText) ||
      post.postBody?.toLowerCase().includes(searchText)

    );

  });

  // USERS FILTER

  const filteredUsers = data.users.filter((user) => {

    if (!searchText) return true;

    return (

      user.name?.toLowerCase().includes(searchText) ||
      user.username?.toLowerCase().includes(searchText)

    );

  });

  // IMAGE FILTER

  const filteredImages = data.imagePosts.filter((post) => {

    if (!searchText) return true;

    return (

      post.name?.toLowerCase().includes(searchText) ||
      post.username?.toLowerCase().includes(searchText) ||
      post.postBody?.toLowerCase().includes(searchText)

    );

  });

  // ================= FOLLOW / UNFOLLOW =================

  const handleFollowToggle = async (user) => {

    try {

      const url = user.isFollowing

        ? `${process.env.REACT_APP_BASE_URL}/follow/unfollow-user`

        : `${process.env.REACT_APP_BASE_URL}/follow/follow-user`;

      const res = await fetch(url, {

        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({

          followerUserId: loggedInUser?._id,
          followingUserId: user._id,

        }),

      });

      if (res.ok) {

        // REMOVE USER FROM SUGGESTION AFTER FOLLOW

        setData((prev) => ({

          ...prev,

          users: prev.users.filter(
            (u) => u._id !== user._id
          ),

        }));

      }

    } catch (error) {

      console.log(error);

    }

  };

  return (

    <div className="explore">

      {/* HEADER */}

      <div className="explore-header">

        <div>

          <h2>Explore</h2>

          <p>Discover trending content</p>

        </div>

        <input
          type="text"
          placeholder="Search posts, users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>

      {/* TRENDING */}

      {filteredTrending.length > 0 && (

        <div className="explore-section">

          <div className="section-title">
            Trending Posts
          </div>

          <div className="trending-grid">

            {filteredTrending.map((post) => (

              <div className="trending-card" key={post._id}>

                {post.postImage && (
                  <img src={post.postImage} alt="" />
                )}

                <div className="trending-content">

                  <h4>{post.name}</h4>

                  <p>
                    {post.postBody?.slice(0, 80)}
                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>

      )}

      {/* USERS */}

      {filteredUsers.length > 0 && (

        <div className="explore-section">

          <div className="section-title">
            Suggested Users
          </div>

          <div className="users-grid">

            {filteredUsers.map((user) => (

              <div className="user-card" key={user._id}>

                <img
                  src={
                    user.profilePhoto ||
                    "https://i.ibb.co/4pDNDk1/avatar.png"
                  }
                  alt=""
                />

                <h4>{user.name}</h4>

                <p>@{user.username}</p>

                <button
                  onClick={() => handleFollowToggle(user)}
                  className="follow-btn"
                >

                  Follow

                </button>

              </div>

            ))}

          </div>

        </div>

      )}

      {/* POSTS */}

      <div className="explore-section">

        <div className="section-title">

          {
            searchText
              ? "Search Results"
              : "Latest Posts"
          }

        </div>

        <div className="posts-grid">

          {filteredPosts.length > 0 ? (

            filteredPosts.map((post) => (

              <div className="post-card" key={post._id}>

                <div className="post-top">

                  <img
                    src={
                      post.profilePhoto ||
                      "https://i.ibb.co/4pDNDk1/avatar.png"
                    }
                    alt=""
                  />

                  <div>

                    <h4>{post.name}</h4>

                    <p>@{post.username}</p>

                  </div>

                </div>

                <div className="post-body">

                  <p>{post.postBody}</p>

                  {post.postImage && (
                    <img src={post.postImage} alt="" />
                  )}

                </div>

              </div>

            ))

          ) : (

            <div className="no-results">

              <img
                src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png"
                alt=""
              />

              <h3>No Results Found</h3>

              <p>Try searching something else</p>

            </div>

          )}

        </div>

      </div>

      {/* IMAGE GRID */}

      {filteredImages.length > 0 && (

        <div className="explore-section">

          <div className="section-title">
            Explore Images
          </div>

          <div className="image-grid">

            {filteredImages.map((post) => (

              <img
                key={post._id}
                src={post.postImage}
                alt=""
              />

            ))}

          </div>

        </div>

      )}

    </div>

  );

};

export default Explore;