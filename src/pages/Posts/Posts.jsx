import React, { useEffect, useRef, useState } from "react";
import "./Posts.scss";
import { useSelector } from "react-redux";
import PostItem from "../../comp/PostItem/PostItem";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../clients/SupabaseClient";
import { FaChevronLeft } from "react-icons/fa";

const Posts = () => {

  const nav = useNavigate();

  const stateposts = useSelector((state) => state.posts.posts);
  const authuserstate = useSelector((state) => state.authuser.authuser);

  const { postid } = useParams();

  const [posts, setPosts] = useState([]);
  const postRefs = useRef({}); // Ref object to store refs for PostItem elements

  const checkPosts = async () => {
    const userresp = await supabase
      .from("posts")
      .select("users(id)")
      .eq("id", postid)
      .single();
    const userid = userresp.data.users.id;
    let userposts;
    userposts = stateposts.filter((el) => {
      return el.user === userid;
    });
    if (!userposts || userposts.length === 0) {
      const resp = await supabase
        .from("posts")
        .select(
          "*, users(*), likes(*), comments(*)"
        )
        .eq("user", userid);
      userposts = resp.data;
    }

    userposts.sort((a, b) => {
      return new Date(b.created_at) - new Date(a.created_at);
    });

    setPosts(userposts);
  };


  useEffect(() => {
    checkPosts();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (postid && postRefs.current[postid]) {
        const element = postRefs.current[postid];
        const top = element.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({
          top,
          behavior: "instant",
        });
      }
    }, 50);
  }, [postid, posts]);

  return (
    <div className="container-small">
      <div className="posts-page">
        <header>
          <button className="btnr ico-only" onClick={() => {
            nav(-1);
          }}> 
            <FaChevronLeft />
          </button>
          <h1>Posts</h1>
        </header>
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
