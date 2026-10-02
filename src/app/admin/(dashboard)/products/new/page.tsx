import { getAdminBrands, getAdminCategories } from "@/modules/admin/catalog";

import { AdminProductForm } from "@/components/admin/AdminProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    getAdminCategories(),
    getAdminBrands(),
  ]);

  return (
    <div className="space-y-6">
      <AdminProductForm mode="create" categories={categories} brands={brands} />
    </div>
  );
}
