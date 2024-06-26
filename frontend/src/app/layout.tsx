import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./_components/header";
import FirebaseProvider from "./providers/firebase-provider";
import { Toaster } from "@/components/ui/sonner";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Thumbs Up!",
  description: "Super safe simple voting app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FirebaseProvider>
          <main className="mx-auto max-w-4xl p-4  h-screen flex flex-col">
            <Header />
            <div className="flex-1">{children}</div>
          </main>
          <Toaster />
        </FirebaseProvider>
      </body>
    </html>
  );
}
