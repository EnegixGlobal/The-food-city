import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AlertContainer from "./components/AlertContainer";
import Pwa from "./components/Pwa";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Food City | Online Food Delivery in Ranchi",
  description: "Delicious food delivered to your doorstep",
  manifest: "/manifest.json",
  themeColor: "#0d6efd",
  icons: {
    icon: [
      { url: "/new_logo.png", sizes: "192x192", type: "image/png" },
      { url: "/new_logo.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/new_logo.png", sizes: "192x192" },
      { url: "/new_logo.png", sizes: "512x512" },
    ],
  },
  applicationName: "The Food City",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "The Food City",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
        <AlertContainer />
        <Pwa />
      </body>
    </html>
  );
}
