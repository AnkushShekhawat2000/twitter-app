// import React, { useState } from "react";
// import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

// import { Link, useNavigate } from "react-router-dom";
// import GoogleButton from "react-google-button";
// import twitterImg from "../../image/twitter.jpeg";
// import TwitterIcon from "@mui/icons-material/Twitter";
// import { useUserauth } from "../../context/UserAuthContext";
// import "./LandingPage.css";
// import auth from "../../firebase.init";


// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const navigate = useNavigate();
//   const { login } = useUserauth();


//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");


//     try {
//       const res = await fetch(`${process.env.REACT_APP_BASE_URL}/auth/login`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.message || "Login failed");
//       }

//       console.log("Backend login success:", data);

//       await login(email, password);

//       navigate("/");
//     } catch (err) {
//       console.log(err.message);
//       setError(err.message);
//       alert(err.message);
//     }
//   };

//   // const handleGoogleSignIn = async (e) => {
//   //   e.preventDefault();

//   //   const provider = new GoogleAuthProvider();

//   //   try {
      
//   //     const result = await signInWithPopup(auth, provider);
//   //     const user = result.user;

   
//   //     const res = await fetch(`${process.env.REACT_APP_BASE_URL}/auth/google-login`, {
//   //       method: "POST",
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //       },
//   //       body: JSON.stringify({
//   //         name: user.displayName,
//   //         email: user.email,
//   //         profilePhoto: user.photoURL,
//   //       }),
//   //     });

//   //     const data = await res.json();

//   //     if (!res.ok) {
//   //       throw new Error(data.message || "Google login failed");
//   //     }

//   //     console.log("Google backend user:", data);
//   //     navigate("/");
//   //   } catch (error) {
//   //     console.log("Google Login Error:", error.message);
//   //     alert(error.message);
//   //   }
//   // };


  
// const handleGoogleSignIn = async (e) => {
//   e.preventDefault();

//   try {
//     const provider = new GoogleAuthProvider();

//     const result = await signInWithPopup(auth, provider);
//     const firebaseUser = result.user;

//     // Firebase se ID token lo
//     const idToken = await firebaseUser.getIdToken();

//     // Token backend ko bhejo
//     const response = await fetch(
//       `${process.env.REACT_APP_BASE_URL}/auth/google-login`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ idToken }),
//       }
//     );

//     const data = await response.json();

//     if (!response.ok || !data.success) {
//       throw new Error(data.message || "Google login failed");
//     }

//     // App ka JWT save karo
//     localStorage.setItem("token", data.token);
//     localStorage.setItem("user", JSON.stringify(data.user));

//     console.log("Logged-in user:", data.user);

//     navigate("/");
//   } catch (error) {
//     console.error("Google login error:", error);
//     alert(error.message || "Something went wrong");
//   }
// };

//   return (
//     <>
//       <div className="login-container">
//         <div className="image-container">
//           <img className=" image" src={twitterImg} alt="twitterImage" />
//         </div>

//         <div className="form-container">
//           <div className="form-box">
//             <TwitterIcon style={{ color: "skyblue" }} />
//             <h2 className="heading">Happening now</h2>

//             <form onSubmit={handleSubmit}>
//               <input
//                 type="email"
//                 className="email"
//                 placeholder="Email address"
//                 onChange={(e) => setEmail(e.target.value)}
//               />

//               <input
//                 className="password"
//                 type="password"
//                 placeholder="Password"
//                 onChange={(e) => setPassword(e.target.value)}
//               />

//               <div className="btn-login">
//                 <button type="submit" className="btn">
//                   Log In
//                 </button>
//               </div>
//             </form>
//             <hr />
//             <div className="google-button">
//               <GoogleButton
//                 className="g-btn"
//                 type="light"
//                 onClick={handleGoogleSignIn}
//               />
//             </div>
//           </div>
//           <div>
//             Don't have an account?
//             <Link
//               to="/signup"
//               style={{
//                 textDecoration: "none",
//                 color: "var(--twitter-color)",
//                 fontWeight: "600",
//                 marginLeft: "5px",
//               }}
//             >
//               Sign up
//             </Link>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Login;






import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import GoogleButton from "react-google-button";
import TwitterIcon from "@mui/icons-material/Twitter";
import { toast } from "react-toastify";

import twitterImg from "../../image/twitter.jpeg";
import { useUserauth } from "../../context/UserAuthContext";
import auth from "../../firebase.init";
import "./LandingPage.css";

const API_URL = process.env.REACT_APP_BASE_URL;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  

  const navigate = useNavigate();
  const { login, setAuthSession } = useUserauth();


  
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!email.trim() || !password) {
    toast.error("Please enter email and password");
    return;
  }

  try {
    setLoading(true);

    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.token) {
      throw new Error(data.message || "Login failed");
    }

    localStorage.setItem("token", data.token);

    localStorage.setItem("user", JSON.stringify(data.user));

    toast.success(data.message || "Login successful");

    navigate("/home", { replace: true });

  } catch (error) {
    toast.error(error.message || "Unable to login");
  } finally {
    setLoading(false);
  }
};



  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const response = await fetch(`${API_URL}/auth/google-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.token) {
        throw new Error(data.message || "Google login failed");
      }

      setAuthSession({
        token: data.token,
        user: data.user,
      });

      toast.success(data.message || "Google login successful");
      navigate("/home", { replace: true });
    } catch (error) {
      console.error("Google login error:", error);
      toast.error(error.message || "Google login failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="image-container">
        <img className="image" src={twitterImg} alt="Twitter" />
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <input
              className="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            <div className="btn-login">
              <button
                type="submit"
                className="btn"
                disabled={loading || googleLoading}
              >
                {loading ? "Logging in..." : "Log In"}
              </button>
            </div>
          </form>

          <hr />

          <div className="google-button">
            <GoogleButton
              className="g-btn"
              type="light"
              label={
                googleLoading
                  ? "Signing in..."
                  : "Sign in with Google"
              }
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
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
  );
};

export default Login;
