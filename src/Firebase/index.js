// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCdUIGiKAUa3BnhO8TVqhzBJfuGGtYOalA",
  authDomain: "minicapstone-3f9dc.firebaseapp.com",
  projectId: "minicapstone-3f9dc",
  storageBucket: "minicapstone-3f9dc.appspot.com",
  messagingSenderId: "349476863106",
  appId: "1:349476863106:web:da270a759c046d7c53089b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { db };
export { auth };