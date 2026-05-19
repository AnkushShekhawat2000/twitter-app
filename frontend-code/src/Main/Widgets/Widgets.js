import "./widgets.css"
import SearchIcon from "@mui/icons-material/Search"
import {TwitterTimelineEmbed, TwitterTweetEmbed} from "react-twitter-embed";

const Widgets = () =>{
    return (
        <div className="widgets">
          <div className="widgets_input">
            <SearchIcon className="widget_searchIcon"/>
            <input placeholder="Search Twitter" type="text"/>
          </div>
          <div className="widgets_widgetContainer">
             <h2>What's happening</h2>
             <TwitterTweetEmbed tweetId="1816174440071241866"/>
             <TwitterTimelineEmbed
               sourceType="profile"
               screenName="Valorant"
               options={{height: 400}}
             />
          </div>
           
        </div>
    )
}

export default Widgets