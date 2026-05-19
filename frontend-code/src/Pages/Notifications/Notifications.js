// import "../Page.css"
// const Notifications = () =>{
//     return (
//         <div className="page">
//            <h2 className="page_title">Welcome to Notifications</h2>
//         </div>
//     )
// }

// export default Notifications




import React, { useEffect, useState } from "react";
// import useLoggedInUser from "../../hooks/useLoggedInUser";

import "./Notifications.css";
import { useLoggedInUser } from "../../context/LoggedInUserContex";

const Notifications = () => {

  const [notifications,setNotifications] = useState([]);

  // const [loggedInUser] = useLoggedInUser();

    const { loggedInUser } = useLoggedInUser();

  const getNotifications = async()=>{

    try{

      const res = await fetch(
        `${process.env.REACT_APP_BASE_URL}/user/notifications/${loggedInUser?._id}`
      );

      const data = await res.json();

      setNotifications(data.notifications);

    }catch(error){

      console.log(error);

    }

  }

  useEffect(()=>{

    if(loggedInUser?._id){
      getNotifications();
    }

  },[loggedInUser]);

  return (

    <div className="notifications">

      <h2>Notifications</h2>

      {
        notifications.map((item)=>(

          <div className="notification-card" key={item._id}>

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