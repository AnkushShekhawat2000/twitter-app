import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

import TweetBox from "./TweetBox/TweetBox.js";
import Post from "./Posts/Posts.js";

import "./feed.css";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useUserauth } from "../../context/UserAuthContext.js";
import { useLoggedInUser } from "../../context/LoggedInUserContex.js";

const API_URL = process.env.REACT_APP_BASE_URL;
const LIMIT = 5;

const Feed = () => {


  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const navigate = useNavigate();

 
  const { token } = useUserauth();
  const { loggedInUser } = useLoggedInUser();

  const observer = useRef(null);
  const requestInProgress = useRef(false);



  const fetchPost = useCallback(
    async (pageNumber = 1, reset = false) => {
      if (requestInProgress.current) return;

      requestInProgress.current = true;
      setLoading(true);

      try {
        const headers = {
          "Content-Type": "application/json",
        };

      
        if (token) {
          headers.Authorization = "Bearer " + localStorage.getItem("token");
        }

        const response = await fetch(
          `${API_URL}/post/get-all-posts?page=${pageNumber}&limit=${LIMIT}`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({}),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch posts"
          );
        }

        const fetchedPosts = Array.isArray(data)
          ? data
          : Array.isArray(data.posts)
          ? data.posts
          : null;

        if (!fetchedPosts) {
          throw new Error("Invalid posts response");
        }

        setPosts((previousPosts) => {
          if (reset) return fetchedPosts;

          const existingIds = new Set(
            previousPosts.map((post) => post._id)
          );

          return [
            ...previousPosts,
            ...fetchedPosts.filter(
              (post) => !existingIds.has(post._id)
            ),
          ];
        });

        setHasMore(fetchedPosts.length === LIMIT);

      } catch (error) {
        console.error("Fetch posts error:", error);
        toast.error(error.message || "Unable to load posts");
      } finally {
        requestInProgress.current = false;
        setLoading(false);
      }
    },
    [token]
  );


  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);

    fetchPost(1, true);

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [fetchPost]);



  useEffect(() => {
    if (page > 1) {
      fetchPost(page, false);
    }
  }, [page, fetchPost]);

 

  const lastPostRef = useCallback(
    (node) => {
      if (observer.current) {
        observer.current.disconnect();
      }

      if (!node || loading || !hasMore) return;

      observer.current = new IntersectionObserver(
        (entries) => {
          if (
            entries[0].isIntersecting &&
            !requestInProgress.current &&
            hasMore
          ) {
            setPage((previousPage) => previousPage + 1);
          }
        },
        {
          threshold: 0.5,
        }
      );

      observer.current.observe(node);
    },
    [loading, hasMore]
  );



  const refreshPosts = async () => {
    setPage(1);
    setHasMore(true);

    await fetchPost(1, true);
  };

 

  const handleDelete = async (id) => {
    if (!token || !loggedInUser) {
      toast.info("Please login to continue");
      navigate("/login");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${API_URL}/post/delete-post/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete post"
        );
      }

      setPosts((previousPosts) =>
        previousPosts.filter(
          (post) => post._id !== id
        )
      );

      toast.success(
        data.message || "Post deleted successfully"
      );

    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete post");
    }
  };

 

  const handleUpdate = async (updatedPost) => {
    if (!token || !loggedInUser) {
      toast.info("Please login to continue");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/post/edit-post/${updatedPost._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          body: JSON.stringify({
            postBody: updatedPost.postBody,
            postImage: updatedPost.postImage,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update post"
        );
      }

      const savedPost = data.post || data.updatedPost;

      if (savedPost) {
        setPosts((previousPosts) =>
          previousPosts.map((post) =>
            post._id === updatedPost._id
              ? savedPost
              : post
          )
        );
      } else {
        await refreshPosts();
      }

      toast.success(
        data.message || "Post updated successfully"
      );

    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.message || "Failed to update post");
      throw error;
    }
  };


  return (
    <div className="feed">

      <div className="feed__header"></div>


      <TweetBox fetchPost={refreshPosts} />

      <div className="post-container">

        {posts.map((post, index) => {
          const isLastPost = index === posts.length - 1;

          return (
            <div
              ref={isLastPost ? lastPostRef : null}
              key={post._id}
            >
              <Post
                p={post}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            </div>
          );
        })}

      </div>


      {loading && (
        <div className="feed-loader">
          <div className="blue-loader"></div>
        </div>
      )}

     

      {!loading && posts.length === 0 && (
        <p className="feed-empty">
          No posts to show yet.
        </p>
      )}


      {!loading && posts.length > 0 && !hasMore && (
        <p className="feed-empty">
          You're all caught up.
        </p>
      )}

    </div>
  );
};

export default Feed;
