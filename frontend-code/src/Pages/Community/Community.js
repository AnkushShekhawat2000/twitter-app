

import React, { useEffect, useState } from "react";
import UserCard from "./UserCard";
import "./social.css";
import { useLoggedInUser } from "../../context/LoggedInUserContex";
import { authFetch } from "../../utils/authfetch";


const SocialDashboard = () => {
  const [tab, setTab] = useState("followers");
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");


    const { loggedInUser } = useLoggedInUser();
    const userId = loggedInUser?._id;


  const getFollowers = async () => {
    const res = await authFetch("/follow/get-followers", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const data = await res.json();

    const formatted = data && Array.isArray(data.followers) ? data.followers.map((f) => ({
      id: f.followerUserId?._id,
      name: f.followerUserId?.name,
      username: f.followerUserId?.username,
      avatar: f.followerUserId?.profilePhoto,
      bio: "No bio available",
      isFollowing: f.isFollowing,
      followersCount: f.followerUserId?.followersCount || 0,
      followingCount: f.followerUserId?.followingCount || 0,
      mutualFriends: f.mutualFriends || 0,
    })) : [];

    setUsers(formatted);
  };

  // 🔹 FETCH FOLLOWING
  const getFollowing = async () => {
    const res = await authFetch("/follow/get-followings", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const data = await res.json();

    const formatted = data && Array.isArray(data.following) ? data.following.map((f) => ({
      id: f.followingUserId?._id,
      name: f.followingUserId?.name,
      username: f.followingUserId?.username,
      avatar: f.followingUserId?.profilePhoto,
      bio: "No bio available",
      isFollowing: true,
      mutualFriends: f.mutualFriends || 0,
    })) : [];

    setUsers(formatted);
  };

  useEffect(() => {
    if (!userId) return;

    tab === "followers" ? getFollowers() : getFollowing();
  }, [tab, userId]);


  const toggleFollow = async (user) => {
    console.log("user-->", user);
    const url = user.isFollowing
      ? `${process.env.REACT_APP_BASE_URL}/follow/unfollow-user`
      : `${process.env.REACT_APP_BASE_URL}/follow/follow-user`;

    const res = await authFetch(url.replace(process.env.REACT_APP_BASE_URL, ""), {
      method: "POST",
      body: JSON.stringify({
        followingUserId: user.id,
      }),
    });

    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, isFollowing: !u.isFollowing } : u,
        ),
      );
    }
  };

  
  const filtered = users &&  users.filter(
    (u) =>
      u?.name?.toLowerCase()?.includes(search.toLowerCase()) ||
      u?.username?.toLowerCase()?.includes(search.toLowerCase()),
  );

  return (
    <div className="social-container">
     
      <div className="social-header">
        <div>
          <h2>Social Network</h2>
        </div>

        <div className="flex-head">
        

          <div className="tabs">
            <button
              className={tab === "followers" ? "tab active" : "tab"}
              onClick={() => setTab("followers")}
            >
              Followers
            </button>
            <button
              className={tab === "following" ? "tab active" : "tab"}
              onClick={() => setTab("following")}
            >
              Following
            </button>
            
          </div>
            <input
            className="search-input"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

  
      <div className="grid">
        {filtered.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onToggleFollow={() => toggleFollow(user)}
          />
        ))}
      </div>
    </div>
  );
};

export default SocialDashboard;
