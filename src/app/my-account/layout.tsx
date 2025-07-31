"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  X,
  Menu,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import Container from "../components/Container";
import useUserStore from "../zustand/userStore";
import axios from "axios";
import toast from "react-hot-toast";

interface ProfileLayoutProps {
  children: React.ReactNode;
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);

  // Handle logout functionality
  const handleLogout = async () => {
    try {
      await axios.post("/api/users/logout");
      clearUser();
      toast.success("Logged out successfully!");
      // Redirect to home page
      window.location.href = "/";
    } catch (error) {
      toast.error("Failed to logout");
      console.error("Logout error:", error);
    }
  };

  const navigationItems = [
    {
      name: "Orders",
      href: "/my-account",
      icon: LayoutDashboard,
      current: pathname === "/my-account",
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
          <div className="flex justify-between items-center  lg:px-10">
            <div>
              <h2 className="md:text-2xl text-lg font-bold text-white">
                {user?.name}
              </h2>
              <p className="text-gray-300 font-semibold text-sm">
                {user?.phone}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden bg-white/20 backdrop-blur-sm rounded-lg p-2 text-white hover:bg-white/30 transition-colors">
                <Menu size={20} />
              </button>

              {/* Desktop Logout Button */}
              <button
                onClick={handleLogout}
                className="hidden cursor-pointer lg:flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-none px-4 py-2 text-white hover:bg-white/30 transition-colors text-sm font-medium">
                <LogOut size={16} />
                Logout
              </button>

              <Link href={"/my-account/edit"}>
                <Button className="rounded-none">Edit Profile</Button>
              </Link>
            </div>
          </div>

          <div className="flex bg-white mt-8 left-0">
            <div
              className={`min-h-screen max-h-screen fixed lg:static inset-y-0 left-0 z-50 lg:z-30 w-64 bg-white text-black shadow-xl lg:shadow-none transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
                sidebarOpen
                  ? "translate-x-0"
                  : "-translate-x-full lg:translate-x-0"
              }`}>
              <div className="flex justify-between items-center p-4 lg:hidden border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Menu</h3>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-gray-600 hover:text-gray-900 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <nav className="h-full relative">
                <div className="px-3 pt-4 lg:pt-8 pb-20 h-full overflow-y-auto">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`group hover:text-white flex items-center px-3 py-3 text-sm font-medium mb-1 transition-colors rounded-none ${
                        item.current
                          ? "bg-[#37718e] text-white"
                          : "text-gray-800 hover:bg-[#37718e] hover:text-white"
                      }`}>
                      <item.icon
                        className={`mr-3 h-5 w-5 ${
                          item.current
                            ? "text-white"
                            : "text-gray-700 group-hover:text-white"
                        }`}
                      />
                      {item.name}
                    </Link>
                  ))}

                  {/* Logout Button - Only visible on mobile */}
                  <div className="lg:hidden mt-6 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        handleLogout();
                        setSidebarOpen(false);
                      }}
                      className="group w-full flex items-center px-3 py-3 text-sm font-medium mb-1 transition-colors rounded-none text-red-600 hover:bg-red-50 hover:text-red-700">
                      <LogOut className="mr-3 h-5 w-5 text-red-500 group-hover:text-red-700" />
                      Logout
                    </button>
                  </div>
                </div>
              </nav>
            </div>

            {/* Main content */}
            <main className="flex-1 lg:mr-2 mb-2 p-4 lg:p-6 overflow-y-auto rounded-none lg:rounded-xl">
              {children}
            </main>
          </div>
        </Container>
      </div>
    </>
  );
};

export default ProfileLayout;
