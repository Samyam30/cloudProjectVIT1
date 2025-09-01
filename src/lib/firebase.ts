import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  "projectId": "fortress-auth-limmc",
  "appId": "1:927412196214:web:82e4c38a22758704c06057",
  "storageBucket": "fortress-auth-limmc.appspot.com",
  "apiKey": process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCHcx50rmOEv5WjlmoDjHvwHuZcLiMgMfE",
  "authDomain": "fortress-auth-limmc.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "927412196214"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
