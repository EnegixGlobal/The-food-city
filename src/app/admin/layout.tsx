"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Utensils,
  Tag,
  Settings,
  LogOut,
  Menu,
  X,
  Clock,
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      current: pathname === "/admin",
    },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: ShoppingBag,
      current: pathname === "/admin/orders",
    },
    {
      name: "Customers",
      href: "/admin/customers",
      icon: Users,
      current: pathname === "/admin/customers",
    },
    {
      name: "Menu Items",
      href: "/admin/products",
      icon: Utensils,
      current: pathname === "/admin/products",
    },
    {
      name: "Offers & Promos",
      href: "/admin/offers",
      icon: Tag,
      current: pathname === "/admin/offers",
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
      current: pathname === "/admin/settings",
    },
  ];

  const handleLogout = () => {
    // Implement logout logic here
    router.push("/admin-login");
  };

  return (
    <div className="bg-gray-200 min-h-screen flex gap-4">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className="fixed m-2 rounded-xl left-0">
        <div
          className={`rounded-xl min-h-screen max-h-screen inset-y-0 left-0 z-50 w-64 text-black bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}>
          <div className="flex items-center justify-between h-16 px-6 border-b border-red-800">
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="FoodExpress Admin"
                width={150}
                height={40}
                className="h-14 -rotate-12 w-auto"
              />
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-800 hover:text-white">
              <X size={24} />
            </button>
          </div>

          <nav className="h-full relative">
            <div className="px-3 pt-8 pb-20 h-full overflow-y-auto">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg mb-1 transition-colors ${
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
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-68 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <div className="fixed w-[calc(100%-280px)] top-2 z-30 rounded-xl bg-white shadow-sm border-b border-gray-200 ">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 mr-4">
                <Menu size={24} />
              </button>
              <div className="hidden md:flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-500">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="p-1 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100">
                  <span className="sr-only">Notifications</span>
                  <div className="relative">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                  </div>
                </button>
              </div>

              <div className="relative ml-4">
                <div className="flex items-center space-x-2">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">
                      Admin User
                    </p>
                    <p className="text-xs text-gray-500">Super Admin</p>
                  </div>
                  <div className="h-8 w-8 bg-red-900 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">A</span>
                  </div>
                </div>

                {/* Dropdown menu */}
                <div className="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <button
                    onClick={handleLogout}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                    <div className="flex items-center">
                      <LogOut className="h-4 w-4 mr-2 text-gray-500" />
                      Sign out
                    </div>
                  </button>
                </div>
              </div>

              {/* Mobile logout button (visible only on small screens) */}
              <button
                onClick={handleLogout}
                className="md:hidden text-gray-500 hover:text-gray-700 ml-2">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Page content - scrollable */}
        <main className="flex-1 mr-2 mb-2 p-6 bg-white overflow-y-auto mt-20 rounded-xl">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
