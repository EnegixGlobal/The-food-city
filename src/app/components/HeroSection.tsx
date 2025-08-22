"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Container from "./Container";
import Button from "./Button";
import { FaArrowRight } from "react-icons/fa";
import Link from "next/link";

function HeroSection() {
  console.debug("HeroSection render");
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

  const [mounted, setMounted] = useState(false);
  const InstallPrompt = dynamic(() => import("./InstallPrompt"), {
    ssr: false,
  });

  useEffect(() => {
    // mark mounted to avoid SSR/CSR mismatches
    setMounted(true);
  }, []);

  // Install prompt handled in client-only InstallPrompt component

  return (
    <div className="relative md:text-left text-center h-[650px] overflow-hidden">
      {/* Background with food image overlay */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center"></div>

      <div className="bg-black/50 inset-0 absolute">
        <div className="w-full flex items-center justify-center md:mt-0 mt-6"></div>
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
          <Container className="py-2! md:py-0!">
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
                  {mounted && <InstallPrompt />}
                </div>
              </div>
            </div>
          </Container>
        </div>

        {/* fallback modal removed - handled by client-only InstallPrompt component */}
      </div>
    </div>
  );
}

export default HeroSection;
