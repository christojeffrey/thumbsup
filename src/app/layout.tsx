import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./_components/header";
import MongoDBProvider from "./providers/mongodb-providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MongoDBProvider>
          <main className="max-w-4xl p-4  h-screen flex flex-col">
            <Header />
            <div className="flex-1">{children}</div>
          </main>
        </MongoDBProvider>
      </body>
    </html>
  );
}
