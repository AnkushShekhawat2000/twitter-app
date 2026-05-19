import React, { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

import { Link, useNavigate } from "react-router-dom";
import GoogleButton from "react-google-button";
import twitterImg from "../../image/twitter.jpeg";
import TwitterIcon from "@mui/icons-material/Twitter";
import { useUserauth } from "../../context/UserAuthContext";
import "./LandingPage.css";
import auth from "../../firebase.init";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useUserauth();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");


    try {
      const res = await fetch(`${process.env.REACT_APP_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      console.log("Backend login success:", data);

      await login(email, password);

      navigate("/");
    } catch (err) {
      console.log(err.message);
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
          email: user.email,
          profilePhoto: user.photoURL,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Google login failed");
      }

      console.log("Google backend user:", data);
      navigate("/");
    } catch (error) {
      console.log("Google Login Error:", error.message);
      alert(error.message);
    }
  };

  return (
    <>
      <div className="login-container">
        <div className="image-container">
          <img className=" image" src={twitterImg} alt="twitterImage" />
        </div>

        <div className="form-container">
          <div className="form-box">
            <TwitterIcon style={{ color: "skyblue" }} />
            <h2 className="heading">Happening now</h2>

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                className="email"
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
                  Log In
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
          </div>
          <div>
            Don't have an account?
            <Link
              to="/signup"
              style={{
                textDecoration: "none",
                color: "var(--twitter-color)",
                fontWeight: "600",
                marginLeft: "5px",
              }}
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
