import React from "react";
import Indian from "../categories/Indian";
import { fetchSouthIndianProducts } from "@/app/fetch/product";
import SouthIndian from "../categories/SouthIndian";

async function SouthIndianServer() {
  const products = await fetchSouthIndianProducts();
  return (
    <div>
      <SouthIndian products={products} />
    </div>
  );
}

export default SouthIndianServer;
