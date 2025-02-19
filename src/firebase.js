import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, browserLocalPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA-FgO27atz_m4E01851bwEPt3sSM_YQrY",
  authDomain: "tache-collaboratif.firebaseapp.com",
  projectId: "tache-collaboratif",
  storageBucket: "tache-collaboratif.firebasestorage.app",
  messagingSenderId: "878781911993",
  appId: "1:878781911993:web:abc6a8bd040902c54c5c68",
  measurementId: "G-RC2K1MJ4V0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = initializeAuth(app, {
    persistence: browserLocalPersistence
});

export { db, auth };