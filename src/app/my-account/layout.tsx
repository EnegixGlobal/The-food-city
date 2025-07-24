"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import Container from "../components/Container";

interface ProfileLayoutProps {
  children: React.ReactNode;
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navigationItems = [
    {
      name: "Orders",
      href: "/my-account/orders",
      icon: LayoutDashboard,
      current: pathname === "/my-account/orders",
    },
    {
      name: "Addresses",
      href: "/my-account/addresses",
      icon: ShoppingBag,
      current: pathname === "/my-account/addresses",
    },
    {
      name: "Settings",
      href: "/my-account/settings",
      icon: Users,
      current: pathname === "/my-account/settings",
    },
  ];

  return (
    <>
      <Navbar />
      <div className="bg-[#37718e] min-h-screen flex md:flex-col">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <Container>
          <div className=" flex justify-between items-center px-10 ">
            <div>
              <h2 className="text-2xl font-bold text-white">Rajiv</h2>
              <p className="text-white font-semibold">9546953892 </p>
            </div>
            <div>
              <Button className="rounded-none">Edit Profile</Button>
            </div>
          </div>

          <div className="flex bg-white mt-8   left-0">
            <div
              className={`  min-h-screen max-h-screen inset-y-0 left-0 z-30 w-64 text-black   transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`}>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-800 hover:text-white">
                <X size={24} />
              </button>

              <nav className="h-full relative">
                <div className="px-3 pt-8 pb-20 h-full overflow-y-auto">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group hover:text-white flex items-center px-3 py-3 text-sm font-medium  mb-1 transition-colors ${
                        item.current
                          ? "bg-red-800 text-white"
                          : "text-gray-800 hover:bg-red-800 hover:text-white!"
                      }`}>
                      <item.icon
                        className={`mr-3 h-5 w-5 ${
                          item.current
                            ? "text-white"
                            : "text-gray-700 hover:text-white"
                        }`}
                      />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </nav>
            </div>
            <main className="flex-1 mr-2 mb-2 p-6  overflow-y-auto  rounded-xl">
              {children}
            </main>
          </div>
        </Container>
      </div>
    </>
  );
};

export default ProfileLayout;
