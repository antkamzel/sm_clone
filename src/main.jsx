import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate
} from "react-router-dom";
import './index.scss';
import Home from './pages/Home/Home.jsx';
import Login from './pages/Login/Login.jsx';
import Notifications from './pages/Notifications/Notifications.jsx';
import Register from './pages/Register/Register.jsx';
import App from './App.jsx';
import NewPost from './pages/NewPost/NewPost.jsx';


document.body.setAttribute('class', window.localStorage.getItem('theme') || 'dark-theme');

const router = createBrowserRouter([
  {
    path: "/", // Root path
    element: <App/>,
    children: [
      {
        path: "",
        element: <Navigate to="login" />, // Redirect from "/" to "/login"
      },
      {
        path: "home",
        element: <Home/>,
      },
      {
        path: "notifications",
        element: <Notifications/>,
      },
      {
        path: "new-post",
        element: <NewPost/>,
      },
      {
        path: "login",
        element: <Login/>
      },
      {
        path: "register",
        element: <Register/>
      },
    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
);
