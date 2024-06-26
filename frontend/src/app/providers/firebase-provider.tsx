"use client";

import { useEffect, useState } from "react";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";
import { useSetAtom } from "jotai";
import { firebaseDBAtom } from "@/store";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export default function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [isSetup, setIsSetup] = useState(false);
  const setFirebaseDB = useSetAtom(firebaseDBAtom);

  useEffect(() => {
    const app = initializeApp(firebaseConfig);
    // add data to realtime database
    const db = getDatabase(app);
    // const db = getDatabase();
    // set(ref(db, "rooms/55"), {
    //   username: "asdfasasfdd",
    // });
    setFirebaseDB(db);
    setIsSetup(true);

  }, []);

  return <>{isSetup && children}</>;
}
