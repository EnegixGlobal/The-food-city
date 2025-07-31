import React from "react";
import Indian from "../categories/Indian";
import { fetchIndianProducts } from "@/app/fetch/product";

async function IndianServer() {
  const products = await fetchIndianProducts();
  return (
    <div>
      <Indian products={products} />
    </div>
  );
}

export default IndianServer;
