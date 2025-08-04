"use client";

import React, { useState, useRef, useEffect } from "react";
import Button from "./Button";
import { FaCartPlus, FaHome, FaSearch, FaUser } from "react-icons/fa";
import Link from "next/link";
import { BiSolidOffer } from "react-icons/bi";
import { FiLogIn } from "react-icons/fi";
import Image from "next/image";
import axios from "axios";
import { useCartStore } from "../zustand/cartStore";
import useUserStore from "../zustand/userStore";
import { useAlertStore } from "../zustand/alertStore";
import SideLogin from "./SideLogin";
import { useRouter } from "next/navigation";

function Navbar() {
  const [userHoverOpen, setUserHoverOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [openLogin, setOpenLogin] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const router = useRouter();

  // Get user from userStore instead of cartStore
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);
  const addAlert = useAlertStore((state) => state.addAlert);

  const handleLogout = async () => {
    try {
      await axios.post("/api/users/logout");
      clearUser();
      setUserHoverOpen(false);
      
      // Show success alert
      addAlert({
        type: 'success',
        title: 'Logged out successfully',
        message: 'You have been logged out of your account.',
        duration: 4000
      });
      router.push("/")
    } catch (error) {
      console.error('Logout error:', error);
      addAlert({
        type: 'error',
        title: 'Logout failed',
        message: 'There was an error logging you out. Please try again.',
        duration: 4000
      });
    }
  };

  // Handle hydration to prevent mismatch
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // useEffect(() => {
  //   // Simulate a login state after 2 seconds
  //   const timer = setTimeout(() => {
  //     setIsLoggedIn(true);
  //   }, 2000);
  //   return () => clearTimeout(timer);
  // }, []);
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
                  className="hover:text-yellow-300 py-6 transition font-bold flex items-center">
                  <span className="h-6 w-6 flex font-bold items-center justify-center mr-1 text-gray-200">
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              ))}
              {!user ? (
                <span
                  className="hover:text-yellow-300 transition font-bold flex items-center cursor-pointer"
                  onClick={() => setOpenLogin(true)}>
                  {" "}
                  <span className="h-6 w-6 flex font-bold items-center justify-center mr-1 text-gray-200">
                    <FaUser />
                  </span>{" "}
                  Login
                </span>
              ) : (
                <div
                  className="relative"
                  onMouseEnter={() => setUserHoverOpen(true)}
                  onMouseLeave={() => setUserHoverOpen(false)}>
                  <span className="hover:text-yellow-300 transition font-bold flex items-center cursor-pointer">
                    <span className="h-6 w-6 flex font-bold items-center justify-center mr-1 text-gray-200">
                      <FaUser />
                    </span>
                    <span className="py-4">
                      {isHydrated ? user?.name || user?.phone : "User"}
                    </span>
                  </span>

                  {userHoverOpen && (
                    <div className="absolute top-full -left-14  w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 transform transition-all duration-200 ease-out opacity-100 scale-100">
                      {/* Arrow pointer */}
                      <div className="absolute -top-2 left-25 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45"></div>

                      <div className="py-3">
                        {/* User info header */}
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-800">
                            {user?.name || "User"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {user?.phone || user?.email}
                          </p>
                        </div>

                        {/* Menu items */}
                        <ul className="py-1">
                          <li>
                            <Link
                              href="/my-account"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-700 transition-all duration-150">
                              <FaUser className="w-4 h-4 mr-3 text-gray-400" />
                              My Account
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/my-account/orders"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-700 transition-all duration-150">
                              <svg
                                className="w-4 h-4 mr-3 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                />
                              </svg>
                              My Orders
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/my-account/settings"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-700 transition-all duration-150">
                              <svg
                                className="w-4 h-4 mr-3 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                              Settings
                            </Link>
                          </li>

                          {/* Divider */}
                          <div className="border-t border-gray-100 my-1"></div>

                          <li>
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-150">
                              <svg
                                className="w-4 h-4 mr-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                              </svg>
                              Logout
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <Link href="/cart" className="relative">
                <Button className="flex items-center justify-center gap-2">
                  <FaCartPlus /> Cart
                </Button>
                <span className="h-5 w-5 absolute right-7 -top-3 bg-red-400 rounded-full flex items-center justify-center text-xs font-bold">
                  {isHydrated ? getTotalItems() : 0}
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
              <Link href="/cart" className="relative">
                <span className="text-2xl">
                  <FaCartPlus />
                </span>
                <span className="h-4 w-4 absolute -right-2 -top-2 bg-red-400 rounded-full flex items-center justify-center text-xs font-bold">
                  {isHydrated ? getTotalItems() : 0}
                </span>
              </Link>
              {!user ? (
                <span onClick={() => setOpenLogin(true)} className="text-2xl">
                  <FaUser />
                </span>
              ) : (
                <Link href="/my-account">
                  <span className="text-2xl">
                    <FaUser />
                  </span>
                </Link>
              )}
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
              <span
                onCopy={(e) => e.preventDefault()}
                onContextMenu={(e) => e.preventDefault()}
                className="text-2xl font-bold select-none">
                The Food City
              </span>
            </div>

            {/* User Section */}
            {user ? (
              <div className="border-t border-red-800 p-4">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-red-700 rounded-full flex items-center justify-center mr-3">
                    <FaUser className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">{user.name || "User"}</p>
                    <p className="text-sm text-red-200">{user.phone || user.email}</p>
                  </div>
                </div>
                
                {/* User Menu Items */}
                <Link
                  href="/my-account"
                  className="flex items-center px-4 py-3 hover:bg-red-800 transition rounded"
                  onClick={() => setIsOpen(false)}>
                  <FaUser className="h-5 w-5 mr-3 text-gray-400" />
                  My Account
                </Link>
                <Link
                  href="/my-account/orders"
                  className="flex items-center px-4 py-3 hover:bg-red-800 transition rounded"
                  onClick={() => setIsOpen(false)}>
                  <svg
                    className="w-5 h-5 mr-3 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  My Orders
                </Link>
                <Link
                  href="/my-account/addresses"
                  className="flex items-center px-4 py-3 hover:bg-red-800 transition rounded"
                  onClick={() => setIsOpen(false)}>
                  <svg
                    className="w-5 h-5 mr-3 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  My Addresses
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-3 hover:bg-red-800 transition rounded text-red-300">
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            ) : (
              <button
                className="flex text-lg font-bold py-4 items-center justify-center gap-3 px-6  border-t border-red-800 hover:bg-red-800 transition"
                onClick={() => {
                  setOpenLogin(true);
                  setIsOpen(false);
                }}>
                <FiLogIn className="h-6 w-6" /> Login
              </button>
            )}

            {/* Navigation Links */}
            <div className="border-t border-red-800 mt-4">
              <Link
                href="/"
                className="px-6 py-3 hover:bg-red-600 transition flex items-center"
                onClick={() => setIsOpen(false)}>
                <FaHome className="h-5 w-5 mr-2 text-gray-400" />
                Home
              </Link>
              <Link
                href="/offers"
                className="block px-6 py-3 border-t border-red-600 hover:bg-red-600 transition"
                onClick={() => setIsOpen(false)}>
                <BiSolidOffer className="h-5 w-5 mr-2 text-gray-400 inline" />
                Offers
              </Link>
              <Link href="/cart" onClick={() => setIsOpen(false)}>
                <Button className="py-2 mt-2 px-20 ml-4">
                  Cart ({isHydrated ? getTotalItems() : 0})
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {openLogin && !user && (
        <SideLogin isOpen={openLogin} onClose={() => setOpenLogin(false)} />
      )}
    </>
  );
}

export default Navbar;
