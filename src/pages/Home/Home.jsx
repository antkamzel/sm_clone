import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import './Home.scss';
import profilePic from  '../../assets/profile-pic.png';
import imagePlace1 from  '../../assets/img-place-1.jpg';
import imagePlace2 from  '../../assets/img-place-2.jpg';
import { Link, useNavigate } from 'react-router-dom';
import { IoAdd, IoChatboxOutline, IoDesktopOutline, IoFilterOutline, IoHeartOutline, IoLogOut, IoMoon, IoNotificationsOutline, IoPerson, IoSearchCircleOutline, IoSearchOutline, IoSunny, IoTimeOutline, IoWifiOutline } from 'react-icons/io5';
import { BsThreeDots } from "react-icons/bs";
import { supabase } from '../../clients/SupabaseClient';
import PostItem from '../../comp/PostItem/PostItem';
import NewPostBtn from '../../comp/NewPostBtn/NewPostBtn';
import LoaderWrapper from '../../comp/LoaderWrapper/LoaderWrapper';





const Home = () => {

  const nav = useNavigate();

  // refs
  const profilePopup = useRef();
  const categoriesBtnsRef = useRef([]);
  //---------------end of refs

  // states
  const [theme, setTheme] = useState(document.body.classList[0]);
  const [allPosts, setAllPosts] = useState([]);
  const [user, setUser] = useState({
    id: null,
    email: null,
    username: null
  });
  const [contentReady, setContentReady] = useState(false);
  //----------end of states

  // functions
  const handleCategoryChange = (index) => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    window.localStorage.setItem('home-active-category', index);
    categoriesBtnsRef.current.forEach((buttonRef, i) => {
      if (i === index) {
        buttonRef.classList.add('is-selected');
      } else {
        buttonRef.classList.remove('is-selected');
      }
    });
    
    setAllPosts(prevPosts => {
      // Sorting the previous state directly
      const sortedPosts = [...prevPosts];
      if(index === 0){
        sortedPosts.sort((a,b) => {
          return new Date(b.created_at) - new Date(a.created_at);
        });
      }
      else if(index === 1){
        sortedPosts.sort((a,b) => {
          return b.likes.length - a.likes.length;
        });
      }
      return sortedPosts; // Return the sorted array as the new state
    });
  };
  

  const fecthUser = async () => {
    try{
      const resp = await supabase.auth.getUser();
      const resp2 = await supabase.from('users').select().eq('id', resp.data.user.id);
      setUser({
        id: resp.data.user.id,
        email: resp2.data[0].email,
        username: resp2.data[0].username,
        profile_pic: resp2.data[0].profile_pic
      });
    }
    catch(err){
      console.log('something went wrong with user fetching - HOME');
    }
  }

  const toggleProfilePopup = (e) => {
    profilePopup.current.classList.toggle('hidden');
    
  }

  const changeTheme = (ev) => {
    ev.stopPropagation();
    const newTheme = (theme === 'light-theme' ? 'dark-theme' : 'light-theme');
    setTheme(newTheme);
    document.body.setAttribute('class', newTheme);
    window.localStorage.setItem('theme', newTheme);
  }
  
  const goToProfile = (ev) => {
    ev.stopPropagation();
  }

  const handleLogout = async (ev) => {
    ev.stopPropagation();
    await supabase.auth.signOut();
    nav('/login', {replace: true});
  }

  const fetchPosts = async () => {
    const resp = await supabase.from('posts').select('*, room_types(type), complexity(name), users(*), duration(*)');
    
    await Promise.all(resp.data.map(async post => {
      const likesresp = await supabase.from('likes').select().eq('post', post.id);
      const commentsresp = await supabase.from('comments').select().eq('post', post.id);
      post.likes = likesresp.data;
      post.comments = commentsresp.data;
    }));

    resp.data.sort((a, b) => {
      return new Date(b.created_at) - new Date(a.created_at)
    })
    setAllPosts(resp.data);
    setContentReady(true);
  }

  const fetchSpecificPost = async (post_id) => {
      const resp = await supabase.from('posts').select('*, room_types(type), complexity(name), users(*), duration(*)').eq('id', post_id);
      const likesresp = await supabase.from('likes').select().eq('post', post_id);
      const commentsresp = await supabase.from('comments').select().eq('post', post_id);
      setAllPosts(prevPosts => {
        return prevPosts.map(post => {
            if (post.id === post_id) {
                return {
                    ...post,
                    likes: likesresp.data,
                    comments: commentsresp.data
                };
            }
            return post; // Return unchanged post if ID doesn't match
        });
    });
  }

  const closePopup = (ev) => {
    try{
      if(ev.target.closest('.profile-btn')){
        profilePopup.current.classList.remove('hidden'); 
        return;
      }
    }catch(err){}
    profilePopup.current.classList.add('hidden'); 
  }
  // ----------------- end of functions


  // use effects
  useEffect(() => {
    fetchPosts();
    fecthUser();
  }, []);

  // when content is ready, update category active
  // useEffect(() => {
  //   handleCategoryChange(JSON.parse(window.localStorage.getItem('home-active-category')) || 0);
  // }, [contentReady]);
  // -----------end of useeffects
  

  return (
    <div className="container-small">
      <div className='home' onClick={closePopup}>
        <div className="home-sticky-top">
          <div role='button' className="left-col profile-btn" onClick={(ev) => toggleProfilePopup(ev)} aria-haspopup="true">
            <img src={user.profile_pic ? user.profile_pic : profilePic} alt="profile picture" />
            <p>{user.username}</p>
            <div className="profile-popup popup hidden" ref={profilePopup}>
                {/* <button className='btn' onClick={(ev) => changeTheme(ev)}>
                  {theme === 'dark-theme' ? <IoSunny/> : <IoMoon/>}{theme === 'dark-theme' ? 'Light' : 'Dark'}
                </button>
                <button className='btn' onClick={(ev) => goToProfile(ev)}><IoPerson/> Profile</button> */}
                <button className='btn' onClick={(ev) => handleLogout(ev)}><IoLogOut/> Log out</button>
            </div>
          </div>
          <div className="right-col">
            {/* <Link to={'/notifications'} className='notifications-link'>
              <IoNotificationsOutline/>
            </Link> */}
          </div>
        </div>

        {contentReady ?
        <div className="home-main-content">

          <div className="categories-wrapper">
            <button className='category-btn btn is-selected' ref={(ref) => categoriesBtnsRef.current[0] = ref} onClick={() => handleCategoryChange(0)}>Newest</button>
            <button className='category-btn btn' ref={(ref) => categoriesBtnsRef.current[1] = ref} onClick={() => handleCategoryChange(1)}>Popular</button>
            {/* <button className='category-btn btn' ref={(ref) => categoriesBtnsRef.current[2] = ref} onClick={() => handleCategoryChange(2)}>Following</button> */}
          </div>

          {/* <div className='posts-wrapper'>
            {allPosts.map((post, index) => {
              return <PostItem key={index} info={post}></PostItem>
            })}
          </div> */}
          <div className="posts-wrapper">
            {allPosts.map((element, index) => {
              return <PostItem key={index}
                              auth_user={user}
                              post_id={element.id}
                              created_at={element.created_at}
                              user={element.users}
                              room_type={element.room_types.type}
                              complexity={element.complexity.name}
                              duration={element.duration}
                              title={element.title}
                              image1={element.image1 || null}
                              image2={element.image2 || null}
                              image3={element.image3 || null}
                              image4={element.image4 || null}
                              images_order={element.images_order}
                              likes={element.likes}
                              comments={element.comments}
                              updatePostsLikes={fetchSpecificPost}
                              />
            })}
          </div>
        </div> : 
        <LoaderWrapper/>}
        {contentReady && <NewPostBtn icon={<IoAdd/>}/>}
      </div>
    </div>
    
  )
}

export default Home
// NeH2tRMrZ5R7mIRW