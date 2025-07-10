import Image from "next/image";
import React from "react";
import Container from "./Container";
import Button from "./Button";

function HeroSection() {
  const categories = [
    {
      name: "Indian",
      bgImage:
        "https://imgs.search.brave.com/zwudZdgp40IeX0z7JRLUmi2ElldrTgitQOAUR0eFZCI/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAyLzg0LzQ2Lzg5/LzM2MF9GXzI4NDQ2/ODk4M180S1pTaWV2/SDBwZmxlRFM4amhu/Z05iZVl1WVNwSnpO/RC5qcGc",
    },
    {
      name: "Chinese",
      bgImage:
        "https://imgs.search.brave.com/aZNSSTItd1B-CNzgoIxpRkXUxfeNublpDw__ar6l_QE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/c2h1dHRlcnN0b2Nr/LmNvbS9pbWFnZS1w/aG90by9hc3NvcnRl/ZC1jaGluZXNlLWZv/b2Qtb24tZGFyay0y/NjBudy0yMjA5NzQz/ODI3LmpwZw",
    },
    {
      name: "South",
      bgImage:
        "https://imgs.search.brave.com/AzUHwLQ7CQpRCZGZ47e1HT31k-Sk6iYExceNCqwlmeo/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/c2h1dHRlcnN0b2Nr/LmNvbS9pbWFnZS1w/aG90by9ncm91cC1z/b3V0aC1pbmRpYW4t/Zm9vZC1saWtlLTI2/MG53LTExNTM4MTg4/MjMuanBn",
    },
    {
      name: "Tandoor",
      bgImage:
        "https://imgs.search.brave.com/ORCKll6DBlMoHhUCJohZN1jTn0uCXXDRhmA7aCBybJ0/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTI4/NzU5MTg3MS9waG90/by9pbmRpYW4tZm9v/ZC5qcGc_cz02MTJ4/NjEyJnc9MCZrPTIw/JmM9dXFmMWdXQTFh/THAwV3A4bE9HbUV1/Y1BkYWxjVDIzZGpB/WGpzTHpzSHV6Yz0",
    },
  ];

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
                <div className="relative w-full h-24">
                  <Image
                    src={category.bgImage}
                    alt={category.name}
                    fill
                    className="object-cover"
                  />

                  {/* Overlay with gradient + text */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <h3 className="text-white text-2xl font-bold">
                      {category.name}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>

        <div className="relative z-10">
          <Container className="py-6!" >
            <div className="grid grid-cols-1 md:grid-cols-2 items-center">
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
                  <Button className="py-3! px-8! ">
                    Order Now
                  </Button>
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
