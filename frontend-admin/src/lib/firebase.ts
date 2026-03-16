// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAA8L3aaJITw3IlpbWkzNZWpmN0vpTHHLk",
  authDomain: "hackathon-426bd.firebaseapp.com",
  projectId: "hackathon-426bd",
  storageBucket: "hackathon-426bd.firebasestorage.app",
  messagingSenderId: "861709779521",
  appId: "1:861709779521:web:f28e214e356544d8a93cc0",
  measurementId: "G-7T0NZL8PML"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Analytics is only supported in browser environments
export const analytics = typeof window !== "undefined" ? isSupported().then(yes => yes ? getAnalytics(app) : null) : null;

export default app;
