"use client";

import { mongoDBAtom } from "@/store";
import { useAtom } from "jotai";
import { MongoClient } from "mongodb";
import { useEffect, useState } from "react";

// import { MongoClient } from 'mongodb'

// Connection URL
const url = process.env.NEXT_PUBLIC_MONGODB_URL || "mongodb://localhost:27017";
const client = new MongoClient(url);

export default function MongoDBProvider({ children }: { children: React.ReactNode }) {
  const [isSetup, setIsSetup] = useState(false);
  const [mongoDB, setMongoDB] = useAtom(mongoDBAtom);

  useEffect(() => {
    async function setup() {
      try {
        await client.connect();
        console.log("Connected successfully to server");
        setMongoDB(client);
        setIsSetup(true);
      } catch (err) {
        console.error("Error connecting to server", err);
      }
    }

    setup();

    return () => {
      client.close();
    };
  });

  return <>{children}</>;
}
