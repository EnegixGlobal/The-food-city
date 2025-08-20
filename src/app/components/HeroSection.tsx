"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import InstallAppButton from "./InstallAppButton";
import Container from "./Container";
import Button from "./Button";
import { FaArrowRight } from "react-icons/fa";
import Link from "next/link";

function HeroSection() {
  const categories = [
    {
      name: "Indian",
      bgImage:
        "/indian.webp",
      href: "/indian",
    },
    {
      name: "Chinese",
      bgImage:
        "/chinese.webp",
      href: "/chinese",
    },
    {
      name: "South",
      bgImage:
        "/south.webp",
      href: "/south-indian",
    },
    {
      name: "Tandoor",
      bgImage:
        "/tandoor.webp",
      href: "/tandoor",
    },
  ];

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log("Install outcome:", outcome);
    setDeferredPrompt(null);
  };

  return (
    <div className="relative md:text-left text-center h-[700px] overflow-hidden">
      {/* Background with food image overlay */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center "></div>

      <div className="bg-black/50 inset-0 absolute">
        {/* Category boxes */}
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <div
                key={index}
                className="border-2 border-white/45  cursor-pointer rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                {/* Image + Text Overlay */}
                <Link href={category.href}>
                  <div className="relative w-full h-24">
                    <Image
                      src={category.bgImage}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />

                    {/* Overlay with gradient + text */}
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
          <Container className="py-6!">
            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8">
              {/* Text content */}
              <div className="text-white">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  <span className="text-yellow-400">Delicious</span> Food
                  Delivered To Your Doorstep
                </h1>
                <p className="text-lg md:text-xl mb-8 max-w-xl">
                  Order from your favorite restaurants with just a few taps.
                  Fast delivery, fresh meals, and unforgettable taste
                  experiences.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="py-3! px-8! ">Order Now</Button>
                  {deferredPrompt && (
                    <Button
                      onClick={handleInstallClick}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700">
                      📲 Install App
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Container>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
