import React, { useEffect, useRef, useState } from "react";
import "./Home.scss";
import profilePic from "../../assets/profile-pic.png";
import {
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { IoAdd, IoLogOut, IoPerson } from "react-icons/io5";
import { supabase } from "../../clients/SupabaseClient";
import PostItem from "../../comp/PostItem/PostItem";
import NewPostBtn from "../../comp/NewPostBtn/NewPostBtn";
import LoaderWrapper from "../../comp/LoaderWrapper/LoaderWrapper";
import { useSelector, useDispatch } from "react-redux";
import { setPosts, clearPosts } from "../../state/posts/postsSlice";
import { clearUser } from "../../state/auth/userAuthSlice";
import { FaSearch } from "react-icons/fa";

const Home = () => {
  // Get the search parameters from the URL
  const location = useLocation();
  const nav = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const stateposts = useSelector((state) => state.posts.posts);
  const stateauthuser = useSelector((state) => state.authuser.authuser);

  // refs
  const profilePopup = useRef();
  const categoriesBtnsRef = useRef([]);
  //---------------end of refs

  // states
  // const [theme, setTheme] = useState(document.body.classList[0]);
  const [allPosts, setAllPosts] = useState(null);
  const [localUser, setLocalUser] = useState({
    id: "",
    email: "",
    username: "",
  });
  const [contentReady, setContentReady] = useState(false);
  //----------end of states

  // functions
  const handleCategoryChange = (index) => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    window.localStorage.setItem("home-active-category", index);
    setActiveCategory();

    let orderedPosts = [...stateposts];
    setAllPosts(null);
    if (index == 0) {
      // order from new to old
      orderedPosts.sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      });
    } else if (index == 1) {
      // order the most likes first
      orderedPosts.sort((a, b) => {
        return b.likes.length - a.likes.length;
      });
    }
    setTimeout(() => {
      setAllPosts(orderedPosts);
    }, 150);
  };

  const setActiveCategory = () => {
    const index = window.localStorage.getItem("home-active-category");
    if (index) {
      categoriesBtnsRef.current.forEach((element, i) => {
        if (i == index) {
          element.classList.add("is-selected");
        } else {
          element.classList.remove("is-selected");
        }
      });
    } else {
      window.localStorage.setItem("home-active-category", 0);
    }
  };

  const toggleProfilePopup = (e) => {
    profilePopup.current.classList.toggle("hidden");
  };

  // const changeTheme = (ev) => {
  //   ev.stopPropagation();
  //   const newTheme = (theme === 'light-theme' ? 'dark-theme' : 'light-theme');
  //   setTheme(newTheme);
  //   document.body.setAttribute('class', newTheme);
  //   window.localStorage.setItem('theme', newTheme);
  // }

  const goToProfile = (ev) => {
    ev.stopPropagation();
    nav(`/profile?id=${localUser.id}`);
  };

  const handleLogout = async (ev) => {
    ev.stopPropagation();
    await supabase.auth.signOut();
    dispatch(clearPosts());
    dispatch(clearUser());
    window.localStorage.removeItem("home-active-category");
    nav("/login", { replace: true });
  };

  const fetchPosts = async () => {
    const resp = await supabase.from("posts").select("*, users(*)");

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
    setAllPosts(resp.data);
    dispatch(setPosts(resp.data));
    setContentReady(true);
  };

  // const fetchSpecificPost = async (post_id) => {
  //     const resp = await supabase.from('posts').select('*, room_types(type), complexity(name), users(*), duration(*)').eq('id', post_id);
  //     const likesresp = await supabase.from('likes').select().eq('post', post_id);
  //     const commentsresp = await supabase.from('comments').select().eq('post', post_id);
  //     setAllPosts(prevPosts => {
  //       return prevPosts.map(post => {
  //           if (post.id === post_id) {
  //               return {
  //                   ...post,
  //                   likes: likesresp.data,
  //                   comments: commentsresp.data
  //               };
  //           }
  //           return post; // Return unchanged post if ID doesn't match
  //       });
  //   });
  // }

  const closePopup = (ev) => {
    try {
      if (ev.target.closest(".profile-btn")) {
        profilePopup.current.classList.remove("hidden");
        return;
      }
    } catch (err) {}
    profilePopup.current.classList.add("hidden");
  };
  // ----------------- end of functions

  // use effects
  useEffect(() => {
    if (!stateposts || stateposts.length === 0) {
      fetchPosts();
    } else {
      setAllPosts(stateposts);
      setContentReady(true);
    }

    console.log('init run');
  }, []);

  useEffect(() => {
    setActiveCategory();
  }, [allPosts]);

  useEffect(() => {
    setLocalUser({
      id: stateauthuser.id,
      username: stateauthuser.username,
      email: stateauthuser.email,
      profile_pic: stateauthuser.profile_pic,
    });
  }, [stateauthuser]);

  useEffect(() => {
    const temp = [...stateposts];
    if (window.localStorage.getItem("home-active-category") === "0") {
      temp.sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      });
    } else {
      temp.sort((a, b) => {
        return b.likes.length - a.likes.length;
      });
    }
    setAllPosts(temp);
  }, [stateposts]);

  return (
    <div className="container-small">
      {location.pathname.includes("home/") ? (
        <Outlet />
      ) : (
        <div className="home" onClick={closePopup}>
          <div className="home-sticky-top">
            <div
              role="button"
              className="left-col profile-btn"
              onClick={(ev) => toggleProfilePopup(ev)}
              aria-haspopup="true"
            >
              <img
                src={localUser.profile_pic ? localUser.profile_pic : profilePic}
                alt="profile picture"
              />
              <p>{localUser.username}</p>
              <div className="profile-popup popup hidden" ref={profilePopup}>
                {/* <button className='btn' onClick={(ev) => changeTheme(ev)}>
                  {theme === 'dark-theme' ? <IoSunny/> : <IoMoon/>}{theme === 'dark-theme' ? 'Light' : 'Dark'}
                </button>
                 */}
                <button className="btn" onClick={(ev) => goToProfile(ev)}>
                  <IoPerson /> Profile
                </button>
                <button className="btn" onClick={(ev) => handleLogout(ev)}>
                  <IoLogOut /> Log out
                </button>
              </div>
            </div>
            <div className="right-col">
              {/* <Link to={'/notifications'} className='notifications-link'>
              <IoNotificationsOutline/>
            </Link> */}
              {/* <button
                className="btnr ico-only"
                onClick={() => {
                  nav("search");
                }}
              >
                <FaSearch />
              </button> */}
            </div>
          </div>

          {contentReady ? (
            <div className="home-main-content">
              <div className="categories-wrapper">
                <button
                  className="category-btn btn is-selected"
                  ref={(ref) => (categoriesBtnsRef.current[0] = ref)}
                  onClick={() => handleCategoryChange(0)}
                >
                  Newest
                </button>
                <button
                  className="category-btn btn"
                  ref={(ref) => (categoriesBtnsRef.current[1] = ref)}
                  onClick={() => handleCategoryChange(1)}
                >
                  Popular
                </button>

                {/* <button className='category-btn btn' ref={(ref) => categoriesBtnsRef.current[2] = ref} onClick={() => handleCategoryChange(2)}>Following</button> */}
              </div>

              {/* <div className='posts-wrapper'>
            {allPosts.map((post, index) => {
              return <PostItem key={index} info={post}></PostItem>
            })}
          </div> */}
              {allPosts && (
                <div className="posts-wrapper">
                  {allPosts.map((element, index) => {
                    return (
                      <PostItem
                        key={index}
                        auth_user={stateauthuser}
                        postprop={element}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <LoaderWrapper />
          )}
          {contentReady && <NewPostBtn icon={<IoAdd />} />}
        </div>
      )}
    </div>
  );
};

export default Home;
// NeH2tRMrZ5R7mIRW
