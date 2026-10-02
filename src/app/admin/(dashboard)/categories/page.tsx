import {
  getAdminCatalogStats,
  getAdminCategories,
} from "@/modules/admin/catalog";

import { AdminCategoriesClient } from "@/components/admin/AdminCategoriesClient";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const [categories, catalogStats] = await Promise.all([
    getAdminCategories(),
    getAdminCatalogStats(),
  ]);

  return (
    <AdminCategoriesClient
      categories={categories}
      stats={{
        productCount: catalogStats.totalProducts,
        categoryCount: catalogStats.categoryCount,
      }}
    />
  );
}
