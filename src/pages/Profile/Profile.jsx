import React, { useEffect, useRef, useState } from "react";
import "./Profile.scss";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaChevronLeft, FaSave } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { supabase } from "../../clients/SupabaseClient";
import ImageSelector from "../../comp/ImageSelector/ImageSelector";
import { v4 } from "uuid";
import PopupOverlay from "../../comp/PopupOverlay/PopupOverlay";


const Profile = () => {
  const nav = useNavigate();
  const location = useLocation();
  const successRef = useRef();
  const spinnerRef = useRef();

  const credsContainerRef = useRef();

  const [oldCreds, setOldCreds] = useState();
  const [hasUpdates, setHasUpdates] = useState(false);

  const [user, setUser] = useState();
  const [canEdit, setCanEdit] = useState(false);

  const fetchUser = async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      // Navigate to home if there's an error
      nav("/home", { replace: true });
      return; // Exit the function
    }

    let userInfo = data.user;

    // Fetch user profile picture
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
    setUser(userInfo);
    setOldCreds(userInfo);
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
    try{
      const oldfilename = oldCreds.profile_pic.split('/').pop();
      const { data, error } = await supabase
        .storage
        .from('profilePics')
        .remove([oldfilename]);
    }catch(err){console.log(err)}

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

      if(!error2){
        setOldCreds((prevState) => ({
          ...prevState,
          username: user.username,
          email: user.email,
          profile_pic: imageresp.data.publicUrl,
        }));

        setHasUpdates(true);
        console.log('updated');
      }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div className="container-small">
      <div className="profile">
        <header>
          <button
            className="back-btn btnr"
            onClick={() => {
              if(hasUpdates){
                nav(`/home?updates=true`);
                return;
              }
              nav(-1);
            }}
          >
            <FaChevronLeft />
          </button>
          <h1>Your profile</h1>
          <button className="edit-btn btnr" onClick={editFields}>
            {canEdit ? <FaSave /> : <MdEdit />}
          </button>
        </header>
        <div className="content">
          <div className="content-inner">
            {user ? (
              <div className="creds-container disabled" ref={credsContainerRef}>
                <div className="top">
                  <ImageSelector
                    setImages={profilePicHandle}
                    limit={1}
                    defaultImg={user.profile_pic}
                  />
                  <input
                    type="text"
                    className="username-in"
                    value={user.username}
                    onInput={(ev) => {
                      setUser((prevState) => ({
                        ...prevState, // Spread the previous state
                        username: ev.target.value,
                      }));
                    }}
                  />
                </div>
                <div className="bottom">
                  <div className="input-wrapper">
                    <label htmlFor="email-input">Email</label>
                    <input
                      id="email-input"
                      type="text"
                      value={user.email}
                      onInput={(ev) => {
                        setUser((prevState) => ({
                          ...prevState, // Spread the previous state
                          email: ev.target.value,
                        }));
                      }}
                    />
                  </div>
                </div>
                {/* <input type="text" value={"ekala"} />
                <input type="text" value={"mail@mail.com"} />
                <input type="password" value={"password"} /> */}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
