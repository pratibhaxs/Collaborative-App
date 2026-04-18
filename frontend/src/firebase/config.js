import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBGDhkjVEZpGc-f1UYZfxb9t1xzdltYwV4",
  authDomain: "collaborative-app-eb63d.firebaseapp.com",
  databaseURL: "https://collaborative-app-eb63d-default-rtdb.firebaseio.com",
  projectId: "collaborative-app-eb63d",
  storageBucket: "collaborative-app-eb63d.firebasestorage.app",
  messagingSenderId: "835685080023",
  appId: "1:835685080023:web:5167ea189f36210f8c4992"
};

const app         = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getDatabase(app);