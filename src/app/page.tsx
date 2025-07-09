
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import Items from "./components/Items";
import Process from "./components/Process";

export default function Home() {
  return <div className="min-h-screen w-full bg-white text-gray-900 antialiased font-sans">
    <Navbar/>
    <HeroSection/>
    <Items/>
    <Process/>
  </div>;
}
