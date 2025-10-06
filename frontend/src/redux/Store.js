import authReducer from './auth/AuthReducer';
import { combineReducers } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './chat/ChatReducer';
import messageReducer from './message/MessageReducer';

const rootReducer = combineReducers({
  auth: authReducer,
  chat: chatReducer,
  message: messageReducer
});

export const store = configureStore({
  reducer: rootReducer
});
