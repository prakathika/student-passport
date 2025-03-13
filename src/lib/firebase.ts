
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCV9ENzXh99Xtc5SVEjLNxJY3QNbFTUVdg",
  authDomain: "gatepass-32a3d.firebaseapp.com",
  projectId: "gatepass-32a3d",
  storageBucket: "gatepass-32a3d.firebasestorage.app",
  messagingSenderId: "67356066147",
  appId: "1:67356066147:web:ab491aa60df202e3731356",
  measurementId: "G-2ZC01B7Y1S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { auth, firestore, storage, googleProvider, analytics };
