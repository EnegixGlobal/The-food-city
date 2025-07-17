"use client";

import React, { useEffect, useRef, useState } from "react";
import Card from "../Card";
import { FaArrowRight } from "react-icons/fa";
import Link from "next/link";

function SouthIndian() {
  const southIndian = [
      {
        id: 20,
        name: "Masala Dosa",
        price: "$7.99",
        image:
          "https://imgs.search.brave.com/553lVTEV7o-RqTCOXEJaslJIHDyIRlBmlyVMybieuYA/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9yZXMu/Y2xvdWRpbmFyeS5j/b20vaHozZ211cXc2/L2ltYWdlL3VwbG9h/ZC9jX2ZpbGwscV8z/MCx3Xzc1MC9mX2F1/dG8vc291dGgtaW5k/aWFuLWZvb2QtcGhw/bEh0WUNG",
      },
      {
        id: 21,
        name: "Idli with Sambar",
        price: "$5.99",
        image:
          "https://imgs.search.brave.com/DUIbn2y27vu8Yo5siwYcN04m3_8Lp537ELHspfceygM/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wMzUv/Mzc2LzAwNS9zbWFs/bC9haS1nZW5lcmF0/ZWQtc291dGgtaW5k/aWFuLWZvb2QtaWRs/aS1zYW1iYXItd2l0/aC1jb2NvbnV0LWNo/dXRuZXktcGhvdG8u/anBn",
      },
      {
        id: 22,
        name: "Medu Vada",
        price: "$4.99",
        image:
          "https://imgs.search.brave.com/E-M1UZ9Sb60lWg9Vbqt11FTxZZ2ZIzo7AmghYooTe-c/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTAy/NDU1Nzg1MC9waG90/by9ncm91cC1vZi1z/b3V0aC1pbmRpYW4t/Zm9vZC1saWtlLW1h/c2FsYS1kb3NhLXV0/dGFwYW0taWRsaS1p/ZGx5LXdhZGEtdmFk/YS1zYW1iYXItYXBw/YW0tc2Vtb2xpbmEu/anBnP3M9NjEyeDYx/MiZ3PTAmaz0yMCZj/PWNTRVdPZ1RNdkNf/ellYQURwRlA1Mk8w/QWpUTzFxdVRhVXND/a3RTLWpOcE09",
      },
      {
        id: 23,
        name: "Filter Coffee",
        price: "$2.99",
        image:
          "https://imgs.search.brave.com/7hV3ikF9HC7bXronqdkTMi6DRtTUan72ezHFI2_jpsQ/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTQ0/MzYwMTY0MS9waG90/by9hc3NvcnRlZC1z/b3V0aC1pbmRpYW4t/Zm9vZC1tdXR0b24t/YnJhaW4tbWFzYWxh/LWNoaWNrZW4tdGFu/Z2RpLWNoaWNrZW4t/cmVzaG1pLXRpa2th/LWNoaWNrZW4uanBn/P3M9NjEyeDYxMiZ3/PTAmaz0yMCZjPXpD/YTAxVXF5NVdGRENC/YjM0NW1YenA0bzJf/SlRJcmM4Tk5BV1NU/MEZPZlk9",
      },
      {
        id: 24,
        name: "Uttapam",
        price: "$6.49",
        image:
          "https://imgs.search.brave.com/bQCAcpCIsdz4qjoeK0cEqNK9RBBOb_pAkJU5YDyJWt4/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9yZXMu/Y2xvdWRpbmFyeS5j/b20vaHozZ211cXc2/L2ltYWdlL3VwbG9h/ZC9jX2ZpbGwscV9h/dXRvLHdfNzUwLGZf/YXV0by9mX2F1dG8v/VXR0YXBhbS1waHBZ/a09wb0k",
      },
      {
        id: 25,
        name: "Pongal",
        price: "$5.49",
        image:
          "https://imgs.search.brave.com/4JWXk3nyga79wiyXe9-c3scUDPmA5GNJM9g4lg6_7yY/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTQw/MjMzMDk0OC9waG90/by9icmVhZC1wYWtv/cmEtY2hhYXQuanBn/P3M9NjEyeDYxMiZ3/PTAmaz0yMCZjPUN2/eVMwNkQ4NXF5ZGx5/amhaWURDNUtVSzhj/aGFVcFlyTm5KSzJM/eGpXVkk9",
      },
      {
        id: 26,
        name: "Upma",
        price: "$4.49",
        image:
          "https://imgs.search.brave.com/6WkwSoETRqfTyO76gQSeLT6oGKiRc_vegYOKo40_Rig/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvNTQ3/NTQxNTQ2L3Bob3Rv/L3NvdXRoLWVhc3Qt/YXNpYW4tY2hpY2tw/ZWEtc2FsYWQuanBn/P3M9NjEyeDYxMiZ3/PTAmaz0yMCZjPVFj/VEhfVVBLMy12V01f/QVF3d2I5R0hIQmQ5/RVJweHBnRjFpUFJt/dXhvQVU9",
      },
      {
        id: 27,
        name: "Vegetable Kurma",
        price: "$6.99",
        image:
          "https://imgs.search.brave.com/565ZIqPOHoflGneyZXzG8Azu6cH1B0CvOfntjg5AhcE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wNTAv/NDM2LzQ3Ni9zbWFs/bC9zdGVhbWluZy1w/bGF0ZS1vZi1pbmRp/YW4taWRsaS1zZXJ2/ZWQtc2FtYmFyLWFu/ZC1jb2NvbnV0LWNo/dXRuZXktYS1zb3V0/aC1pbmRpYW4tYnJl/YWtmYXN0LWNsYXNz/aWMtcGhvdG8uanBn",
      },
    ];

  const [scrollPosition, setScrollPosition] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (!autoScroll) return;

    // Wait 5 seconds, then scroll by 1 item width
    const timeout = setTimeout(() => {
      if (carouselRef.current) {
        const item = carouselRef.current.querySelector("div.flex-shrink-0");
        const itemWidth = item ? (item as HTMLElement).offsetWidth + 24 : 300; // 24px = space-x-6
        const maxScroll =
          carouselRef.current.scrollWidth - carouselRef.current.clientWidth;
        let newPosition = carouselRef.current.scrollLeft + itemWidth;
        if (newPosition > maxScroll) newPosition = 0;
        carouselRef.current.scrollTo({ left: newPosition, behavior: "smooth" });
        setScrollPosition(newPosition);
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [scrollPosition, autoScroll]);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft -= 300;
      setAutoScroll(false);
      setTimeout(() => setAutoScroll(true), 3000);
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft += 300;
      setAutoScroll(false);
      setTimeout(() => setAutoScroll(true), 3000);
    }
  };

  return (
    <div className="relative mt-8">
      <div className="flex items-center justify-between ">
        <h2 className="text-2xl md:text-3xl  font-bold text-red-800 mb-4">
          South Cuisine
        </h2>
        <Link href="/south-indian">
        <span className="flex items-center justify-center gap-3 font-bold text-red-800 hover:text-red-700 hover:transform hover:scale-102 transition cursor-pointer">
          View All <FaArrowRight />
        </span>
        </Link>
      </div>
      <button
        onClick={scrollLeft}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:bg-red-50 transition transform hover:scale-110">
        <svg
          className="w-6 h-6 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <div
        ref={carouselRef}
        className="flex overflow-x-auto scroll-smooth  py-2 gap-4 scrollbar-hide"
        onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}>
        {southIndian.map((item) => (
          <Card key={item.id} item={item}>
          </Card>
        ))}
      </div>

      <button
        onClick={scrollRight}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:bg-red-50 transition transform hover:scale-110">
        <svg
          className="w-6 h-6 text-red-600"
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
    </div>
  );
}

export default SouthIndian;
