// "use client";

import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import IndianServer from "./components/server-components/IndianServer";
import HeroSection from "./components/HeroSection";
import Items from "./components/Items";
import Process from "./components/Process";
import SpecialOffers from "./components/SpecialOffers";
import Footer from "./components/Footer";
import BottomCart from "./components/BottomCart";


export default function Home() {
  return (
    <div className="min-h-screen w-full bg-white text-gray-900 antialiased font-sans">

      <Navbar />
      <Toaster position="top-right" reverseOrder={false} />
      <HeroSection />
      <Items />
      <Process />
      <SpecialOffers />
      <Footer />
      <BottomCart />
    </div>
  );
}
