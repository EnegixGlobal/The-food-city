import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AlertContainer from "./components/AlertContainer";
import ServiceWorkerRegister from "./components/ServiceWorkerRegister";

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
  themeColor: "#2563eb",
  icons: {
    icon: "/new_logo.png",
    apple: "/new_logo.png",
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
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
