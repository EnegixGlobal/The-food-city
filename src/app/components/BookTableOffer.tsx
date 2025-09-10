"use client";

import React from "react";
import Image from "next/image";
import Container from "./Container";
import Button from "./Button";
import { FaPhoneAlt } from "react-icons/fa";

export default function BookTableOffer() {
  const phone = "9386372101";

  return (
    <section className="relative bg-white py-12">
      <Container>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6 items-center">
          {/* Image */}
          <div className="w-full h-64 md:h-96 rounded-xl overflow-hidden shadow-lg">
            <Image
              src="/table.png"
              alt="Restaurant table"
              width={1400}
              height={900}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="p-6 md:p-12">
            <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Book your Table and get 20% Discount in Food items
            </h3>
            <p className="text-gray-600 mb-6 max-w-xl">
              Enjoy a warm dining experience at our restaurant. Book your table
              now and get an exclusive 20% discount on food items when you
              mention this offer.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <a href={`tel:${phone}`} className="inline-block">
                <Button className="bg-gradient-to-r from-amber-500 to-red-500 text-white inline-flex items-center gap-3 px-6 py-3">
                  <FaPhoneAlt /> Book Table
                </Button>
              </a>

              <div className="text-sm text-gray-500">
                OR call us at
                <div className="font-mono text-lg text-gray-900">{phone}</div>
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-6">
              *Offer valid for dine-in only. Terms and conditions apply.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
