
'use client';

import dynamic from 'next/dynamic';
import Footer from "./components/Footer";
import Process from "./components/Process";

// Dynamically import components that use client-side features
const Navbar = dynamic(() => import("./components/Navbar"), { ssr: false });
const HeroSection = dynamic(() => import("./components/HeroSection"), { ssr: false });
const Items = dynamic(() => import("./components/Items"), { ssr: false });
const SpecialOffers = dynamic(() => import("./components/SpecialOffers"), { ssr: false });

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-white text-gray-900 antialiased font-sans">
      <Navbar />
      <HeroSection />
      <Items />
      <Process />
      <SpecialOffers />
      <Footer />

    </div>
  );
}
