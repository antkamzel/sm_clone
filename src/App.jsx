import React, { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "./clients/SupabaseClient";
import { setUser } from "./state/auth/userAuthSlice";
import { useDispatch } from "react-redux";

const App = () => {
  const nav = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const resp = await supabase.auth.getSession();
    const userIsAuthenticated = !!resp.data.session;

    const publicPaths = ["/login", "/register", "/"]; // Paths that don't require authentication
    const currentPath = location.pathname;

    const isInPublicPath = publicPaths.includes(currentPath);

    if (userIsAuthenticated) {
      const userresp = await supabase
        .from("users")
        .select()
        .eq("id", resp.data.session.user.id)
        .single();
      let useritem = { ...userresp.data, ...resp.data.session.user };
      dispatch(setUser(useritem));
      if (isInPublicPath) {
        nav("/home", { replace: true });
      }
    } else {
      nav("/login");
    }
  };

  return (
    <div className="app" id="app">
      <div className="container">
        <Outlet />
      </div>
    </div>
  );
};

export default App;
