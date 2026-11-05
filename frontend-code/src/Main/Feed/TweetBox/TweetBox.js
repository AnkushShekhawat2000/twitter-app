
import { Avatar, Button } from "@mui/material";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import axios from "axios";
import "./TweetBox.css";

import { useUserauth } from "../../../context/UserAuthContext";
import { useLoggedInUser } from "../../../context/LoggedInUserContex";
import { useNavigate } from "react-router-dom";

import { useState } from "react";
import { toast } from "react-toastify";

const TweetBox = ({ fetchPost }) => {
  const navigate = useNavigate();

  const [post, setPost] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const { user, token } = useUserauth();

  console.log(token,"-----,,,,")
  const { loggedInUser } = useLoggedInUser();

  const API_URL = process.env.REACT_APP_BASE_URL;

  const handleUploadImage = async (e) => {
    const image = e.target.files?.[0];

    if (!image) return;

    if (!token || !loggedInUser) {
      navigate("/login");
      return;
    }

    if (!image.type.startsWith("image/")) {
      toast.error("Please select a valid image.");
      e.target.value = "";
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", image);

      const response = await axios.post(
        "https://api.imgbb.com/1/upload?key=22741e46a20f61109c000473abeaac5b",
        formData
      );

      const uploadedURL = response.data?.data?.display_url;

      if (!uploadedURL) {
        throw new Error("Image upload failed.");
      }

      setImageURL(uploadedURL);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error(
        error.response?.data?.error?.message ||
          error.message ||
          "Unable to upload image."
      );
    } finally {
      setIsLoading(false);
      e.target.value = "";
    }
  };

  const handleTweet = async (e) => {
    e.preventDefault();

    if (!token || !loggedInUser) {
      navigate("/login");
      return;
    }

    if (!post.trim() && !imageURL) {
      toast.error("Please write something or upload an image.");
      return;
    }

    if (isLoading || isPosting) {
      return;
    }

    setIsPosting(true);

    try {
      const response = await fetch(`${API_URL}/post/create-post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({
          postBody: post.trim(),
          postImage: imageURL || null,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to create post.");
      }

      setPost("");
      setImageURL("");

      toast.success(data.message || "Tweet posted successfully!");

      if (fetchPost) {
        await fetchPost();
      }
    } catch (error) {
      console.error("Create post error:", error);
      toast.error(error.message || "Something went wrong.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="tweetBox">
      <form onSubmit={handleTweet}>
        <div className="tweetBox-input">
          <Avatar
            src={
              loggedInUser?.profilePhoto ||
              user?.photoURL ||
              ""
            }
          />

          <input
            type="text"
            placeholder="What's happening?"
            onChange={(e) => setPost(e.target.value)}
            value={post}
            required={!imageURL}
            disabled={isPosting}
            onClick={() => {
              if (!token || !loggedInUser) {
                navigate("/login");
              }
            }}
          />
        </div>

        <div className="imageIcon-tweetButton">
          <label htmlFor="image" className="imageIcon">
            {isLoading ? (
              <p>Uploading Image...</p>
            ) : imageURL ? (
              <p>Image uploaded</p>
            ) : (
              <AddPhotoAlternateOutlinedIcon />
            )}
          </label>

          <input
            type="file"
            id="image"
            className="imageInput"
            accept="image/*"
            onChange={handleUploadImage}
            disabled={isLoading || isPosting || !token}
            onClick={(e) => {
              if (!token || !loggedInUser) {
                e.preventDefault();
                navigate("/login");
              }
            }}
          />

          <Button
            className="tweetBox-tweetButton"
            type="submit"
            disabled={isPosting || isLoading}
          >
            {isPosting ? "Posting..." : "Tweet"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TweetBox;
