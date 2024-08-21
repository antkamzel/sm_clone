import { configureStore } from '@reduxjs/toolkit';
import postsReducer from './posts/postsSlice';
import userPostsReducer from './posts/userPostsSlice';
import userAuthReducer from './auth/userAuthSlice';

// Create the store and include the postsReducer
const store = configureStore({
  reducer: {
    posts: postsReducer,
    authuser: userAuthReducer,
    userposts: userPostsReducer
  },
});

export default store;
