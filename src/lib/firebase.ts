import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FB_APIKEY!,
  authDomain: process.env.NEXT_PUBLIC_FB_AUTH!,
  projectId: process.env.NEXT_PUBLIC_FB_PID!,
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); 