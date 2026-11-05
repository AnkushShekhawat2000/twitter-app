// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import twitterimg from "../../image/twitter.jpeg";
// import TwitterIcon from "@mui/icons-material/Twitter";
// import GoogleButton from "react-google-button";
// import { useUserauth } from "../../context/UserAuthContext";

// import "./LandingPage.css";

// import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
// import auth from "../../firebase.init";


// const Signup = () => {
//   const [username, setUsername] = useState("");
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [error, setError] = useState("");
//   const [password, setPassword] = useState("");
//   const { signin } = useUserauth();

//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     try {
//       await signin(email, password);

//       const response = await fetch(`${process.env.REACT_APP_BASE_URL}/auth/register`, {
//         method: "POST",
//         headers: {
//           "content-type": "application/json",
//         },
//         body: JSON.stringify({
//           username,
//           name,
//           email,
//           password,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message);
//       }else{

//         navigate("/");
//       }

//     } catch (err) {
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
//   //         email: user?.email,
//   //         profilePhoto: user?.photoURL,
//   //       }),
//   //     });

//   //     const data = await res.json();

//   //     if (res.ok) {
//   //       console.log("Backend success:", data);
//   //       navigate("/");
//   //     } else {
//   //       console.log("Backend error:", data.message);
//   //       alert(data.message || "Google login failed");
//   //     }
//   //   } catch (error) {
//   //     console.log("Google Auth Error:", error.message);
//   //     alert("Google login failed");
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
//           <img className="image" src={twitterimg} alt="twitterImage" />
//         </div>

//         <div className="form-container">
//           <div className="form-box">
//             <TwitterIcon className="Twittericon" style={{ color: "skyblue" }} />

//             <h2 className="heading">Happening now</h2>
//             <h3 className="heading1">Join twitter today</h3>

//             <div class="d-flex align-items-sm-center">
//               <h3 className="heading1"> Join twitter today </h3>
//             </div>

//             <form onSubmit={handleSubmit}>
//               <input
//                 className="display-name"
//                 style={{ backgroudColor: "red" }}
//                 type="username"
//                 placeholder="@username "
//                 onChange={(e) => setUsername(e.target.value)}
//               />

//               <input
//                 className="display-name"
//                 style={{ backgroudColor: "red" }}
//                 type="name"
//                 placeholder="Enter Full Name"
//                 onChange={(e) => setName(e.target.value)}
//               />

//               <input
//                 className="email"
//                 type="email"
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
//                   Sign Up
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
//             <div>
//               Already have an account?
//               <Link
//                 to="/login"
//                 style={{
//                   textDecoration: "none",
//                   color: "var(--twitter-color)",
//                   fontWeight: "600",
//                   marginLeft: "5px",
//                 }}
//               >
//                 Log In
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Signup;











import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import TwitterIcon from "@mui/icons-material/Twitter";
import GoogleButton from "react-google-button";
import { toast } from "react-toastify";

import twitterimg from "../../image/twitter.jpeg";
import { useUserauth } from "../../context/UserAuthContext";
import auth from "../../firebase.init";
import "./LandingPage.css";

const API_URL = process.env.REACT_APP_BASE_URL;

const Signup = () => {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const navigate = useNavigate();
  const { signin, setAuthSession } = useUserauth();



  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);

    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
      throw new Error(data.message || "Signup failed");
    }

    localStorage.setItem("token", data.token);

    localStorage.setItem("user", JSON.stringify(data.user));

    toast.success("Account created successfully");

    navigate("/home", { replace: true });

  } catch (error) {
    toast.error(error.message);
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
        throw new Error(data.message || "Google signup failed");
      }

      setAuthSession({
        token: data.token,
        user: data.user,
      });

      toast.success(data.message || "Google sign-in successful");
      navigate("/home", { replace: true });
    } catch (error) {
      console.error("Google signup error:", error);
      toast.error(error.message || "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="image-container">
        <img className="image" src={twitterimg} alt="Twitter" />
      </div>

      <div className="form-container">
        <div className="form-box">
          <TwitterIcon
            className="Twittericon"
            style={{ color: "skyblue" }}
          />

          <h2 className="heading">Happening now</h2>
          <h3 className="heading1">Join Twitter today</h3>

          <form onSubmit={handleSubmit}>
            <input
              className="display-name"
              type="text"
              placeholder="@username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />

            <input
              className="display-name"
              type="text"
              placeholder="Enter Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />

            <input
              className="email"
              type="email"
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
              autoComplete="new-password"
              minLength={6}
              required
            />

            <div className="btn-login">
              <button
                type="submit"
                className="btn"
                disabled={loading || googleLoading}
              >
                {loading ? "Creating account..." : "Sign Up"}
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
                  : "Sign up with Google"
              }
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
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
  );
};

export default Signup;
