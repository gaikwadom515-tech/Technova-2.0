// src/firebase/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDE_Q4fOADtmOd0tsenrNeN_E-ksoRZFes",
  authDomain: "swiftaid-e8fea.firebaseapp.com",
  projectId: "swiftaid-e8fea",
  storageBucket: "swiftaid-e8fea.firebasestorage.app",
  messagingSenderId: "634385790849",
  appId: "1:634385790849:web:4031bceedb4bd0aaa09a80"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore Database
export const db = getFirestore(app);

// Initialize Authentication
export const auth = getAuth(app);

export default app;