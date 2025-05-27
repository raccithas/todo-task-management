// Import the functions you need from the SDKs you need
import { initializeApp } from "@firebase/app";
import { getDatabase } from "@firebase/database";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider  } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyANXF2brl6tdcDR4ZCiPeO0YmV4MjkYCRo",
  authDomain: "todo-app-e484f.firebaseapp.com",
  databaseURL: "https://todo-app-e484f-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "todo-app-e484f",
  storageBucket: "todo-app-e484f.firebasestorage.app",
  messagingSenderId: "1036902971839",
  appId: "1:1036902971839:web:feb6fb8df9fe0efdbf890a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const database = getDatabase(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();