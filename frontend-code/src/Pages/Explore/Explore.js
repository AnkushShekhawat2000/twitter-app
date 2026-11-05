

import React, { useEffect, useState } from "react";
import { useLoggedInUser } from "../../context/LoggedInUserContex";
import { authFetch } from "../../utils/authfetch";

import "./Explore.css";

const Explore = () => {

  const [data, setData] = useState({
    latestPosts: [],
    trendingPosts: [],
    imagePosts: [],
    users: [],
  });

  const [search, setSearch] = useState("");

  

    const { loggedInUser } = useLoggedInUser();



  const getExploreData = async () => {

    try {

      const res = await authFetch(
        "/post/explore-posts",
        {
          method: "POST",
          body: JSON.stringify({}),
        }
      );

      const result = await res.json();
      let trendingPosts = result.trendingPosts || [];
      try {
        const trendingResponse = await fetch(`${process.env.REACT_APP_BASE_URL}/discover/trending-posts`);
        const trendingData = await trendingResponse.json();
        if (Array.isArray(trendingData.posts) && trendingData.posts.length) {
          trendingPosts = trendingData.posts;
        }
      } catch (error) {
        console.log("Trending API fallback:", error);
      }


      const suggestedUsers = (result.users || []).filter(

        (user) =>

          user._id !== loggedInUser?._id &&
          !user.isFollowing

      );

      setData({
        latestPosts: result.latestPosts || [],
        trendingPosts,
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

  

  const searchText = search.trim().toLowerCase();


  const filteredPosts = data.latestPosts.filter((post) => {

    if (!searchText) return true;

    return (

      post.name?.toLowerCase().includes(searchText) ||
      post.username?.toLowerCase().includes(searchText) ||
      post.postBody?.toLowerCase().includes(searchText)

    );

  });


  const filteredTrending = data.trendingPosts.filter((post) => {

    if (!searchText) return true;

    return (

      post.name?.toLowerCase().includes(searchText) ||
      post.username?.toLowerCase().includes(searchText) ||
      post.postBody?.toLowerCase().includes(searchText)

    );

  });


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

      const res = await authFetch(user.isFollowing ? "/follow/unfollow-user" : "/follow/follow-user", {
        method: "POST",
        body: JSON.stringify({
          followingUserId: user._id,
        }),
      });

      if (res.ok) {

        

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