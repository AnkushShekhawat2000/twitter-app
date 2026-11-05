

import React, { useEffect, useState } from "react";


import "./Notifications.css";
import { useLoggedInUser } from "../../context/LoggedInUserContex";
import { authFetch } from "../../utils/authfetch";
import { io } from "socket.io-client";

const Notifications = () => {

  const [notifications,setNotifications] = useState([]);
  const unreadCount = notifications.filter((item) => !item.isRead).length;

  

    const { loggedInUser } = useLoggedInUser();

  const getNotifications = async()=>{

    try{

      const res = await authFetch(`/user/notifications/${loggedInUser?._id}`);

      const data = await res.json();

      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);

    }catch(error){

      console.log(error);

    }

  }

  useEffect(()=>{

    if(loggedInUser?._id){
      getNotifications();
    }

  },[loggedInUser]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !loggedInUser?._id) return undefined;
    const socket = io(process.env.REACT_APP_BASE_URL, { auth: { token } });
    socket.on("notification:new", (notification) => {
      setNotifications((current) => [{ ...notification, _id: notification._id || Date.now().toString() }, ...current]);
    });
    return () => socket.disconnect();
  }, [loggedInUser]);

  const markAllRead = async () => {
    await authFetch("/user/notifications/read", { method: "PATCH" });
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
    window.dispatchEvent(new Event("notifications:read-all"));
  };

  return (

    <div className="notifications">

      <div className="notifications-header">
        <h2>Notifications {unreadCount > 0 && `(${unreadCount})`}</h2>
        <button
          type="button"
          className="notifications-mark-read"
          onClick={markAllRead}
          disabled={unreadCount === 0}
        >
          Mark all as read
        </button>
      </div>

      {
        notifications.map((item)=>(

          <div className={`notification-card${item.isRead ? "" : " unread"}`} key={item._id}>

            <img
              src={item.senderProfile}
              alt=""
              width="45"
            />

            <div>
              <p>{item.text}</p>
            </div>

          </div>

        ))
      }

    </div>

  );

}

export default Notifications;