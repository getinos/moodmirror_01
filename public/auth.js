// Import required Firebase modules (using ES modules)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCiLb8FcoU5i098e2ODUUFC8FucrFWvCCs",
    authDomain: "moodmirror-33d1a.firebaseapp.com",
    projectId: "moodmirror-33d1a",
    storageBucket: "moodmirror-33d1a.appspot.com",
    messagingSenderId: "731572845065",
    appId: "1:731572845065:web:0bbb0053540038a3ffd6d8",
    measurementId: "G-S06NK5LYCQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Sign Up function
window.signUp = function () {
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      alert("Signup successful!");
      window.location.href = "dashboard.html"; // redirect to main UI
    })
    .catch((error) => {
      alert("Signup error: " + error.message);
    });
};

// Login function
window.login = function () {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      alert("Login successful!");
      window.location.href = "dashboard.html"; // redirect to main UI
    })
    .catch((error) => {
      alert("Login error: " + error.message);
    });
};

// Logout function
window.logout = function () {
  signOut(auth)
    .then(() => {
      alert("Logged out successfully!");
      window.location.href = "index.html"; // Redirect to the login page or home page
    })
    .catch((error) => {
      alert("Logout error: " + error.message);
    });
};

// Monitor user status
onAuthStateChanged(auth, (user) => {
  const userStatusElement = document.getElementById("user-status");

  if (user) {
    userStatusElement.innerText = "Logged in as " + user.email;
  } else {
    userStatusElement.innerText = "Not logged in";
  }
});
