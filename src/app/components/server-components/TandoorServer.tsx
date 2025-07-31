import React from "react";
import Indian from "../categories/Indian";
import { fetchTandoorProducts } from "@/app/fetch/product";
import Tandoor from "../categories/Tandoor";

async function TandoorServer() {
  const products = await fetchTandoorProducts();
  return (
    <div>
      <Tandoor products={products} />
    </div>
  );
}

export default TandoorServer;
