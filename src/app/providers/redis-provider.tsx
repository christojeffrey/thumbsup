"use client";

import { useEffect, useState } from "react";
import { createClient } from "redis";
const REDIS_URL = process.env.NEXT_PUBLIC_REDIS_URL || "redis://localhost:6379";

export default function RedisProvider({ children }: { children: React.ReactNode }) {
  const [isSetup, setIsSetup] = useState(false);
  useEffect(() => {
    let client: any;

    async function setup() {
      client = await createClient({
        url: REDIS_URL,
      })
        .on("error", (err) => console.log("Redis Client Error", err))
        .connect();

      await client.set("key", "value");
      const value = await client.get("key");
      console.log("setup done");
      console.log("value", value);
      setIsSetup(true);
    }

    setup();

    return () => {
      client?.disconnect();
    };
  });

  return <>{isSetup && children}</>;
}
