import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './clients/SupabaseClient';

const App = () => {
  const nav = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const resp = await supabase.auth.getSession();
    const userIsAuthenticated = !!(resp.data.session);

    const publicPaths = ["/login", "/register", "/"]; // Paths that don't require authentication
    const currentPath = location.pathname;

    if (!userIsAuthenticated && !publicPaths.includes(currentPath)) {
      nav('/login', { replace: true });
    } else if (userIsAuthenticated && publicPaths.includes(currentPath)) {
      nav('/home', { replace: true });
    }
  };

  return (
    <div className='app' id='app'>
      <div className="container">
        <Outlet />
      </div>
    </div>
  );
};

export default App;
