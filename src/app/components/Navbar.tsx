"use client";

import React, { useState } from "react";
import Button from "./Button";
import { FaHome, FaPhone, FaUser } from "react-icons/fa";
import Link from "next/link";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const menuItems = {
    Indian: ["Paneer Tikka", "Biryani", "Naan", "Butter Chicken"],
    Chinese: ["Manchurian", "Fried Rice", "Noodles", "Spring Rolls"],
    "South Indian": ["Dosa", "Idli", "Sambar Vada", "Uttapam"],
    Tandoor: ["Tandoori Chicken", "Seekh Kebab", "Afghani Chicken"],
    Desserts: ["Gulab Jamun", "Rasmalai", "Kheer"],
  };

  const navlinks = [
    {
      name: "Home",
      href: "/",
      icon: <FaHome />,
    },
    {
      name: "About",
      href: "/about",
      icon: <FaUser />,
    },
    {
      name: "Contact",
      href: "/contact",
      icon: <FaPhone />,
    },
  ];

  type Category = keyof typeof menuItems;

  const toggleDropdown = (category: Category) => {
    setActiveDropdown(activeDropdown === category ? null : category);
  };

  return (
    <nav className="bg-gradient-to-r from-[#550000] to-red-900 text-white shadow-xl sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo with Categories */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <div className="flex items-center justify-center bg-white text-red-600 rounded-full w-12 h-12 font-bold text-2xl mr-3">
                <span className="transform -rotate-12">TFC</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight hidden sm:block">
                The Food City
              </h1>
            </div>

            {/* Desktop Categories Dropdown */}
            <div className="hidden lg:flex items-center space-x-1">
              <div className="relative group">
                <button className="flex items-center px-3 py-2 rounded-full bg-red-700 hover:bg-red-800 transition-all">
                  <span>Categories</span>
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div className="absolute left-0 mt-2 w-64 bg-white text-gray-800 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 -translate-y-2">
                  {Object.keys(menuItems).map((category) => (
                    <div
                      key={category}
                      className="border-b border-gray-100 last:border-0">
                      <button
                        className="w-full text-left px-4 py-3 hover:bg-red-50 flex justify-between items-center"
                        onClick={() => toggleDropdown(category as Category)}>
                        <span>{category}</span>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                      {activeDropdown === category && (
                        <div className="bg-gray-50 rounded-b-lg">
                          {menuItems[category as Category].map((item) => (
                            <a
                              key={item}
                              href="#"
                              className="block px-6 py-2 text-sm hover:bg-red-100 transition">
                              {item}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navlinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className=" hover:text-yellow-300 transition flex items-center">
                <span className="h-5 w-5 flex items-center justify-center mr-2 text-gray-400">
                  {item.icon}
                </span>
                {item.name}
              </a>
            ))}
            <Button>Order Now</Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden focus:outline-none p-2 rounded-full bg-red-700 hover:bg-red-800"
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
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-red-700 rounded-lg shadow-lg mb-2 overflow-hidden">
            <Link 
              href="/"
              className=" px-6 py-3 hover:bg-red-600 transition flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Home
            </Link>
            <div className="border-t border-red-600">
              <button
                className="w-full text-left px-6 py-3 hover:bg-red-600 transition flex justify-between items-center"
                onClick={() => toggleDropdown("Categories" as Category)}>
                <span>Categories</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={
                      activeDropdown === "Categories"
                        ? "M5 15l7-7 7 7"
                        : "M19 9l-7 7-7-7"
                    }
                  />
                </svg>
              </button>
              {activeDropdown === "Categories" && (
                <div className="bg-red-800 pl-8">
                  {Object.keys(menuItems).map((category) => (
                    <div key={category}>
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-red-700 transition flex justify-between items-center"
                        onClick={() => toggleDropdown(category as Category)}>
                        <span>{category}</span>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              activeDropdown === category
                                ? "M5 15l7-7 7 7"
                                : "M9 5l7 7-7 7"
                            }
                          />
                        </svg>
                      </button>
                      {activeDropdown === category && (
                        <div className="bg-red-900 pl-6">
                          {menuItems[category as Category].map((item) => (
                            <Link
                              key={item}
                              href="#"
                              className="block px-4 py-2 text-sm hover:bg-red-800 transition">
                              {item}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Link
              href="/about"
              className="block px-6 py-3 border-t border-red-600 hover:bg-red-600 transition">
              About
            </Link>
            <Link
              href="/contact"
              className="block px-6 py-3 border-t border-red-600 hover:bg-red-600 transition">
              Contact
            </Link>
            <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-red-800 font-bold px-6 py-3 mt-2 transition">
              Order Now
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
