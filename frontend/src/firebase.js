// npm install firebase
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCGuhUPhjv67LQxJJHY5mp_O7Vn6QTz1nA",
  authDomain: "web-app-d2eb7.firebaseapp.com",
  projectId: "web-app-d2eb7",
  storageBucket: "web-app-d2eb7.firebasestorage.app",
  messagingSenderId: "821792747555",
  appId: "1:821792747555:web:d99f2a4427745486114196",
  measurementId: "G-R41HFQGFP8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
