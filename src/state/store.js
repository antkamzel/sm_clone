import { configureStore } from '@reduxjs/toolkit';
import postsReducer from './posts/postsStore';

// Create the store and include the postsReducer
const store = configureStore({
  reducer: {
    posts: postsReducer
  },
});

export default store;
