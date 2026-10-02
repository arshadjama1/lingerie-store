import { getAdminCategories } from "@/modules/admin/catalog";

import { AdminCategoriesClient } from "@/components/admin/AdminCategoriesClient";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return <AdminCategoriesClient categories={categories} />;
}
