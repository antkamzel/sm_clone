import React, { useRef, useState } from "react";
import "./Register.scss";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../clients/SupabaseClient";
import LoaderDots from "../../comp/LoaderDots/LoaderDots";
import ImageSelector from "../../comp/ImageSelector/ImageSelector";
import { v4 } from "uuid";

const Register = () => {
  const nav = useNavigate();

  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
    image: "",
  });

  const [enableButton, setEnableButton] = useState(0);
  const [isRegistering, setIsRegistering] = useState(false);

  const usernameError = useRef();
  const emailError = useRef();
  const passwordError = useRef();

  const usernameInput = useRef();
  const emailInput = useRef();
  const passwordInput = useRef();

  const handleRegister = async (event) => {
    setIsRegistering(true);

    const resp = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
    });
    if (!resp.error) {
      const fileName = `profile-${v4() + Date.now()}.png`;
      let imageresp;
      try {
        const resp1 = await supabase.storage
          .from("profilePics")
          .upload(fileName, user.image);
        // get url to
        imageresp = supabase.storage
          .from("profilePics")
          .getPublicUrl(resp1.data.path);
      } catch (err) {
        console.log(err);
      }

      const userId = resp.data.user.id;
      const resp2 = await supabase
        .from("users")
        .update({
          username: user.username,
          email: user.email,
          profile_pic: imageresp.data.publicUrl,
        })
        .eq("id", userId);

      if (!resp2.error) {
        nav("/home");
      }
    }
    setIsRegistering(false);
  };

  const handleGetImages = (files) => {
    setUser((prevState) => ({
      ...prevState,
      image: files[0],
    }));
  };

  return (
    <div className="container-small" style={{height: '100vh'}}>
      <div className="register">
        <div className="register-form">
          <h2 className="title">Register</h2>
          <p className="subtitle">Create a new account</p>
          <div className="creds-input">
            <label htmlFor="username-input">Username</label>
            <input
              id="username-input"
              type="text"
              placeholder="Username"
              ref={usernameInput}
              onInput={(ev) => {
                ev.target.value === "" || ev.target.value.length < 5
                  ? (usernameError.current.style.display = "flex")
                  : (usernameError.current.style.display = "none");
                setUser({ ...user, username: ev.target.value });
              }}
            />
            <span ref={usernameError} className="error-message">
              {user.username.length < 5 && user.username.length > 0
                ? "Username must be at least 8 characters"
                : "Username field is mandatory"}
            </span>
          </div>
          <div className="creds-input">
            <label htmlFor="email-input">Email</label>
            <input
              id="email-input"
              type="email"
              placeholder="Email"
              ref={emailInput}
              onInput={(ev) => {
                if (ev.target.value === "") {
                  emailError.current.style.display = "flex";
                } else {
                  emailError.current.style.display = "none";
                }
                setUser({ ...user, email: ev.target.value });
              }}
            />
            <span ref={emailError} className="error-message">
              Email field is mandatory
            </span>
          </div>
          <div className="creds-input">
            <label htmlFor="password-input">Password</label>
            <input
              id="password-input"
              type="password"
              placeholder="Password"
              ref={passwordInput}
              onInput={(ev) => {
                ev.target.value === "" || ev.target.value.length < 8
                  ? (passwordError.current.style.display = "flex")
                  : (passwordError.current.style.display = "none");
                setUser({ ...user, password: ev.target.value });
              }}
            />
            <span ref={passwordError} className="error-message">
              {user.password.length < 8 && user.password.length > 0
                ? "Password must be at least 8 characters"
                : "Password field is mandatory"}
            </span>
          </div>
          <div className="profilepic-selector">
            <p>Select profile Picture</p>
            <ImageSelector setImages={handleGetImages} limit={1} />
          </div>
          <Link to={"/login"} className="forgot-link">
            Have an account? Login
          </Link>
          <button
            disabled={
              user.username.length < 5 ||
              user.email === "" ||
              user.password.length < 8
            }
            className="submit-btn"
            onClick={() => handleRegister()}
          >
            {isRegistering ? <LoaderDots /> : "Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
