"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import Container from "./Container";
import Button from "./Button";
import { FaArrowRight } from "react-icons/fa";
import Link from "next/link";

function HeroSection() {
  const categories = [
    {
      name: "Indian",
      bgImage: "/indian.webp",
      href: "/indian",
    },
    {
      name: "Chinese",
      bgImage: "/chinese.webp",
      href: "/chinese",
    },
    {
      name: "South",
      bgImage: "/south.webp",
      href: "/south-indian",
    },
    {
      name: "Tandoor",
      bgImage: "/tandoor.webp",
      href: "/tandoor",
    },
  ];

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // Detect iOS devices
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Handle PWA install prompt for supported browsers
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Check if the app is already installed (for PWA-capable browsers)
    window.addEventListener("appinstalled", () => {
      console.log("PWA was installed");
      setDeferredPrompt(null);
      setIsInstallable(false);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", () => {});
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      // Show iOS-specific instructions
      setShowFallback(true);
      return;
    }

    if (!deferredPrompt) {
      // Fallback for browsers that don't support PWA or haven't triggered the prompt
      setShowFallback(true);
      return;
    }

    try {
      // Trigger the install prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log("Install outcome:", outcome);
      if (outcome === "accepted") {
        console.log("User accepted the install prompt");
      } else {
        console.log("User dismissed the install prompt");
      }
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error("Error during installation:", error);
      setShowFallback(true);
    }
  };

  const closeFallback = () => {
    setShowFallback(false);
  };

  return (
    <div className="relative md:text-left text-center h-[700px] overflow-hidden">
      {/* Background with food image overlay */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center"></div>

      <div className="bg-black/50 inset-0 absolute">
        <div className="w-full flex items-center justify-center mt-6">
          <button
            onClick={handleInstallClick}
            className={`md:hidden self-center cursor-pointer bg-black border border-yellow-300 rounded-full text-white hover:text-white transition-colors duration-300 flex items-center justify-center gap-2 px-6 py-2 font-bold ${
              !isInstallable && !isIOS ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!isInstallable && !isIOS}
          >
            📲 Install App
          </button>
        </div>
        {/* Category boxes */}
        <Container className="py-6! md:py-12!">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <div
                key={index}
                className="border-2 border-white/45 cursor-pointer rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <Link href={category.href}>
                  <div className="relative w-full h-24">
                    <Image
                      src={category.bgImage}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <h3 className="text-white text-2xl font-bold flex items-center gap-2 justify-center">
                        {category.name}{" "}
                        <FaArrowRight className="text-lg text-yellow-300" />
                      </h3>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </Container>

        <div className="relative z-10">
          <Container className="py-2! md:py-6!">
            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8">
              <div className="text-white">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  <span className="text-yellow-400">Delicious</span> Food
                  Delivered To Your Doorstep
                </h1>
                <p className="text-lg md:text-xl mb-8 max-w-xl font-semibold">
                  Order from your favorite restaurants with just a few taps.
                  Fast delivery, fresh meals, and unforgettable taste
                  experiences.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-start">
                  <Button className="md:py-3! py-2! px-8!">Order Now</Button>
                  <button
                    onClick={handleInstallClick}
                    className={`hidden cursor-pointer bg-black border border-yellow-300 rounded-full text-white hover:text-white transition-colors duration-300 md:flex items-center gap-2 px-6 py-3 font-bold ${
                      !isInstallable && !isIOS
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={!isInstallable && !isIOS}
                  >
                    📲 Install App
                  </button>
                </div>
              </div>
            </div>
          </Container>
        </div>

        {/* Fallback Modal for iOS or unsupported browsers */}
        {showFallback && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Install Our App</h2>
              {isIOS ? (
                <p className="mb-4">
                  To install the app on iOS:
                  <ol className="list-decimal list-inside">
                    <li>
                      Tap the <strong>Share</strong> button in Safari.
                    </li>
                    <li>
                      Select <strong>Add to Home Screen</strong>.
                    </li>
                    <li>
                      Tap <strong>Add</strong> to complete the installation.
                    </li>
                  </ol>
                </p>
              ) : (
                <p className="mb-4">
                  Your browser does not support automatic installation. Please
                  visit our website on a compatible browser (e.g., Chrome, Edge)
                  or add the app manually to your home screen.
                </p>
              )}
              <button
                onClick={closeFallback}
                className="bg-yellow-400 text-black px-4 py-2 rounded-full font-bold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HeroSection;
