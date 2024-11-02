import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';
import { initializeAuth, getReactNativePersistence, GoogleAuthProvider } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDDBhyVfv_xHhbxNTJ-l7H1QPoc8UuR2vo",
  authDomain: "berealdle.firebaseapp.com",
  projectId: "berealdle",
  storageBucket: "berealdle.appspot.com",
  messagingSenderId: "102727303638",
  appId: "1:102727303638:web:35ea473d9accd1d526e477",
  measurementId: "G-RWNKNGQCK9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export { app, db, auth, storage, googleProvider };
