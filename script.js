// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCiLb8FcoU5i098e2ODUUFC8FucrFWvCCs",
  authDomain: "moodmirror-33d1a.firebaseapp.com",
  projectId: "moodmirror-33d1a",
  storageBucket: "moodmirror-33d1a.firebasestorage.app",
  messagingSenderId: "731572845065",
  appId: "1:731572845065:web:0bbb0053540038a3ffd6d8",
  measurementId: "G-S06NK5LYCQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);