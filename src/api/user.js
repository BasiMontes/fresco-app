// src/api/user.js
import { auth } from './firebaseClient';

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const onAuthStateChanged = (callback) => {
  return auth.onAuthStateChanged(callback);
};