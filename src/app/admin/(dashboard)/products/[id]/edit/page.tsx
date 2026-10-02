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

  const [categories, brands] = await Promise.all([
    getAdminCategories(),
    getAdminBrands(),
  ]);

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
    <div className="space-y-6">
      <AdminProductForm
        mode="edit"
        initialData={mappedProduct}
        categories={categories}
        brands={brands}
      />
    </div>
  );
}
