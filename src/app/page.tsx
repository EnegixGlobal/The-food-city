import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import Items from "./components/Items";
import Process from "./components/Process";
import SpecialOffers from "./components/SpecialOffers";
import BookTableOffer from "./components/BookTableOffer";
import Footer from "./components/Footer";
import BottomCart from "./components/BottomCart";
import BestSellingServer from "./components/server-components/BestSellingServer";
import DosaOffer from "./components/DosaOffer";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-white text-gray-900 antialiased font-sans">
      <Navbar />

      <HeroSection />
      <BestSellingServer />
      <Items />
      <Process />
      <DosaOffer />
      <SpecialOffers />
      <BookTableOffer />
      <Footer />
      <BottomCart />
    </div>
  );
}
