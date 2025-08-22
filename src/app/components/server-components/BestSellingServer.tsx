import React from "react";
import { fetchBestSellingProducts } from "@/app/fetch/product";
import Chinese from "../categories/Chinese";
import BestSeller from "../categories/BestSeller";
import Container from "../Container";

async function BestSellingServer() {
  const products = await fetchBestSellingProducts();
  return (
    <Container>
      <BestSeller products={products} />
    </Container>
  );
}

export default BestSellingServer;
