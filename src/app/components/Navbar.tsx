"use client";

import React, { useState, useRef, useEffect } from "react";
import Button from "./Button";
import { FaCartPlus, FaHome, FaSearch, FaUser } from "react-icons/fa";
import Link from "next/link";
import { BiSolidOffer } from "react-icons/bi";
import SideLogin from "./SideLogin";
import { FiLogIn } from "react-icons/fi";
import Image from "next/image";
import { useCartStore } from "../zustand/cartStore";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [openLogin, setOpenLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const getTotalItems = useCartStore((state) => state.getTotalItems);

  // Simulating a logged-in state for demonstration

  console.log(getTotalItems());

  useEffect(() => {
    // Simulate a login state after 2 seconds
    const timer = setTimeout(() => {
      setIsLoggedIn(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);
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
                  <Image
                    src="/logo.png"
                    alt="Food City Logo"
                    width={60}
                    height={60}
                    className="transform -rotate-12 mr-3"
                  />

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
              <span
                className="hover:text-yellow-300 transition font-bold flex items-center cursor-pointer"
                onClick={() => setOpenLogin(true)}>
                {" "}
                <span className="h-6 w-6 flex font-bold items-center justify-center mr-1 text-gray-200">
                  <FaUser />
                </span>{" "}
                Login
              </span>
              <Link href="/cart" className="relative">
                <Button className="flex items-center justify-center gap-2">
                  <FaCartPlus /> Cart
                </Button>
                <span className="h-5 w-5 absolute right-7 -top-3 bg-red-400 rounded-full flex items-center justify-center text-xs font-bold">
                  {getTotalItems()}
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
              <span onClick={() => setOpenLogin(true)} className="text-2xl">
                <FaUser />
              </span>
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
        <div className="md:hidden fixed  inset-0 bg-black/50 z-50">
          <div
            ref={menuRef}
            className="w-3/4 h-screen text-white bg-red-900 rounded-r-lg shadow-lg overflow-auto">
            <div className="p-5 flex items-center justify-left">
              <Image
                src="/logo.png"
                alt="The Food City"
                width={40}
                height={40}
                className=" inline-block mr-3 -rotate-12"
              />
              <span className="text-2xl font-bold ">The Food City</span>
            </div>
            {!isLoggedIn && (
              <button
                className="flex text-lg font-bold py-4 items-center justify-center gap-3 px-6  border-t border-red-800 hover:bg-red-800 transition"
                onClick={() => setOpenLogin(true)}>
                <FiLogIn className="h-6 w-6" /> Login
              </button>
            )}
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
              href="/offers"
              className="block px-6 py-3 border-t border-red-600 hover:bg-red-600 transition"
              onClick={() => setIsOpen(false)}>
              <BiSolidOffer className="h-5 w-5 mr-2 text-gray-400 inline" />
              Offers
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
          <button onClick={() => setOpenLogin(true)}>Login</button>
        </div>
      )}

      {openLogin && (
        <SideLogin isOpen={openLogin} onClose={() => setOpenLogin(false)} />
      )}
    </>
  );
}

export default Navbar;
