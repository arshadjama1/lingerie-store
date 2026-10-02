"use client";

import { useEffect, useState } from "react";

import { AdminProductForm } from "@/components/admin/AdminProductForm";

export default function NewProductPage() {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, brandRes] = await Promise.all([
          fetch("/api/admin/categories"),
          fetch("/api/admin/brands"),
        ]);

        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.categories || []);
        }
        if (brandRes.ok) {
          const brandData = await brandRes.json();
          setBrands(brandData.brands || []);
        }
      } catch (error) {
        console.error("Failed to load categories or brands", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading form...</div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Create a new product with variants and images.
        </p>
      </div>

      <AdminProductForm mode="create" categories={categories} brands={brands} />
    </div>
  );
}
