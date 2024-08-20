import React, { useEffect, useRef, useState } from "react";
import "./Posts.scss";
import { useSelector } from "react-redux";
import PostItem from "../../comp/PostItem/PostItem";
import { useParams } from "react-router-dom";

const Posts = () => {
  const stateposts = useSelector((state) => state.posts.posts);
  const authuserstate = useSelector((state) => state.authuser.authuser);
  const { id } = useParams();

  const [posts, setPosts] = useState([]);
  const postRefs = useRef({}); // Ref object to store refs for PostItem elements

  useEffect(() => {
    const userposts = stateposts.filter(el => {
      return el.user === authuserstate.id
    });
    setPosts(userposts);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (id && postRefs.current[id]) {
        const element = postRefs.current[id];
        const top = element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top,
          behavior: "instant",
        });
      }
    }, 100);
  }, [id, posts]);

  return (
    <div className="container-small">
      <div className="posts-page">
        <div className="posts-container">
          {posts.map((post) => (
            <PostItem
              key={post.id}
              id={post.id} // Pass the ID to PostItem
              auth_user={authuserstate}
              postprop={post}
              ref={(el) => (postRefs.current[post.id] = el)} // Set ref to PostItem
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Posts;
