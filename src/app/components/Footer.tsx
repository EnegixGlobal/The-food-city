import React from "react";
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";
import Container from "./Container";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-[#471419] text-white pb-6">
      {/* Container Wrapper */}
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1: About */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4 border-b-2 border-yellow-400 pb-2 inline-block">
              The Food City
            </h3>
            <p className="mb-4 font-medium">
              Delivering delicious meals straight to your doorstep. Fast, fresh,
              and flavorful in Ranchi!
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-white hover:text-yellow-400 transition">
                <FaFacebook size={20} />
              </a>
              <a
                href="#"
                className="text-white hover:text-yellow-400 transition">
                <FaInstagram size={20} />
              </a>
              <a
                href="#"
                className="text-white hover:text-yellow-400 transition">
                <FaTwitter size={20} />
              </a>
              <a
                href="#"
                className="text-white hover:text-yellow-400 transition">
                <FaYoutube size={20} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4 border-b-2 border-yellow-400 pb-2 inline-block">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="font-medium hover:text-yellow-400 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  className="font-medium hover:text-yellow-400 transition">
                  Menu
                </Link>
              </li>
              <li>
                <Link
                  href="/offers"
                  className="font-medium hover:text-yellow-400 transition">
                  Offers
                </Link>
              </li>
              <li>
                <Link
                  href="/#about"
                  className="font-medium hover:text-yellow-400 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/#contact"
                  className="font-medium hover:text-yellow-400 transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/career"
                  className="font-medium hover:text-yellow-400 transition">
                  Career
                </Link>
              </li>
              <li className="font-thin">
                <Link
                  href="/admin"
                  className="hover:text-yellow-400 transition font-thin">
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4 border-b-2 border-yellow-400 pb-2 inline-block">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center font-medium">
                <FaMapMarkerAlt className="mr-2 text-yellow-400" />
                Ground Floor, beside Apsara Hotel, P&T Colony, Lalpur, Ranchi, Jharkhand 834001
              </li>
              <li className="flex items-center font-medium">
                <FaPhone className="mr-2 text-yellow-400" />
                <a href="tel:9386372101" className="hover:text-yellow-400 transition">93863 72101</a>
              </li>
              <li className="flex items-center font-medium">
                <FaEnvelope className="mr-2 text-yellow-400" />
                <a href="mailto:tfc.25nov2024@gmail.com" className="hover:text-yellow-400 transition">tfc.25nov2024@gmail.com</a>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4 border-b-2 border-yellow-400 pb-2 inline-block">
              Newsletter
            </h3>
            <p className="font-medium mb-4">
              Subscribe for exclusive deals & updates!
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your Email"
                className="px-4 py-2 rounded-l-lg focus:outline-none w-full text-gray-800"
              />
              <button className="bg-yellow-400 hover:bg-yellow-500 text-red-900 font-bold px-4 py-2 rounded-r-lg transition">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Legal */}
        <div className="flex border-t border-red-800 items-center justify-between text-sm">
          <div className="pt-6">
            <p className="font-bold">
              © {new Date().getFullYear()} The Food City. All Rights Reserved.
            </p>
            <div className="flex justify-center space-x-6 mt-4">
              <Link
                href="/privacy-policy"
                className="font-medium hover:text-yellow-400 transition">
                Privacy Policy
              </Link>
              <Link
                href="/terms-and-conditions"
                className="font-medium hover:text-yellow-400 transition">
                Terms of Service
              </Link>
              <Link
                href="/shipping-policy"
                className="font-medium hover:text-yellow-400 transition">
                Shipping Policy
              </Link>
              <a
                href="#"
                className="font-medium hover:text-yellow-400 transition">
                FAQ
              </a>
            </div>
            <p className="font-medium mt-4">
              We accept payments via{" "}
              <a
                href="https://business.phonepe.com/"
                target="_blank"
                className="font-bold hover:text-yellow-400 transition"
              >
                PhonePe Payment Gateway
              </a>
              
          
            </p>
          </div>
          <div>
            <p className="text-center text-sm text-gray-400 mt-4">
              Designed and Developed by{" "}
              <Link
                className="font-bold text-gray-100"
                target="_blank"
                href="https://www.enegixwebsolutions.com"
              >
                Enegix Web Solutions
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;