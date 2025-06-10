// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAQBNM35CYiJP2GVTW1kseAtg5Z6z1-Cqo",
  authDomain: "aniaffinity.firebaseapp.com",
  projectId: "aniaffinity",
  storageBucket: "aniaffinity.firebasestorage.app",
  messagingSenderId: "456093201474",
  appId: "1:456093201474:web:54e263e2b13e66e61329db"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);