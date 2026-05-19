import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCNScDCD9hwG_Le5LQoFcGnvLG6As7yvxc",
  authDomain: "twitter-clone-7f145.firebaseapp.com",
  projectId: "twitter-clone-7f145",
  storageBucket: "twitter-clone-7f145.appspot.com",
  messagingSenderId: "889354913324",
  appId: "1:889354913324:web:77518af49573f0e06fb389",
  measurementId: "G-7ST6YNN7HZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export default auth;
