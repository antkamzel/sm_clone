import React, { useRef, useState } from "react";
import "./Login.scss";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../clients/SupabaseClient";
import { IoClose } from "react-icons/io5";
import PopupOverlay from "../../comp/PopupOverlay/PopupOverlay";
import LoaderDots from "../../comp/LoaderDots/LoaderDots";
import { setUser } from '../../state/auth/userAuthStore';
import { useDispatch } from "react-redux";

const Login = () => {
  const wrongCredentialsPopupRef = useRef();
  const dispatch = useDispatch();

  const nav = useNavigate();

  const [creds, setCreds] = useState({
    email: "",
    password: "",
  });

  const [isLogging, setIsLogging] = useState(false);

  const handleLogin = async () => {
    setIsLogging(true);
    const resp = await supabase.auth.signInWithPassword({
      email: creds.email,
      password: creds.password,
    });
    setIsLogging(false);
    if (resp.data.user) {
      const resp2 = await supabase.from('users').select().eq('id', resp.data.user.id).single();
      if(!resp.error){
        let useritem = {...resp2.data, ...resp.data.user};
        dispatch(setUser(useritem));
      }
      nav("/home", { replace: true });
      return;
    }
    wrongCredentialsPopupRef.current.classList.add("overlay-visible");
  };

  return (
    <div className="container-small" style={{height: '100vh'}}>
      <div className="login">
        <div className="login-intro">
          <h2>Welcome to this demo app</h2>
        </div>
        <div className="login-form">
          <h2 className="title">Log in</h2>
          <p className="subtitle">Login to your account</p>
          <div className="creds-input">
            <label htmlFor="username-input">Email</label>
            <input
              id="username-input"
              type="text"
              placeholder="Email"
              onInput={(ev) => {
                setCreds({ ...creds, email: ev.target.value });
              }}
            />
          </div>
          <div className="creds-input">
            <label htmlFor="password-input">Password</label>
            <input
              id="password-input"
              type="password"
              placeholder="Password"
              onInput={(ev) => {
                setCreds({ ...creds, password: ev.target.value });
              }}
            />
          </div>
          <Link to={"/register"} className="forgot-link">
            Don't have an account? Sign Up
          </Link>
          <button className="submit-btn btn" onClick={() => handleLogin()}>
            {isLogging ? <LoaderDots /> : "Login"}
          </button>
        </div>

        <PopupOverlay
          ref={wrongCredentialsPopupRef}
          popupTitle={"Wrong Credentials"}
          popupTexts={[
            "A user with the credentials you provided does not exist!",
          ]}
        />
      </div>
    </div>
  );
};

export default Login;
