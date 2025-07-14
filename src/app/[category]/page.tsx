import React from "react";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export default async function Page({ params }: CategoryPageProps) {
  const { category } = await params;

  return (
    <div>
      <h1>Category: {category}</h1>
    </div>
  );
}
