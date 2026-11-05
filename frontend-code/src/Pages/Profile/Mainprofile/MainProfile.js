import React, { useState, useEffect } from "react";
import Post from "../Posts/posts"
import { useNavigate } from "react-router-dom";
import "./Mainprofile.css";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CenterFocusWeakIcon from "@mui/icons-material/CenterFocusWeak";
import LockResetIcon from "@mui/icons-material/LockReset";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import AddLinkIcon from "@mui/icons-material/AddLink";
import Editprofile from "../Editprofile/Editprofile";
import axios from "axios";
// import useLoggedinuser from "../../../hooks/useLoggedInUser"
import { useLoggedInUser } from "../../../context/LoggedInUserContex";
import { authFetch } from "../../../utils/authfetch";



const Mainprofile = ({ user }) => {
 
 console.log("in main profile", user);
  const navigate = useNavigate();
  const [isloading, setisloading] = useState(false);
  // const [loggedInUser] = useLoggedinuser();

    const { loggedInUser } = useLoggedInUser();

  const username = user?.email?.split("@")[0];
  const [post, setpost] = useState([]);

  const [ loggedinuser, setProfileUser] = useState(null);

  useEffect(() => {
  if (loggedInUser) {
    setProfileUser(loggedInUser);
  }
}, [loggedInUser]);


  useEffect(() => {
    authFetch("/post/userpost")
      .then((res) => res.json())
      .then((data) => {
        setpost(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setpost([]);
      });
  }, []);




  const handleuploadcoverimage = (e) => {
    setisloading(true);
    const image = e.target.files[0];
    //console.log(image)
    const formData = new FormData();
    formData.set("image", image);
    axios
      .post(
        `https://api.imgbb.com/1/upload?key=22741e46a20f61109c000473abeaac5b`,
        formData
      )
      .then((res) => {
        const url = res.data.data.display_url;
        console.log("hosted image link",res.data.data.display_url);
        const usercoverimage = {
          email: user?.email,
          profileCoverImage: url,
        };
        setisloading(false);

        if (url) {
          authFetch(`/user/userupdate/${user?.email}`, {
            method: "PATCH",
            body: JSON.stringify(usercoverimage),
          })
            .then((res) => res.json())
            .then((data) => {
              console.log("done", data);
                setProfileUser(prev => ({
    ...prev,
    profileCoverImage: url,
  }));
            });
        }
             window.alert("cover Image updated successfully");
      })
      .catch((e) => {
        console.log(e);
        window.alert(e);
        setisloading(false);
      });
  };

  const handleuploadprofileimage = (e) => {
    setisloading(true);
    const image = e.target.files[0];
    console.log("profileImage->", image)
    const formData = new FormData();
    formData.set("image", image);
    axios
      .post(
        "https://api.imgbb.com/1/upload?key=22741e46a20f61109c000473abeaac5b",
        formData
      )
      .then((res) => {
        const url = res.data.data.display_url;
        console.log("profile image hosted link", res.data.data.display_url);
        const userprofileimage = {
          email: user?.email,
          profilePhoto: url,
        };
        setisloading(false);
        if (url) {
          authFetch(`/user/userupdate/${user?.email}`, {
            method: "PATCH",
            body: JSON.stringify(userprofileimage),
          })
            .then((res) => res.json())
            .then((data) => {
              console.log("done", data);
                setProfileUser(prev => ({
    ...prev,
    profilePhoto: url,
  }));
            });

            window.alert("profile updated successfully");
        }
      })
      .catch((e) => {
        console.log(e);
        window.alert(e);
        setisloading(false);
      });
  };
 
  return (
    <div>
    <ArrowBackIcon className="arrow-icon" onClick={() => navigate("/")} />
    <h4 className="heading-4">{username}</h4>
    <div className="mainprofile">
      <div className="profile-bio">
        {
          <div>
            <div className="coverImageContainer">
              <img
                 src={
                    loggedinuser?.profileCoverImage      
                 }
              
                alt=""
                className="coverImage"
              />
             
              <div className="hoverCoverImage">
                <div className="imageIcon_tweetButton">
                  <label htmlFor="image" className="imageIcon">
                    {isloading ? (
                      <LockResetIcon className="photoIcon photoIcon2  photoIconDisabled" />
                    ) : (
                      <CenterFocusWeakIcon className="photoIcon photoIcon2" />
                    )}
                  </label>
                  <input
                    type="file"
                    id="image"
                    className="imageInput"
                    onChange={handleuploadcoverimage}
                  />
                </div> 
              </div>
            </div>
            <div className="avatar-img">
              <div className="avatarContainer">
                <img
                  src={
                     loggedinuser?.profilePhoto
                  }
                 
                  alt=""
                  className="avatar"
                />
               
                <div className="hoverAvatarImage">
                  <div className="imageIcon_tweetButton">
                    <label htmlFor="profileImage" className="imageIcon ">
                      {isloading ? (
                        <LockResetIcon className="photoIcon photoIconDisabled" />
                      ) : (
                        <CenterFocusWeakIcon className="photoIcon " />
                      )}
                    </label>
                    <input
                      type="file"
                      id="profileImage"
                      className="imageInput"
                      onChange={handleuploadprofileimage}
                    />
                  </div>
                </div>
              </div>
              <div className="userInfo">
                <div>
                  <h3 className="heading-3">
                    { loggedinuser?.name ?
                         loggedinuser.name : user && user.name
                      }
                  </h3>
                  <p className="usernameSection">@{username}</p>
                </div>
                <Editprofile user={user} profileUser={loggedInUser} setProfileUser={setProfileUser} />
              </div>
              <div className="infoContainer">
                {loggedinuser?.bio ? <p>{loggedinuser.bio}</p> : ""}
                <div className="locationAndLink">
                  {loggedinuser?.location ? (
                    <p className="suvInfo  loc">
                      <MyLocationIcon /> {loggedinuser.location}
                    </p>
                  ) : (
                    ""
                  )}
                  {loggedinuser?.website ? (
                    <p className="subInfo link">
                      <AddLinkIcon /> {loggedinuser.website}
                    </p>
                  ) : (
                    ""
                  )}
                </div>
              </div>
              <h4 className="tweetsText">Tweets</h4>
              <hr />
            </div>
            
            { post && (
                
                <div class="post-container">
                 { post.map((p) => (
                     <Post p={p} />
                  ))}
                </div>
               
              ) 
               
            }
           
          </div>
        }
      </div>
    </div>
    </div>
  );
};

export default Mainprofile;