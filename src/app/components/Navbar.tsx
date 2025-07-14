"use client";

import React, { useState, useRef, useEffect } from "react";
import Button from "./Button";
import { FaCartPlus, FaHome, FaPhone, FaSearch, FaUser } from "react-icons/fa";
import Link from "next/link";
import { BiSolidOffer } from "react-icons/bi";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const navlinks = [
    {
      name: "Search",
      href: "/search",
      icon: <FaSearch />,
    },
    {
      name: "Offers",
      href: "/offers",
      icon: <BiSolidOffer />,
    },
    {
      name: "Sign In",
      href: "/login",
      icon: <FaUser />,
    },
  ];

  return (
    <>
      <nav className="bg-gradient-to-r from-[#550000] to-red-900 text-white shadow-xl sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            {/* Logo with Categories */}
            <div className="flex items-center space-x-6">
              <Link href="/">
                <div className="flex items-center">
                  <div className="flex items-center justify-center bg-white text-red-600 rounded-full w-12 h-12 font-bold text-2xl mr-3">
                    <span className="transform -rotate-12">TFC</span>
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight hidden sm:block">
                    The Food City
                  </h1>
                </div>
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              {navlinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="hover:text-yellow-300 transition font-bold flex items-center">
                  <span className="h-6 w-6 flex font-bold items-center justify-center mr-1 text-gray-200">
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              ))}
              <Link href="/cart" className="relative">
                <Button className="flex items-center justify-center gap-2">
                  <FaCartPlus /> Cart
                </Button>
                <span className="h-5 w-5 absolute right-7 -top-3 bg-red-400 rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </span>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center justify-center gap-6">
              <Link href="/search">
                <span className="text-2xl">
                  <FaSearch />
                </span>
              </Link>
              <Link href="/cart">
                <span className="text-2xl">
                  <FaCartPlus />
                </span>
              </Link>
              <button
                className=" focus:outline-none p-2 rounded-full bg-red-700 hover:bg-red-800"
                onClick={() => setIsOpen(!isOpen)}>
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={
                      isOpen
                        ? "M6 18L18 6M6 6l12 12"
                        : "M4 6h16M4 12h16M4 18h16"
                    }
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-50">
          <div
            ref={menuRef}
            className="w-3/4 h-screen text-white bg-red-900 rounded-r-lg shadow-lg overflow-auto">
            <h2 className="text-2xl font-bold p-4">The Food City</h2>
            <Link
              href="/"
              className="px-6 py-3 hover:bg-red-600 transition flex items-center"
              onClick={() => setIsOpen(false)}>
              <FaHome className="h-5 w-5 mr-2 text-gray-400" />
              Home
            </Link>
            <div className="border-t border-red-800"></div>
            <Link
              href="/about"
              className="block px-6 py-3 border-t border-red-800 hover:bg-red-800 transition"
              onClick={() => setIsOpen(false)}>
              <FaUser className="h-5 w-5 mr-2 text-gray-400 inline" />
              About
            </Link>
            <Link
              href="/contact"
              className="block px-6 py-3 border-t border-red-600 hover:bg-red-600 transition"
              onClick={() => setIsOpen(false)}>
              <FaPhone className="h-5 w-5 mr-2 text-gray-400 inline" />
              Contact
            </Link>
            <Link href="/cart" onClick={() => setIsOpen(false)}>
              <Button className=" py-2 mt-2 px-20 ml-4">Cart</Button>
            </Link>

            {/* {isLoggedIn && (
              <button className="block px-6 py-3 border-t border-red-800 hover:bg-red-800 transition">
                Log out
              </button>
            )} */}
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
