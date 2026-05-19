import Sidebar from "./Sidebar/Sidebar.js"
import Widgets from "./Widgets/Widgets"
import {Outlet} from "react-router-dom"
import { useNavigate } from "react-router-dom"
import "../App.css"
import {useUserauth} from "../context/UserAuthContext.js"


const Home = () =>{

    const {logout, user} = useUserauth();
    const navigate = useNavigate();

    const handleLogout = async () => { 
        try {
          const response = await logout();
          console.log('Logout response:', response); 
          navigate("/login");
        } catch (error) {
          console.log(error.message);
        }
     }
    return(
        <div className="app">
            <Sidebar handleLogout={handleLogout} user={user}/>
            <Outlet/>
            <Widgets/>
        </div>
    )

}

export default Home