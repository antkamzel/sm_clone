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
import { updateAuthUserField, setUser } from "../../state/auth/userAuthSlice";
import { updatePostUserField } from "../../state/posts/postsSlice";
import { TbBoxMultiple } from "react-icons/tb";
import { RiCheckboxMultipleBlankFill } from "react-icons/ri";

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

    setLocalUser(userInfo);
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
    setLocalUser((prevState) => ({
      ...prevState,
      profile_pic: file[0],
    }));
  };

  const editFields = async () => {
    let temp = canEdit;
    if (temp === true) {
      updateInfo();
      // with email change
      // const { data, error } = await supabase.auth.updateUser({
      //   email: stateauthuser.email,
      // });
      // if (!error) {
      //   updateInfo();
      // }
    }
    credsContainerRef.current.classList.toggle("disabled");
    setCanEdit(!temp);
  };

  const updateInfo = async () => {
    let updatedInfo = { ...localUser };
    // delete old file from storage bucket in supabase
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
      if (localUser.profile_pic instanceof File) {
        const resp1 = await supabase.storage
          .from("profilePics")
          .upload(fileName, localUser.profile_pic);
        imageresp = supabase.storage
          .from("profilePics")
          .getPublicUrl(resp1.data.path);
      } else {
        imageresp = localUser.profile_pic;
      }
    } catch (err) {
      console.log(err);
    }
    const { resp, error2 } = await supabase
      .from("users")
      .update({
        username: updatedInfo.username,
        email: updatedInfo.email,
        profile_pic:
          localUser.profile_pic instanceof File
            ? imageresp.data.publicUrl
            : imageresp,
      })
      .eq("id", stateauthuser.id);

    if (!error2) {
      updatedInfo.profile_pic =
        localUser.profile_pic instanceof File
          ? imageresp.data.publicUrl
          : imageresp;
      setLocalUser(updatedInfo);
      setOldCreds(updatedInfo);
      console.log("updated");
      dispatch(setUser(updatedInfo));
    }
  };

  const checkUser = async () => {
    // will check to see if logged user is the same as profile user
    // (to allow editing)
    const resp = await supabase
      .from("users")
      .select("*")
      .eq("id", searchParams.get("id"))
      .single();
    setLocalUser(resp.data);
    setOldCreds(resp.data);
    if (stateauthuser && Object.keys(stateauthuser).length > 0) {
      if (!resp.error && resp.data.id === stateauthuser.id) {
        setIsLoggedUser(true);
      }
    }
  };

  const checkPosts = async () => {
    if (stateposts && stateposts.length > 0) {
      const userposts = stateposts.filter(
        (el) => el.user === searchParams.get("id")
      );
      userposts.sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      });
      if (searchParams.get("id") === stateauthuser.id) {
        userposts.forEach((element) => {
          const { id, username, email, profile_pic, created_at } =
            stateauthuser;
          const payload = {
            id,
            username,
            email,
            profile_pic,
            created_at,
            postid: element.id,
          };
          dispatch(updatePostUserField({ field: "users", value: payload }));
        });
      }
      setUserPosts(userposts);
    } else {
      const resp = await supabase
        .from("posts")
        .select("*, users(*)")
        .eq("user", searchParams.get("id"));
      if (resp.data) {
        resp.data.sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at);
        });
        setUserPosts(resp.data);
      }
    }
  };

  const checkMultipleImages = (object) => {
    let count = 0;

    for (let key in object) {
      if (
        typeof object[key] === "string" &&
        object[key].includes("/postImages/")
      ) {
        count++;
      } else if (typeof object[key] === "object" && object[key] !== null) {
        // Recursively check nested objects
        checkMultipleImages(object[key]);
      }
    }

    return count;
  };

  useEffect(() => {
    checkUser();
    checkPosts();
  }, [stateauthuser]);

  return (
    <div className="container-small">
      <div className="profile">
        <header>
          <button
            className="back-btn btnr ico-only"
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
            <button className="edit-btn btnr ico-only" onClick={editFields}>
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
                      setLocalUser((prevState) => ({
                        ...prevState, // Spread the previous state
                        username: ev.target.value,
                      }));
                    }}
                  />
                </div>
                {/* {isLoggedUser && (
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
                )} */}
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
                    
                    const multipleImages = checkMultipleImages(post) > 1;
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
                        {multipleImages && <RiCheckboxMultipleBlankFill className="ico-multiple"/>}
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
