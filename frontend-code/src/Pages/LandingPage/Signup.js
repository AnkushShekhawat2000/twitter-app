import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import twitterimg from "../../image/twitter.jpeg";
import TwitterIcon from "@mui/icons-material/Twitter";
import GoogleButton from "react-google-button";
import { useUserauth } from "../../context/UserAuthContext";

import "./LandingPage.css";

import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import auth from "../../firebase.init";


const Signup = () => {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const { signin } = useUserauth();

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signin(email, password);

      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          username,
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }else{

        navigate("/");
      }

    } catch (err) {
      setError(err.message);
      alert(err.message);
    }
  };

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();

    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const res = await fetch(`${process.env.REACT_APP_BASE_URL}/auth/google-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: user.displayName,
          email: user?.email,
          profilePhoto: user?.photoURL,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        console.log("Backend success:", data);
        navigate("/");
      } else {
        console.log("Backend error:", data.message);
        alert(data.message || "Google login failed");
      }
    } catch (error) {
      console.log("Google Auth Error:", error.message);
      alert("Google login failed");
    }
  };

  return (
    <>
      <div className="login-container">
        <div className="image-container">
          <img className="image" src={twitterimg} alt="twitterImage" />
        </div>

        <div className="form-container">
          <div className="form-box">
            <TwitterIcon className="Twittericon" style={{ color: "skyblue" }} />

            <h2 className="heading">Happening now</h2>
            <h3 className="heading1">Join twitter today</h3>

            <div class="d-flex align-items-sm-center">
              <h3 className="heading1"> Join twitter today </h3>
            </div>

            <form onSubmit={handleSubmit}>
              <input
                className="display-name"
                style={{ backgroudColor: "red" }}
                type="username"
                placeholder="@username "
                onChange={(e) => setUsername(e.target.value)}
              />

              <input
                className="display-name"
                style={{ backgroudColor: "red" }}
                type="name"
                placeholder="Enter Full Name"
                onChange={(e) => setName(e.target.value)}
              />

              <input
                className="email"
                type="email"
                placeholder="Email address"
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                className="password"
                type="password"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
              />

              <div className="btn-login">
                <button type="submit" className="btn">
                  Sign Up
                </button>
              </div>
            </form>
            <hr />
            <div className="google-button">
              <GoogleButton
                className="g-btn"
                type="light"
                onClick={handleGoogleSignIn}
              />
            </div>
            <div>
              Already have an account?
              <Link
                to="/login"
                style={{
                  textDecoration: "none",
                  color: "var(--twitter-color)",
                  fontWeight: "600",
                  marginLeft: "5px",
                }}
              >
                Log In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
