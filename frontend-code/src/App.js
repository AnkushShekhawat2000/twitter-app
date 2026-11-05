import React from "react"
import './App.css';
import {BrowserRouter, Routes, Route} from "react-router-dom"
import ProtectedRoute from "./Pages/ProtectedRoute/ProtectedRoute.js"
import PageLoading from "./Pages/PageLoading/PageLoading.js"
import "../src/App.css"
import Home from "./Main/Home.js"
import Login from "./Pages/LandingPage/Login.js"
import Signup from './Pages/LandingPage/Signup.js';
import Feed from "./Main/Feed/Feed.js"
import Explore from "./Pages/Explore/Explore.js"
import Notifications from "./Pages/Notifications/Notifications";
import Messages from "./Pages/Messages/Messages"
import Bookmarks from "./Pages/Bookmarks/Bookmarks.js"
import Lists from "./Pages/Lists/Lists"
import Profile from "./Pages/Profile/Profile"
import More from "./Pages/More/More.js"
import { UserauthcontextProvider } from "./context/UserAuthContext.js";
import SocialDashboard from "./Pages/Community/Community.js";
import { LoggedInUserProvider } from "./context/LoggedInUserContex.js";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <div className="App">
    <UserauthcontextProvider>
       <LoggedInUserProvider>
      <BrowserRouter>
         <Routes>    
            <Route path="/" element={<Home/>}>
                 <Route index element={<Feed />} />
            </Route>
            <Route path="/home" element={<ProtectedRoute><Home/></ProtectedRoute>}>
               <Route index  element={<Feed />} /> 
               <Route path="explore" element={<Explore/>}/>
              
               <Route path="notifications" element={<Notifications/>}/>
               {/* <Route path="messages" element={<Messages/>}/> */}
               <Route path="bookmarks" element={<Bookmarks/>}/>
               <Route path="lists" element={<Lists/>}/>
               <Route path="profile" element={<Profile/>}/>
               <Route path="connections" element={<SocialDashboard/>}/>
               <Route path="more" element={<More/>}/>
            </Route>
            <Route path="/login" element={<Login/>}/>
            <Route path="/signup" element={<Signup/>}/> 
          </Routes>
            <ToastContainer
        position="top-right"
        autoClose={2500}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />
      </BrowserRouter>
      </LoggedInUserProvider>
      </UserauthcontextProvider>  
    </div>
  );
}

export default App;
