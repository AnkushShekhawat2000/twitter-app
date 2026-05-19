
import React, { useState, useEffect, useRef, useCallback } from "react";
import TweetBox from "./TweetBox/TweetBox.js";
import Post from "./Posts/Posts.js";
import "./feed.css";
import { useLoggedInUser } from "../../context/LoggedInUserContex.js";
import { Navigate } from "react-router-dom";
// import useLoggedInUser from "../../hooks/useLoggedInUser.js";

const LIMIT = 5;

const Feed = () => {

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);

  const [hasMore, setHasMore] = useState(true);

  // const [loggedInUser] = useLoggedInUser();
  const { loggedInUser } = useLoggedInUser();

  const observer = useRef();



  // const fetchPost = async (pageNumber = 1, reset = false) => {

  //   if (!loggedInUser?._id || loading) return;

  //   try {

  //     setLoading(true);

  //     const res = await fetch(
  //       `${process.env.REACT_APP_BASE_URL}/post/get-all-posts?page=${pageNumber}&limit=${LIMIT}`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           userId: loggedInUser?._id,
  //         }),
  //       }
  //     );

  //     const data = await res.json();

  //     if (reset) {

  //       setPosts(data);

  //     } else {

  //       setPosts((prev) => [...prev, ...data]);

  //     }

  //     // CHECK MORE POSTS

  //     if (data.length < LIMIT) {

  //       setHasMore(false);

  //     }

  //   } catch (error) {

  //     console.log(error);

  //   } finally {

  //     setLoading(false);

  //   }

  // };

  // ================= FIRST LOAD =================


const fetchPost = async (pageNumber = 1, reset = false) => {

  if (loading) return;

  try {

    setLoading(true);

    const res = await fetch(
      `${process.env.REACT_APP_BASE_URL}/post/get-all-posts?page=${pageNumber}&limit=${LIMIT}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: loggedInUser?._id || null,
        }),
      }
    );

    const data = await res.json();

    if (reset) {

      setPosts(data);

    } else {

      setPosts((prev) => [...prev, ...data]);

    }

    if (data.length < LIMIT) {

      setHasMore(false);

    }

  } catch (error) {

    console.log(error);

  } finally {

    setLoading(false);

  }
};




  // useEffect(() => {

  //   if (!loggedInUser?._id) return;

  //   setPosts([]);

  //   setPage(1);

  //   setHasMore(true);

  //   fetchPost(1, true);

  // }, [loggedInUser]);



//   useEffect(() => {

//   setPosts([]);

//   setPage(1);

//   setHasMore(true);

//   fetchPost(1, true);

// }, [loggedInUser]);




useEffect(() => {

  fetchPost(1, true);

}, []);

  // ================= LOAD MORE =================

  useEffect(() => {

    if (page === 1) return;

    fetchPost(page);

  }, [page]);

  // ================= OBSERVER =================

  const lastPostRef = useCallback(

    (node) => {

      if (loading) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {

        if (entries[0].isIntersecting && hasMore) {

          setPage((prev) => prev + 1);

        }

      });

      if (node) observer.current.observe(node);

    },

    [loading, hasMore]
  );

  // ================= DELETE =================

  const handleDelete = async (id) => {

    if (!loggedInUser) {

      Navigate("/login");

      return;
   }

    try {

      const confirmDelete = window.confirm("Delete this post?");

      if (!confirmDelete) return;

      const res = await fetch(
        `${process.env.REACT_APP_BASE_URL}/post/delete-post/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: loggedInUser?.email,
          }),
        }
      );

      const data = await res.json();

      if (res.status === 200) {

        setPosts((prev) =>
          prev.filter((post) => post._id !== id)
        );

      } else {

        alert(data.message || "Failed to delete post");

      }

    } catch (error) {

      console.error("Delete error:", error);

    }

  };

  // ================= UPDATE =================

  const handleUpdate = async (updatedPost) => {

    try {

      const res = await fetch(
        `${process.env.REACT_APP_BASE_URL}/post/edit-post/${updatedPost._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: loggedInUser?.email,
            postBody: updatedPost.postBody,
            postImage: updatedPost.postImage,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {

        setPosts((prev) =>
          prev.map((post) =>
            post._id === updatedPost._id
              ? data.post
              : post
          )
        );

      } else {

        alert(data.message);

      }

    } catch (error) {

      console.error("Update error:", error);

    }

  };

  return (

    <div className="feed">

      <div className="feed__header"></div>

      <TweetBox fetchPost={() => fetchPost(1, true)} />

      <div className="post-container">

        {posts.map((p, index) => {

          // LAST POST

          if (posts.length === index + 1) {

            return (

              <div ref={lastPostRef} key={p._id}>

                <Post
                  p={p}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                  
                />

              </div>

            );

          }

          return (

            <Post
              key={p._id}
              p={p}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />

          );

        })}

      </div>

    
    {loading && (

      <div className="feed-loader">

        <div className="blue-loader"></div>

      </div>

    )}

    </div>

  );

};

export default Feed;