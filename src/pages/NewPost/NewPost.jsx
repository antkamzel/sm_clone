import React, { useState, useEffect, useRef } from "react";
import { IoArrowBack } from "react-icons/io5";
import "./NewPost.scss";
import { useNavigate } from "react-router-dom";
import ImageSelector from "../../comp/ImageSelector/ImageSelector";
import Select from "react-dropdown-select";
import { supabase } from "../../clients/SupabaseClient";
import PopupOverlay from "../../comp/PopupOverlay/PopupOverlay";
import LoaderWrapper from "../../comp/LoaderWrapper/LoaderWrapper";
import { MdFileUpload } from "react-icons/md";
import { v4 } from "uuid";
import { useDispatch, useSelector } from "react-redux";
import { addPost } from "../../state/posts/postsSlice";


const NewPost = () => {
  // const durationOptions = [
  //   {
  //     fullName: "Minutes",
  //     name: "min",
  //   },
  //   {
  //     fullName: "Hours",
  //     name: "h",
  //   },
  //   {
  //     fullName: "Days",
  //     name: "d",
  //   },
  // ];

  const stateposts = useSelector((state) => state.posts.posts);
  const stateauthuser = useSelector((state) => state.authuser.authuser);

  const loadingOverlayRef = useRef();
  const dispatch = useDispatch();


  const [postFields, setPostFields] = useState({
    images: [],
    title: null,
    // roomType: null,
    // complexity: null,
    // duration: {
    //   from: null,
    //   to: null,
    //   type: null,
    // },
  });
  // const [complexOptions, setComplexOptions] = useState(null);
  // const [roomTypesOptions, setRoomTypesOptions] = useState(null);
  const [contentReady, setContentReady] = useState(false);
  const [allowUpload, setAllowUpload] = useState(false);

  const nav = useNavigate();

  const handleGetImages = (files) => {
    setPostFields((prevState) => ({
      ...prevState,
      images: files,
    }));
  };

  const handleTitleChange = (ev) => {
    setPostFields((prevState) => ({
      ...prevState,
      title: ev.target.value,
    }));
  };

  // const handleRoomTypeChange = (data) => {
  //   setPostFields((prevState) => ({
  //     ...prevState,
  //     roomType: data[0],
  //   }));
  // };

  // const handleComplexityChange = (data) => {
  //   setPostFields((prevState) => ({
  //     ...prevState,
  //     complexity: data[0],
  //   }));
  // };

  // const handleFromChange = (ev) => {
  //   setPostFields((prevState) => ({
  //     ...prevState,
  //     duration: {
  //       ...prevState.duration,
  //       from: ev.target.value,
  //     },
  //   }));
  // };

  const handleToChange = (ev) => {
    setPostFields((prevState) => ({
      ...prevState,
      duration: {
        ...prevState.duration,
        to: ev.target.value,
      },
    }));
  };

  const handleDurationTypeChange = (data) => {
    setPostFields((prevState) => ({
      ...prevState,
      duration: {
        ...prevState.duration,
        type: data[0].name,
      },
    }));
  };

  const areAllFieldsFilled = () => {
    // Destructure fields from the postFields state
    const { images, title, roomType, complexity, duration } = postFields;

    // Check if all fields have content
    if (
      images.length > 0 &&
      title !== null
      // roomType !== null &&
      // complexity !== null &&
      // duration.from !== null &&
      // duration.to !== null &&
      // duration.type !== null
    ) {
      return true;
    } else {
      return false;
    }
  };

  // async functions
  // const fetchComplexity = async () => {
  //   const respComplex = await supabase.from("complexity").select();
  //   if (respComplex.data.length > 0) {
  //     setComplexOptions(respComplex.data);
  //   }
  // };
  // const fetchRoomTypes = async () => {
  //   const respRoomTypes = await supabase.from("room_types").select();
  //   if (respRoomTypes.data.length > 0) {
  //     setRoomTypesOptions(respRoomTypes.data);
  //   }
  // };

  const uploadPost = async () => {
    loadingOverlayRef.current.classList.add("overlay-visible");

    const imagesURL = [];

    // postfield images contain File type images
    await Promise.all(
      postFields.images.map(async (image, ind) => {
        // uploading each image to the storage
        const fileName = `or-${ind}-${v4() + Date.now()}.jpg`;
        const resp1 = await supabase.storage
          .from("postImages")
          .upload(fileName, image);
        // get url to
        const resp2 = supabase.storage
          .from("postImages")
          .getPublicUrl(resp1.data.path);
        imagesURL.push(resp2.data.publicUrl);
      })
    );

    const uploadResp = await supabase
      .from("posts")
      .insert({
        title: postFields.title,
        image1: imagesURL[0] || null,
        image2: imagesURL[1] || null,
        image3: imagesURL[2] || null,
        image4: imagesURL[3] || null,
        // room_type: postFields.roomType.id,
        // complexity: postFields.complexity.id,
        user: stateauthuser.id,
      })
      .select("id");
    if (uploadResp.error) {
      return;
    }
    const newPostID = uploadResp.data[0].id;

    // await supabase.from("duration").insert({
    //   type: postFields.duration.type,
    //   from: postFields.duration.from,
    //   to: postFields.duration.to,
    //   post: newPostID,
    // });

    setPostFields((prevState) => ({
      ...prevState,
      title: null,
    }));
    loadingOverlayRef.current.classList.remove("overlay-visible");

    // const resp = await supabase
    //   .from("posts")
    //   .select("*, room_types(type), complexity(name), users(*), duration(*), likes(*), comments(*)")
    //   .eq('id', newPostID).single();
    const resp = await supabase
      .from("posts")
      .select("*, users(*), likes(*), comments(*)")
      .eq('id', newPostID).single();
    
      if(!resp.error){
        dispatch(addPost(resp.data));
      }
    nav("/home", { replace: true });
  };
  //

  // const waitForInit = async () => {
  //   // await fetchComplexity();
  //   // await fetchRoomTypes();
  //   setContentReady(true);
  // };

  // init
  useEffect(() => {
    // waitForInit();
    setContentReady(true);
  }, []);

  useEffect(() => {
    setAllowUpload(areAllFieldsFilled());
  }, [postFields]);

  return (
    <div className="container-small">
      <div className="new-post">
        <header>
          <button
            onClick={() => {
              nav("/home");
            }}
          >
            <IoArrowBack />
          </button>
          <p>New Post</p>
          <button
            className="upload-post-btn btn"
            onClick={uploadPost}
            disabled={allowUpload ? false : true}
          >
            <MdFileUpload />
          </button>
        </header>
        {contentReady ? (
          <div className="content">
            <div className="images-wrapper">
              <ImageSelector setImages={handleGetImages} limit={4} />
            </div>
            <div className="input-fields-wrapper">
              <div className="input-wrapper">
                <label htmlFor="titleInput">Title</label>
                <input
                  type="text"
                  id="titleInput"
                  placeholder="Input a title for your post"
                  onChange={handleTitleChange}
                />
              </div>
              {/* {complexOptions && (
                <div className="input-wrapper">
                  <label htmlFor="complexInput">Complexity</label>
                  <Select
                    searchable={false}
                    options={complexOptions}
                    labelField="name"
                    valueField="id"
                    dropdownPosition="auto"
                    onChange={handleComplexityChange}
                  />
                </div>
              )} */}
              {/* {roomTypesOptions && (
                <div className="input-wrapper">
                  <label htmlFor="complexInput">Room type</label>
                  <Select
                    searchable={false}
                    options={roomTypesOptions}
                    labelField="type"
                    valueField="id"
                    dropdownPosition="auto"
                    onChange={handleRoomTypeChange}
                  />
                </div>
              )} */}
              {/* <div className="input-wrapper">
                <label htmlFor="complexInput">Duration (Est.)</label>
                <Select
                  searchable={false}
                  options={durationOptions}
                  labelField="fullName"
                  valueField="name"
                  dropdownPosition="auto"
                  onChange={handleDurationTypeChange}
                />
                <div className="input-wrapper-flex">
                  <div className="input-inner">
                    <label htmlFor="dfrom">From</label>
                    <input
                      id="dfrom"
                      type="number"
                      onChange={handleFromChange}
                    />
                  </div>
                  <div className="input-inner">
                    <label htmlFor="dto">To</label>
                    <input id="dto" type="number" onChange={handleToChange} />
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        ) : (
          <LoaderWrapper />
        )}

        <PopupOverlay isLoading={true} ref={loadingOverlayRef} />
      </div>
    </div>
  );
};

export default NewPost;
