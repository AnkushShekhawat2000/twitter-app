
import React, { useState } from "react";
import "./sidebar.css";

import SidebarOptions from "./SidebarOption";
import CustomeLink from "./CustomeLink";

import TwitterIcon from "@mui/icons-material/Twitter";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import MoreIcon from "@mui/icons-material/More";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import DoneIcon from "@mui/icons-material/Done";

import {
  Avatar,
  Button,
  Divider,
  Drawer,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  useMediaQuery,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import { useLoggedInUser } from "../../context/LoggedInUserContex";
// import useLoggedInUser from "../../hooks/useLoggedInUser";

const Sidebar = ({ handleLogout, user }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const openMenu = Boolean(anchorEl);

  // const [loggedInUser] = useLoggedInUser();
  const { loggedInUser } = useLoggedInUser();

  const navigate = useNavigate();

  const isMobile = useMediaQuery("(max-width:768px)");

  const handleClick = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const toggleDrawer = () => {
    setMobileOpen(!mobileOpen);
  };

  const result = user?.email?.split("@")[0] || "Guest";

  const profileImage =
    loggedInUser?.profilePhoto ||
    user?.photoURL ||
    "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577900_960_720.png";

  const userName =
    loggedInUser?.name || user?.displayName || "Guest User";

  const sidebarLinks = (
    <>
      
      <TwitterIcon className="sidebar-twitterIcon" />
      <CustomeLink to="/home">
        <SidebarOptions active Icon={HomeIcon} text="Home"  onClick={isMobile ? toggleDrawer : undefined} />
      </CustomeLink>

      <CustomeLink to="/home/explore">
        <SidebarOptions Icon={SearchIcon} text="Explore"  onClick={isMobile ? toggleDrawer : undefined} />
      </CustomeLink>

      <CustomeLink to="/home/notifications">
        <SidebarOptions
          Icon={NotificationsIcon}
          text="Notifications"
          onClick={isMobile ? toggleDrawer : undefined}
        />
      </CustomeLink>

      <CustomeLink to="/home/connections">
        <SidebarOptions
          Icon={PersonAddAlt1Icon}
          text="Connections"
          onClick={isMobile ? toggleDrawer : undefined}
        />
      </CustomeLink>

      <CustomeLink to="/home/bookmarks">
        <SidebarOptions
          Icon={BookmarkBorderIcon}
          text="Bookmarks"
          onClick={isMobile ? toggleDrawer : undefined}
        />
      </CustomeLink>

      <CustomeLink to="/home/lists">
        <SidebarOptions Icon={ListAltIcon} text="Lists" onClick={isMobile ? toggleDrawer : undefined} />
      </CustomeLink>

      <CustomeLink to="/home/profile">
        <SidebarOptions
          Icon={PermIdentityIcon}
          text="Profile"
          onClick={isMobile ? toggleDrawer : undefined}
        />
      </CustomeLink>

      <CustomeLink to="/home/more">
        <SidebarOptions Icon={MoreIcon} text="More"  onClick={isMobile ? toggleDrawer : undefined}/>
      </CustomeLink>
    </>
  );

  return (
    <>
      {/* MOBILE HEADER */}

      {isMobile && (
        <div className="mobile-header">
          <IconButton onClick={toggleDrawer}>
            <MenuIcon />
          </IconButton>

         
          <TwitterIcon className="sidebar-twitterIcon" />

          <Avatar
            src={profileImage}
            onClick={() => navigate("/home/profile")}
            sx={{ cursor: "pointer" }}
          />
        </div>
      )}

      {/* MOBILE DRAWER */}

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={toggleDrawer}
      >
        <div className="mobile-sidebar">
          <div className="mobile-top">
            <Avatar
              src={profileImage}
              sx={{ width: 55, height: 55 }}
            />

            <IconButton onClick={toggleDrawer}>
              <CloseIcon />
            </IconButton>
          </div>

          <div className="mobile-user-info">
            <h3>{userName}</h3>
            <p>@{result}</p>
          </div>

          <div className="mobile-links">{sidebarLinks}</div>

          <Button
            variant="contained"
            className="sidebar_tweet"
          >
            Tweet
          </Button>

          <Button
            variant="outlined"
            color="error"
            fullWidth
            sx={{ marginTop: "15px" }}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </Drawer>

      {/* DESKTOP SIDEBAR */}

      <div className="sidebar">
       
        {sidebarLinks}

        <Button
          variant="contained"
          className="sidebar_tweet"
        >
          Tweet
        </Button>

        <div className="Profile_info">
          <Avatar
            onClick={() => navigate("/home/profile")}
            sx={{ cursor: "pointer" }}
            src={profileImage}
          />

          <div className="user_info">
            <h4>{userName}</h4>
            <h5>@{result}</h5>
          </div>

          <IconButton onClick={handleClick}>
            <MoreHorizIcon />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleClose}
          >
            <MenuItem>
              <Avatar src={profileImage} />

              <div className="user_info">
                <h4>{userName}</h4>
                <h5>@{result}</h5>
              </div>

              <ListItemIcon>
                <DoneIcon />
              </ListItemIcon>
            </MenuItem>

            <Divider />

            <MenuItem onClick={handleClose}>
              Add existing account
            </MenuItem>

            <MenuItem onClick={handleLogout}>
              Logout @{result}
            </MenuItem>
          </Menu>
        </div>
      </div>
    </>
  );
};

export default Sidebar;