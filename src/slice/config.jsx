// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCrzj1mD0cna6_J4TciaLwiPbsM1OjrWpk",
  authDomain: "instagram-382c7.firebaseapp.com",
  projectId: "instagram-382c7",
  storageBucket: "instagram-382c7.appspot.com",
  messagingSenderId: "956928595734",
  appId: "1:956928595734:web:9b99a3701d01a2489ba237",
  databaseURL: "https://instagram-382c7-default-rtdb.firebaseio.com",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const auth = getAuth();

export const db = getFirestore(app);
// onAuthStateChanged(auth, (user) => {
//     if (user) {
//       console.log('User is signed in:', user.uid);
//     } else {
//       console.log('User is not signed in.');
//       window.location.href = '/login'; // Redirect to login page if not signed in
//     }
//   });

export const GoogleAuth = async () => {
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(auth, provider);
};

export const Logout = () => {
  return auth.signOut();
};


export const EmailLogin = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};
