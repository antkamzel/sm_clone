import React, { useEffect, useRef, useState } from "react";
import {
  IoChatboxOutline,
  IoDesktopOutline,
  IoFilterOutline,
  IoHeart,
  IoHeartOutline,
  IoNotificationsOutline,
  IoSearchCircleOutline,
  IoSearchOutline,
  IoTimeOutline,
  IoWifiOutline,
} from "react-icons/io5";
import { BsThreeDots } from "react-icons/bs";
import profilePic from "../../assets/profile-pic.png";
import "./PostItem.scss";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";
import { supabase } from "../../clients/SupabaseClient";

const PostItem = (props) => {
  const swiperRef = useRef(null);

  // states
  const [images, setImages] = useState(null);

  const [isLiked, setIsLiked] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const [likesCounter, setLikesCounter] = useState(props.likes.length || 0);
  const [commentsCounter, setCommentsCounter] = useState(
    props.comments.length || 0
  );
  // ------------end of states

  // functions
  const formatTime = () => {
    const date = new Date(props.created_at);
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
    if (temp) {
      setLikesCounter(lkscount + 1);
      const resp = await supabase.from("likes").insert({
        post: props.post_id,
        user: props.auth_user.id,
      });
    } else {
      setLikesCounter(lkscount - 1);
      const resp = await supabase
        .from("likes")
        .delete()
        .eq("user", props.auth_user.id)
        .eq("post", props.post_id);
    }

    props.updatePostsLikes(props.post_id);
  };

  const postCommentAction = async () => {
    let cmcount = likesCounter;
    if (temp) {
      const resp = await supabase.from("comments").insert({
        post: props.post_id,
        user: props.auth_user.id,
        // commnent_text:
      });
      setCommentsCounter(cmcount + 1);
    } else {
      const resp = await supabase
        .from("comments")
        .delete()
        .eq("user", props.auth_user.id)
        .eq("post", props.post_id);
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
  // ----------------end of functions

  useEffect(() => {
    const filteredImages = [
      props.image1 || null,
      props.image2 || null,
      props.image3 || null,
      props.image4 || null,
    ].filter((image) => image !== null);
    filteredImages.sort((a, b) => (b < a ? 1 : -1));

    setLikesCounter(props.likes.length);
    setCommentsCounter(props.comments.length);

    setIsLiked(false);
    props.likes.forEach((likeelement) => {
      if (likeelement.user === props.auth_user.id) {
        setIsLiked(true);
      }
    });

    handleImageLoading(filteredImages);
  }, [props]);

  return (
    <>
      <div className="post-item">
        <div className="post-top-row">
          <img
            loading="lazy"
            src={props.user.profile_pic ? props.user.profile_pic : profilePic}
            alt=""
          />
          <div className="profile-info">
            <p>{props.user.username || ""}</p>
            <span className="creation-time">
              {formatTime(props.created_at)}
            </span>
          </div>
          {/* <button className="more-options btn">
          <BsThreeDots />
        </button> */}
        </div>
        <div className="post-slider" ref={swiperRef}>
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
        <div className="post-info">
          <span className="room_type-txt">
            <IoDesktopOutline /> {props.room_type}
          </span>
          <span className="complexity-txt">
            <IoWifiOutline /> {props.complexity}
          </span>
          <span className="duration-txt">
            <IoTimeOutline /> {props.duration[0].from}
            {props.duration[0].type} - {props.duration[0].to}
            {props.duration[0].type}
          </span>
        </div>
        <div className="post-title">
          <h3>{props.title}</h3>
        </div>
        <div className="post-actions">
          <button className="likes-wrapper" onClick={postLikeAction}>
            {isLiked ? <IoHeart /> : <IoHeartOutline />}
            {likesCounter}
          </button>
          {/* <button className="comments-wrapper">
          <IoChatboxOutline />
          {props.comments.length}
        </button> */}
        </div>
      </div>
    </>
  );
};

export default PostItem;
