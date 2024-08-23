import React, { forwardRef, useEffect, useRef, useState } from "react";
import profilePic from "../../assets/profile-pic.png";
import "./PostItem.scss";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { supabase } from "../../clients/SupabaseClient";
import { useDispatch, useSelector } from "react-redux";
import { updatePost } from '../../state/posts/postsSlice';
import { useNavigate } from "react-router-dom";
import { FaHeart, FaHeartBroken, FaRegHeart } from "react-icons/fa";


const PostItem = forwardRef((props, ref) => {

  // const stateauthuser = useSelector((state) => state.authuser.authuser);
  // const stateposts = useSelector((state) => state.posts.posts);

  const dispatch = useDispatch();
  const nav = useNavigate();

  const swiperRef = useRef(null);
  const heartIcoRef = useRef(null);
  const heartBrokenIcoRef = useRef(null);
  // states
  const [images, setImages] = useState(null);
  const [localData, setLocalData] = useState();

  const [isLiked, setIsLiked] = useState(false);
  const [likesCounter, setLikesCounter] = useState(0);
  const [commentsCounter, setCommentsCounter] = useState(0);

  // State to track double-tap
  const [lastTap, setLastTap] = useState(0);

  // ------------end of states

  // functions
  const formatTime = () => {
    const date = new Date(props.postprop.created_at);
    const dayname = date.toLocaleDateString("en-us", { weekday: "long" });
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = date.getHours();
    const mins = (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();

    const formatted = `${dayname}, ${day}-${month}-${year}, ${hours}:${mins}`;

    return formatted;
  };

  const postLikeAction = async () => {
    const temp = !isLiked;
    let lkscount = likesCounter;
    setIsLiked(temp);
    let resp;
    if (temp) {
      setLikesCounter(lkscount + 1);
      resp = await supabase.from("likes").insert({
        post: props.postprop.id,
        user: props.auth_user.id,
      });
    } else {
      setLikesCounter(lkscount - 1);
      resp = await supabase
        .from("likes")
        .delete()
        .eq("user", props.auth_user.id)
        .eq("post", props.postprop.id);
    }

    if(!resp.error){
      // console.log('download new item');
      const resp2 = await supabase.from("posts").select('*, likes(*)').eq('id', props.postprop.id).single();
      if(!resp2.error){
        dispatch(updatePost(resp2.data));
      }
    }

    // console.log(props.postprop);
    
  };

  const postCommentAction = async () => {
    let cmcount = likesCounter;
    if (temp) {
      const resp = await supabase.from("comments").insert({
        post: props.postprop.id,
        user: props.auth_user.id,
        // commnent_text:
      });
      setCommentsCounter(cmcount + 1);
    } else {
      const resp = await supabase
        .from("comments")
        .delete()
        .eq("user", props.auth_user.id)
        .eq("post", props.postprop.id);
      setCommentsCounter(cmcount - 1);
    }
  };

  const changeAspectRatio = (imageUrls) => {
    return new Promise((resolve, reject) => {
      if (imageUrls.length === 0) return resolve();

      const firstImageUrl = imageUrls[0];
      const img = new Image();

      img.onload = () => {
        const aspectRatio = img.width / img.height;

        // Get the container width (assuming full width)
        const container = swiperRef.current;
        if (container) {
          const containerWidth = container.clientWidth; // Full width of the container
          const containerHeight = containerWidth / aspectRatio;

          // Set the container's height
          container.style.height = `${containerHeight}px`;
          container.style.visibility = "visible";
        }

        resolve();
      };

      img.onerror = (error) => {
        reject(error);
      };

      img.src = firstImageUrl;
    });
  };

  const handleImageLoading = async (imgs) => {
    try {
      await changeAspectRatio(imgs);
      setImages(imgs);
    } catch (error) {
      console.error("Error adjusting aspect ratio:", error);
    }
  };

  const handleTap = (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;

    if (tapLength < 180 && tapLength > 0) {
      // Double-tap detected
      handleDoubleTap();
      if(isLiked == false){
        heartIcoRef.current.classList.remove('inv');
        setTimeout(() => {
          heartIcoRef.current.classList.add('inv');
        }, 850);
      }
      else{
        heartBrokenIcoRef.current.classList.remove('inv');
        setTimeout(() => {
          heartBrokenIcoRef.current.classList.add('inv');
        }, 850);
      }
    }

    setLastTap(currentTime);
  };

  const handleDoubleTap = () => {
    postLikeAction(); // Call the like action on double-tap
  };
  // ----------------end of functions

  useEffect(() => {
    const filteredImages = [
      props.postprop.image1 || null,
      props.postprop.image2 || null,
      props.postprop.image3 || null,
      props.postprop.image4 || null,
    ].filter((image) => image !== null);
    filteredImages.sort((a, b) => (b < a ? 1 : -1));

    setLikesCounter(props.postprop.likes.length);
    setCommentsCounter(props.postprop.comments.length);

    props.postprop.likes.forEach((likeelement) => {
      if (likeelement.user === props.auth_user.id) {
        setIsLiked(true);
      }
    });

    handleImageLoading(filteredImages);

    setLocalData(props.postprop)
  }, []);

  return (
    <>
      <div className="post-item" id={props.postprop.id} ref={ref} onTouchStart={handleTap}>
        <div className="post-top-row" onClick={() => {
          nav(`/profile?id=${props.postprop.user}`)
        }}>
          <img
            loading="lazy"
            src={props.postprop.users.profile_pic?.includes('profilePics') ? props.postprop.users.profile_pic : profilePic}
            alt=""
            aria-hidden={true}
          />
          <div className="profile-info">
            <p>{props.postprop.users.username || ""}</p>
            <span className="creation-time">
              {formatTime(props.postprop.created_at)}
            </span>
          </div>
          
        </div>
        <div className="post-slider" ref={swiperRef}>
          <div className="ico-heart inv" ref={heartIcoRef}>
            <FaHeart/>
          </div>
          <div className="ico-heart inv" ref={heartBrokenIcoRef}>
            <FaHeartBroken/>
          </div>
          {images ? (
            <Swiper
              modules={[Navigation, Pagination]}
              // navigation
              pagination={{ clickable: true }}
              className="swiper-comp"
            >
              {images.map((image, index) => (
                <SwiperSlide key={index}>
                  <img
                    loading="lazy"
                    src={image}
                    alt={`Selected ${index + 1}`}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : <div className="image-skeleton"></div>}
        </div>
        {/* <div className="post-info">
          <span className="room_type-txt">
            <IoDesktopOutline /> {props.postprop.room_types.type}
          </span>
          <span className="complexity-txt">
            <IoWifiOutline /> {props.postprop.complexity.name}
          </span>
          <span className="duration-txt">
            <IoTimeOutline /> {props.postprop.duration[0].from}
            {props.postprop.duration[0].type} - {props.postprop.duration[0].to}
            {props.postprop.duration[0].type}
          </span>
        </div> */}
        <div className="post-title">
          <h3>{props.postprop.title}</h3>
        </div>
        <div className="post-actions">
          <button className="likes-wrapper" onClick={postLikeAction}>
            {isLiked ? <FaHeart /> : <FaRegHeart />}
            {likesCounter}
          </button>
        </div>
      </div>
    </>
  );
});

export default PostItem;
