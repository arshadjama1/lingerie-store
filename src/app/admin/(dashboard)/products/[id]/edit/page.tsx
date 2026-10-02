import { notFound } from "next/navigation";

import {
  getAdminBrands,
  getAdminCategories,
  getAdminProductById,
} from "@/modules/admin/catalog";

import { AdminProductForm } from "@/components/admin/AdminProductForm";

export const dynamic = "force-dynamic";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditPageProps) {
  const { id } = await params;

  const product = await getAdminProductById(id);

  if (!product) {
    notFound();
  }

  const categories = await getAdminCategories();
  const brands = await getAdminBrands();

  // Map backend types to form types
  const mappedProduct = {
    ...product,
    tags: Array.isArray(product.tags)
      ? product.tags.join(", ")
      : product.tags || "",
    metaTitle: product.metaTitle || "",
    metaDescription: product.metaDesc || "",
    brandId: product.brandId || "",
    variants: product.variants.map((v) => ({
      ...v,
      colorName: v.color || "",
      weightInGrams: v.weightGrams || 0,
      stockQuantity: v.stock || 0,
    })),
    images: product.images.map((img) => ({
      ...img,
      altText: img.alt || "",
    })),
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Update product details, variants, and images.
        </p>
      </div>

      <AdminProductForm
        mode="edit"
        initialData={mappedProduct}
        categories={categories}
        brands={brands}
      />
    </div>
  );
}
