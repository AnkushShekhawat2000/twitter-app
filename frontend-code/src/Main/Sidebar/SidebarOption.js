import React from "react";
import "./SidebarOptions.css";

function SidebarOptions({ active, text, Icon, onClick }) {
  return (
    <div className={`sidebarOptions ${active && "sidebarOptions--active"}`} onClick={onClick}>
      <Icon />
      <h2>{text}</h2>
    </div>
  );
}

export default SidebarOptions;