import React from "react";
import "../Page.css";
import Mainprofile from "./Mainprofile/MainProfile";
import { useUserauth } from "../../context/UserAuthContext"
const Profile = () => {
  const { user } = useUserauth();

  return (
    <div className="profilePage">
      <Mainprofile user={user} />
    </div>
  );
};

export default Profile;