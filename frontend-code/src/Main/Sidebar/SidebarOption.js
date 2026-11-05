import React from "react";
import "./SidebarOptions.css";

function SidebarOptions({ active, text, Icon, onClick, badge }) {
  return (
    <div className={`sidebarOptions ${active && "sidebarOptions--active"}`} onClick={onClick}>
      <Icon />
      <h2>{text}</h2>
      {Number(badge) > 0 && <span className="sidebarOptions-badge">{badge > 99 ? "99+" : badge}</span>}
    </div>
  );
}

export default SidebarOptions;