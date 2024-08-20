import React, { useEffect, useRef, useState } from "react";
import "./Profile.scss";
import {
  Link,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { FaChevronLeft, FaSave } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { supabase } from "../../clients/SupabaseClient";
import ImageSelector from "../../comp/ImageSelector/ImageSelector";
import { v4 } from "uuid";
import PopupOverlay from "../../comp/PopupOverlay/PopupOverlay";
import { useDispatch, useSelector } from "react-redux";

const Profile = () => {
  const nav = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const credsContainerRef = useRef();

  const stateauthuser = useSelector((state) => state.authuser.authuser);
  const stateposts = useSelector((state) => state.posts.posts);

  const [userPosts, setUserPosts] = useState();
  const [oldCreds, setOldCreds] = useState();
  const [hasUpdates, setHasUpdates] = useState(false);
  const [isLoggedUser, setIsLoggedUser] = useState(false);

  const [localUser, setLocalUser] = useState();
  const [canEdit, setCanEdit] = useState(false);

  const fetchUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      // Navigate to home if there's an error
      nav("/home", { replace: true });
      return; // Exit the function
    }

    let userInfo = data.user;

    // Fetch user profile picture and username
    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("username, profile_pic")
      .eq("id", userInfo.id)
      .single(); // Use .single() if you expect only one result

    if (fetchError) {
      // Handle the error (optional)
      console.error(fetchError);
      return;
    }

    userInfo = {
      ...userInfo,
      profile_pic: userData?.profile_pic,
      username: userData?.username,
    };

    //check if user is the same as logged user
    if (searchParams.get("id")) {
      const id = searchParams.get("id");
      if (id === userInfo.id) {
        setIsLoggedUser(true);
      }
    }

    setUser(userInfo);
    setOldCreds(userInfo);
    fetchPosts(userInfo.id);
  };

  const fetchPosts = async (userid) => {
    const resp = await supabase
      .from("posts")
      .select("*, room_types(type), complexity(name), users(*), duration(*)")
      .eq("user", userid);

    await Promise.all(
      resp.data.map(async (post) => {
        const likesresp = await supabase
          .from("likes")
          .select()
          .eq("post", post.id);
        const commentsresp = await supabase
          .from("comments")
          .select()
          .eq("post", post.id);
        post.likes = likesresp.data;
        post.comments = commentsresp.data;
      })
    );

    resp.data.sort((a, b) => {
      return new Date(b.created_at) - new Date(a.created_at);
    });
    setUserPosts(resp.data);
  };

  const profilePicHandle = (file) => {
    setUser((prevState) => ({
      ...prevState,
      profile_pic: file[0],
    }));
  };

  const editFields = async () => {
    let temp = canEdit;
    if (temp === true) {
      const { data, error } = await supabase.auth.updateUser({
        email: user.email,
      });
      if (!error) {
        updateInfo();
      }
    }
    credsContainerRef.current.classList.toggle("disabled");
    setCanEdit(!temp);
  };

  const updateInfo = async () => {
    try {
      const oldfilename = oldCreds.profile_pic.split("/").pop();
      const { data, error } = await supabase.storage
        .from("profilePics")
        .remove([oldfilename]);
    } catch (err) {
      console.log(err);
    }

    const fileName = `profile-${v4() + Date.now()}.png`;
    let imageresp;
    try {
      const resp1 = await supabase.storage
        .from("profilePics")
        .upload(fileName, user.profile_pic);
      // get url to
      imageresp = supabase.storage
        .from("profilePics")
        .getPublicUrl(resp1.data.path);
    } catch (err) {
      console.log(err);
    }
    const { resp, error2 } = await supabase
      .from("users")
      .update({
        username: user.username,
        email: user.email,
        profile_pic: imageresp.data.publicUrl,
      })
      .eq("id", user.id);

    if (!error2) {
      setOldCreds((prevState) => ({
        ...prevState,
        username: user.username,
        email: user.email,
        profile_pic: imageresp.data.publicUrl,
      }));

      setHasUpdates(true);
      console.log("updated");
    }
  };

  const checkUser = async () => {
    if (stateauthuser && Object.keys(stateauthuser).length > 0) {
      const resp = await supabase .from("users").select("*").eq("id", searchParams.get("id")).single();
      if (!resp.error && resp.data.id === stateauthuser.id) {
        setIsLoggedUser(true);
      }
      setLocalUser(stateauthuser);
    }
  };

  useEffect(() => {
    checkUser();
  }, [stateauthuser]);

  useEffect(() => {
    if(stateposts){
      const userposts = stateposts.filter(el => el.user === stateauthuser.id)
      setUserPosts(userposts);
    }
  }, [stateposts]);

  return (
    <div className="container-small">
      <div className="profile">
        <header>
          <button
            className="back-btn btnr"
            onClick={() => {
              if (hasUpdates) {
                nav(`/home?updates=true`);
                return;
              }
              nav(-1);
            }}
          >
            <FaChevronLeft />
          </button>
          <h1>Your profile</h1>
          {isLoggedUser && (
            <button className="edit-btn btnr" onClick={editFields}>
              {canEdit ? <FaSave /> : <MdEdit />}
            </button>
          )}
        </header>
        <div className="content">
          <div className="content-inner">
            {localUser ? (
              <div className="creds-container disabled" ref={credsContainerRef}>
                <div className="top">
                  <ImageSelector
                    setImages={profilePicHandle}
                    limit={1}
                    defaultImg={localUser.profile_pic}
                  />
                  <input
                    type="text"
                    className="username-in"
                    value={localUser.username}
                    onInput={(ev) => {
                      setUser((prevState) => ({
                        ...prevState, // Spread the previous state
                        username: ev.target.value,
                      }));
                    }}
                  />
                </div>
                {isLoggedUser && (
                  <div className="bottom">
                    <div className="input-wrapper">
                      <label htmlFor="email-input">Email</label>
                      <input
                        id="email-input"
                        type="text"
                        value={localUser.email}
                        onInput={(ev) => {
                          setUser((prevState) => ({
                            ...prevState, // Spread the previous state
                            email: ev.target.value,
                          }));
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="creds-container">
                <div className="top">
                  <span className="imgskeleton pr-skeleton"></span>
                  <span className="unskeleton pr-skeleton"></span>
                </div>
              </div>
            )}
            <div className="posts-container">
              <h2>Posts</h2>
              {userPosts ? (
                <div className="posts-grid">
                  {userPosts.map((post, index) => {
                    const imageToShow = Object.values(post).find((value) => {
                      return (
                        typeof value === "string" &&
                        value.includes("postImages/or-0")
                      );
                    });
                    return (
                      <button
                        key={index}
                        className="pr-post"
                        onClick={() => {
                          nav(`/posts/${post.id}`);
                        }}
                      >
                        {imageToShow && (
                          <img src={imageToShow} alt="Post Image" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="posts-grid">
                  {[0, 0, 0, 0, 0, 0].map((el, index) => (
                    <span key={index} className="pr-skeleton"></span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
