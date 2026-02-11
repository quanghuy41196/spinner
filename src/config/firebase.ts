import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase configuration
// QUAN TRỌNG: Thay thế bằng config từ Firebase Console
// https://console.firebase.google.com/ > Project Settings > Your apps > Web app
const firebaseConfig = {
  apiKey: "AIzaSyCJMX40rbK7QMD2eIER4HUIrmZfnwE-F6E",
  authDomain: "spinner-15e74.firebaseapp.com",
  databaseURL: "https://spinner-15e74-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "spinner-15e74",
  storageBucket: "spinner-15e74.firebasestorage.app",
  messagingSenderId: "114172999503",
  appId: "1:114172999503:web:8c0ffd36db5a673d1e373a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
export const database = getDatabase(app);

export default app;
