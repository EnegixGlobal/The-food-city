import React from "react";
import { fetchChineseProducts } from "@/app/fetch/product";
import Chinese from "../categories/Chinese";

async function ChineseServer() {
  const products = await fetchChineseProducts();
  return (
    <div>
      <Chinese products={products} />
    </div>
  );
}

export default ChineseServer;
