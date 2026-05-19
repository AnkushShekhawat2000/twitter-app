import { useState } from "react";
import { Avatar, Button } from "@mui/material";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import axios from "axios";
import "./TweetBox.css";
import { useUserauth } from "../../../context/UserAuthContext";
import { useLoggedInUser } from "../../../context/LoggedInUserContex";
import { useNavigate } from "react-router-dom";
// import useLoggedInUser from "../../../hooks/useLoggedInUser";


const TweetBox = ({ fetchPost }) => {
  const navigate = useNavigate();
  const [post, setPost] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [isLoading, setIsLoading] = useState("");
  const { user } = useUserauth();
  // const [loggedInUser] = useLoggedInUser();
  const { loggedInUser } = useLoggedInUser();
  const email = user?.email;
  const userId = loggedInUser?._id;
  const userProfilepic = loggedInUser?.profilePhoto
    ? loggedInUser.profilePhoto
    : user && user.photoURL;




  function handleUploadImage(e) {
       if (!loggedInUser) {

      navigate("/login");

      return;
   }

    setIsLoading(true);
    const image = e.target.files[0];
    const formData = new FormData();
    formData.set("image", image);
    axios
      .post(
        `https://api.imgbb.com/1/upload?key=22741e46a20f61109c000473abeaac5b`,
        formData,
      )
      .then((res) => {
        setImageURL(res.data.data.display_url);
        console.log(res.data.data.display_url);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  }


  const handleTweet = async (e) => {
    e.preventDefault();

     if (!loggedInUser) {

      navigate("/login");

      return;
   }

    let finalName;
    let finalUsername;

    if (user?.providerData[0]?.providerId === "password") {
      const res = await fetch(
        `${process.env.REACT_APP_BASE_URL}/auth/loggedInUser?email=${email}`,
      );
      const data = await res.json();

      finalName = data.name;
      finalUsername = data.username;
    } else {
      finalName = user?.displayName;
      finalUsername = email.split("@")[0];
    }

    const userPost = {
      profilePhoto: userProfilepic,
      postBody: post,
      postImage: imageURL,
      username: finalUsername,
      name: finalName,
      email: email,
      userId
    };

    const res = await fetch(
      `${process.env.REACT_APP_BASE_URL}/post/create-post`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(userPost),
      },
    );

    const data = await res.json();

    console.log("Post created", data);

    fetchPost();

    setPost("");
    setImageURL("");
  };

  return (
    <div className="tweetBox">
      <form onSubmit={handleTweet}>
        <div className="tweetBox-input">
          <Avatar
            src={
              loggedInUser?.profilePhoto
                ? loggedInUser.profilePhoto
                : user && user.photoURL
            }
          />
          <input
            type="text"
            placeholder="What's happening?"
            onChange={(e) => setPost(e.target.value)}
            value={post}
            required
            //  disabled={!loggedInUser}
  onClick={() => {
    if (!loggedInUser) {
      navigate("/login");
    }
  }}
          />
        </div>
        <div className="imageIcon-tweetButton">
          <label htmlFor="image" className="imageIcon">
            {isLoading ? (
              <p>Uploading Image</p>
            ) : (
              <p>
                {imageURL ? (
                  "image uploaded"
                ) : (
                  <AddPhotoAlternateOutlinedIcon />
                )}
              </p>
            )}
          </label>
          <input
            type="file"
            id="image"
            className="imageInput"
            onChange={handleUploadImage}
            disabled={!loggedInUser}
            onClick={() => {
            if (!loggedInUser) {
              navigate("/login");
              return;
            }
          }}
          />
          <Button className="tweetBox-tweetButton" type="submit" >
            Tweet
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TweetBox;
