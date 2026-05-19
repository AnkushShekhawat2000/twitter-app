import React from "react";
import "./card.css";

const UserCard = ({ user, onToggleFollow }) => {
  return (
    <div className="card">
      <div className="card-header">
        <div className="user-info">
          <div className="avatar-wrapper">
            <img src={user.avatar} className="avatar-frame" />
            <span className="online-dot"></span>
          </div>

          <div>
            <div className="name">{user.name}</div>
            <div className="username">@{user.username}</div>
          </div>
        </div>

        <div className="menu">⋮</div>
      </div>

      <div className="bio">{user.bio}</div>

      <div className="stats">
        <div className="stat">
          <p>{user.followersCount}</p>
          <span>FOLLOWERS</span>
        </div>
        <div className="stat">
          <p>{user.followingCount}</p>
          <span>FOLLOWING</span>
        </div>
        <div className="stat">
          <p>{user.mutualFriends || 0}</p>
          <span>MUTUAL</span>
        </div>
      </div>

      <div className="actions">
        <button
          className={`btn ${user.isFollowing ? "following" : "follow"}`}
          onClick={() => onToggleFollow(user.id)}
        >
          {user.isFollowing ? "Following" : "Follow"}
        </button>

        <button className="message-btn">💬</button>
      </div>
    </div>
  );
};

export default UserCard;
