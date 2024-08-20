import { configureStore } from '@reduxjs/toolkit';
import postsReducer from './posts/postsStore';
import userAuthReducer from './auth/userAuthStore';

// Create the store and include the postsReducer
const store = configureStore({
  reducer: {
    posts: postsReducer,
    authuser: userAuthReducer
  },
});

export default store;
