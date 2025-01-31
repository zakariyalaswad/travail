import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, browserLocalPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDN41JWsp08ygrVHFk-8kza3xqcu8d47AU",
  authDomain: "travail-d8e57.firebaseapp.com",
  databaseURL: "https://travail-d8e57-default-rtdb.firebaseio.com",
  projectId: "travail-d8e57",
  storageBucket: "travail-d8e57.firebasestorage.app",
  messagingSenderId: "591570363",
  appId: "1:591570363:web:7162b3f2a7ab40d6fbd09e",
  measurementId: "G-CVQRF717LL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = initializeAuth(app, {
    persistence: browserLocalPersistence
});

export { db, auth };