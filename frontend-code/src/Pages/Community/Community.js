

import React, { useEffect, useState } from "react";
import UserCard from "./UserCard";
import "./social.css";
import { useLoggedInUser } from "../../context/LoggedInUserContex";
// import useLoggedInUser from "../../hooks/useLoggedInUser";

const SocialDashboard = () => {
  const [tab, setTab] = useState("followers");
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  // const [loggedInUser] = useLoggedInUser();

    const { loggedInUser } = useLoggedInUser();
  const userId = loggedInUser?._id;
  const userEmail = loggedInUser?.email;


  const getFollowers = async () => {
    const res = await fetch(`${process.env.REACT_APP_BASE_URL}/follow/get-followers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    const data = await res.json();

    const formatted = data.followers.map((f) => ({
      id: f.followerUserId._id,
      name: f.followerUserId.name,
      username: f.followerUserId.username,
      avatar: f.followerUserId.profilePhoto,
      bio: "No bio available",
      isFollowing: false,
    }));

    setUsers(formatted);
  };

  // 🔹 FETCH FOLLOWING
  const getFollowing = async () => {
    const res = await fetch(`${process.env.REACT_APP_BASE_URL}/follow/get-followings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    const data = await res.json();

    const formatted = data.following.map((f) => ({
      id: f.followingUserId._id,
      name: f.followingUserId.name,
      username: f.followingUserId.username,
      avatar: f.followingUserId.profilePhoto,
      bio: "No bio available",
      isFollowing: true,
    }));

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

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        followerUserEmail: userEmail,
        followingUserEmail: user.username + "@gmail.com", 
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

  
  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="social-container">
     
      <div className="social-header">
        <div>
          <h2>Social Network</h2>
          {/* <p>Manage your connections and discover new people.</p> */}
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
