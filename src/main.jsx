import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import "./index.scss";
import Home from "./pages/Home/Home.jsx";
import Login from "./pages/Login/Login.jsx";
import Notifications from "./pages/Notifications/Notifications.jsx";
import Register from "./pages/Register/Register.jsx";
import App from "./App.jsx";
import NewPost from "./pages/NewPost/NewPost.jsx";
import { Provider } from "react-redux";
import store from "./state/store.js";
import Profile from "./pages/Profile/Profile.jsx";
import Posts from "./pages/Posts/Posts.jsx";
import NotFound404 from "./pages/404/404.jsx";
import Search from "./pages/Search/Search.jsx";

document.body.setAttribute(
  "class",
  window.localStorage.getItem("theme") || "dark-theme"
);

const router = createBrowserRouter([
  {
    path: "/", // Root path
    element: <App />, // Main application wrapper
    children: [
      {
        path: "*",
        element: <NotFound404 />, // Catch-all for 404 pages
      },
      {
        path: "home",
        element: <Home />, // Home page route
        children: [
          {
            path: "search", // Child route for Search page
            element: <Search />,
          },
        ],
      },
      {
        path: "profile",
        element: <Profile />, // Profile page route
      },
      {
        path: "posts/:postid",
        element: <Posts />, // Dynamic route for individual posts
      },
      {
        path: "notifications",
        element: <Notifications />, // Notifications page route
      },
      {
        path: "new-post",
        element: <NewPost />, // New post creation page route
      },
      {
        path: "login",
        element: <Login />, // Login page route
      },
      {
        path: "register",
        element: <Register />, // Registration page route
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);
