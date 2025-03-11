import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/core/header/Header";
import Footer from "@/components/core/footer/Footer";
import { connectToDatabase } from "@/lib/db";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cuisine Cart | Taste of Home",
  description:
    "Cuisine Cart connects international students, workers, and food enthusiasts to home-cooked meals made with love and authenticity.",
};



export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
      await connectToDatabase();
  
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} flex flex-col min-h-screen`}>
        <Header />
        <div className="flex-grow">

        {children}
        </div>
        <Toaster position="top-right" richColors />
        <Footer />
      </body>
    </html>
  );
}
