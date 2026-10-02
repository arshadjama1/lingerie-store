import Image from "next/image";
import Link from "next/link";

import { getAdminCategories, listAdminProducts } from "@/modules/admin/catalog";

import { AdminProductStatusToggle } from "@/components/admin/AdminProductStatusToggle";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    categoryId?: string;
    stockStatus?: string;
    page?: string;
  }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const { products, total, totalPages } = await listAdminProducts({
    search: sp.search,
    categoryId: sp.categoryId,
    stockStatus:
      (sp.stockStatus as "all" | "in_stock" | "low_stock" | "out_of_stock") ||
      "all",
    page,
    limit: 20,
  });

  const categories = await getAdminCategories();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Catalog & Products
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {total} product{total !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-none border border-[#3d0a20] bg-[#3d0a20] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#5c1130]"
        >
          + Add Product
        </Link>
      </div>

      {/* Filter Bar */}
      <form
        method="GET"
        className="flex flex-col gap-4 sm:flex-row sm:items-center"
      >
        <input
          type="text"
          name="search"
          defaultValue={sp.search}
          placeholder="Search by name or slug..."
          className="flex-1 rounded-none border border-gray-200 px-3 py-2 text-sm focus:border-[#3d0a20] focus:ring-1 focus:ring-[#3d0a20] focus:outline-none"
        />
        <select
          name="categoryId"
          defaultValue={sp.categoryId}
          className="rounded-none border border-gray-200 px-3 py-2 text-sm focus:border-[#3d0a20] focus:ring-1 focus:ring-[#3d0a20] focus:outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.path})
            </option>
          ))}
        </select>
        <select
          name="stockStatus"
          defaultValue={sp.stockStatus}
          className="rounded-none border border-gray-200 px-3 py-2 text-sm focus:border-[#3d0a20] focus:ring-1 focus:ring-[#3d0a20] focus:outline-none"
        >
          <option value="all">All Stock</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
        <button
          type="submit"
          className="rounded-none border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-200"
        >
          Filter
        </button>
      </form>

      {/* Table */}
      {products.length === 0 ? (
        <div className="rounded-none border border-gray-200 bg-white py-16 text-center">
          <p className="text-gray-500">No products found.</p>
          <Link
            href="/admin/products/new"
            className="mt-3 inline-block text-sm font-semibold text-[#3d0a20] hover:underline"
          >
            Add your first product →
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-none border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Image",
                  "Product",
                  "Category",
                  "Variants",
                  "Price Range",
                  "Stock",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-gray-500 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => {
                const stockColor =
                  product.totalStock === 0
                    ? "bg-red-100 text-red-700"
                    : product.totalStock <= 10
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700";

                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {product.primaryImageUrl ? (
                        <Image
                          src={product.primaryImageUrl}
                          alt={product.name}
                          width={25}
                          height={25}
                          className="h-[25px] w-[25px] rounded border border-gray-200 object-cover"
                        />
                      ) : (
                        <div className="h-[25px] w-[25px] rounded border border-gray-200 bg-gray-100" />
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {product.name}
                      <div className="font-mono text-xs font-normal text-gray-500">
                        {product.slug}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {product.categoryName}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {product.variantCount} variants
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      ₹{Math.floor(Number(product.minPrice))} – ₹
                      {Math.floor(Number(product.maxPrice))}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded px-1.5 py-0.5 text-xs font-semibold ${stockColor}`}
                      >
                        {product.totalStock}
                      </span>
                    </td>
                    <td className="space-x-2 px-4 py-3">
                      <span
                        className={`inline-flex rounded px-1.5 py-0.5 text-xs font-semibold ${
                          product.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                      {product.isFeatured && (
                        <span className="inline-flex rounded bg-blue-100 px-1.5 py-0.5 text-xs font-semibold text-blue-700">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="flex items-center gap-3 px-4 py-3">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="font-semibold text-[#3d0a20] hover:underline"
                      >
                        Edit
                      </Link>
                      <AdminProductStatusToggle
                        productId={product.id}
                        field="isActive"
                        initialValue={product.isActive}
                        label="Active"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <div className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`?page=${page - 1}${sp.search ? `&search=${sp.search}` : ""}${sp.categoryId ? `&categoryId=${sp.categoryId}` : ""}${sp.stockStatus ? `&stockStatus=${sp.stockStatus}` : ""}`}
                className="rounded-none border border-gray-200 px-3 py-1 text-sm hover:bg-gray-50"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`?page=${page + 1}${sp.search ? `&search=${sp.search}` : ""}${sp.categoryId ? `&categoryId=${sp.categoryId}` : ""}${sp.stockStatus ? `&stockStatus=${sp.stockStatus}` : ""}`}
                className="rounded-none border border-gray-200 px-3 py-1 text-sm hover:bg-gray-50"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
