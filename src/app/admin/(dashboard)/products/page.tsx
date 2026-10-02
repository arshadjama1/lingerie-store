import Image from "next/image";
import Link from "next/link";

import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Layers,
  Package,
  Search,
  X,
} from "lucide-react";

import { formatPrice } from "@/lib/utils";

import {
  getAdminCatalogStats,
  getAdminCategories,
  listAdminProducts,
} from "@/modules/admin/catalog";

import { AdminProductStatusToggle } from "@/components/admin/AdminProductStatusToggle";
import { CatalogNavTabs } from "@/components/admin/CatalogNavTabs";
import { Pagination } from "@/components/common/pagination";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    categoryId?: string;
    stockStatus?: string;
    isActive?: string;
    page?: string;
  }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const isActive =
    sp.isActive === "true" ? true : sp.isActive === "false" ? false : undefined;

  const [catalogStats, { products, total, totalPages }, categories] =
    await Promise.all([
      getAdminCatalogStats(),
      listAdminProducts({
        search: sp.search?.trim() || undefined,
        categoryId: sp.categoryId || undefined,
        stockStatus:
          (sp.stockStatus as
            | "all"
            | "in_stock"
            | "low_stock"
            | "out_of_stock") || "all",
        isActive,
        page,
        limit: 20,
      }),
      getAdminCategories(),
    ]);

  const hasActiveFilters = Boolean(
    sp.search ||
    sp.categoryId ||
    (sp.stockStatus && sp.stockStatus !== "all") ||
    sp.isActive
  );

  function buildPaginationUrl(p: number) {
    const params = new URLSearchParams();
    if (sp.search) params.set("search", sp.search);
    if (sp.categoryId) params.set("categoryId", sp.categoryId);
    if (sp.stockStatus && sp.stockStatus !== "all")
      params.set("stockStatus", sp.stockStatus);
    if (sp.isActive) params.set("isActive", sp.isActive);
    params.set("page", String(p));
    return `/admin/products?${params.toString()}`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-[#3d0a20]" />
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Catalog & Products
          </h1>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Manage your storefront catalog, organize product variants, control
          pricing, and track live inventories.
        </p>
      </div>

      {/* Catalog Navigation */}
      <CatalogNavTabs
        productCount={catalogStats.totalProducts}
        categoryCount={catalogStats.categoryCount}
      />

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <Link
          href="/admin/products"
          className="group rounded-none border border-gray-200 bg-white p-4 transition-all hover:border-[#3d0a20] hover:shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
              Total Products
            </span>
            <Package className="h-4 w-4 text-gray-400 group-hover:text-[#3d0a20]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {catalogStats.totalProducts}
          </p>
          <p className="mt-0.5 text-xs text-gray-400">
            {catalogStats.totalVariants} variants across catalog
          </p>
        </Link>

        <Link
          href="/admin/products?isActive=true"
          className="group rounded-none border border-gray-200 bg-white p-4 transition-all hover:border-emerald-600 hover:shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
              Active Listings
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-700">
            {catalogStats.activeProducts}
          </p>
          <p className="mt-0.5 text-xs text-gray-400">Live on storefront</p>
        </Link>

        <Link
          href="/admin/products?stockStatus=low_stock"
          className="group rounded-none border border-gray-200 bg-white p-4 transition-all hover:border-amber-600 hover:shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
              Low Stock Alert
            </span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-700">
            {catalogStats.lowStockCount}
          </p>
          <p className="mt-0.5 text-xs text-amber-600">Variants at threshold</p>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-none border border-gray-200 bg-white p-4">
        <form
          method="GET"
          className="flex flex-col gap-3 lg:flex-row lg:items-center"
        >
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="search"
              defaultValue={sp.search}
              placeholder="Search by product name, SKU, or slug..."
              className="w-full rounded-none border border-gray-200 py-2 pr-3 pl-9 text-sm focus:border-[#3d0a20] focus:ring-1 focus:ring-[#3d0a20] focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <select
            name="categoryId"
            defaultValue={sp.categoryId}
            className="rounded-none border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-[#3d0a20] focus:ring-1 focus:ring-[#3d0a20] focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.path})
              </option>
            ))}
          </select>

          {/* Stock Status Filter */}
          <select
            name="stockStatus"
            defaultValue={sp.stockStatus}
            className="rounded-none border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-[#3d0a20] focus:ring-1 focus:ring-[#3d0a20] focus:outline-none"
          >
            <option value="all">All Stock Statuses</option>
            <option value="in_stock">In Stock (&gt; 0)</option>
            <option value="low_stock">Low Stock (≤ 10)</option>
            <option value="out_of_stock">Out of Stock (0)</option>
          </select>

          {/* Visibility Filter: Active, Draft/Inactive */}
          <select
            name="isActive"
            defaultValue={sp.isActive}
            className="rounded-none border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-[#3d0a20] focus:ring-1 focus:ring-[#3d0a20] focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="true">Active</option>
            <option value="false">Draft / Inactive</option>
          </select>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="rounded-none bg-[#3d0a20] px-4 py-2 text-xs font-semibold tracking-wide text-white uppercase transition-colors hover:bg-[#5c1130]"
            >
              Apply Filter
            </button>

            {hasActiveFilters && (
              <Link
                href="/admin/products"
                className="inline-flex items-center gap-1 rounded-none border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100"
              >
                <X className="h-3 w-3" />
                <span>Reset</span>
              </Link>
            )}
          </div>
        </form>
      </div>

      {/* Table Results Count */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          Showing{" "}
          <strong className="font-semibold text-gray-900">
            {products.length}
          </strong>{" "}
          of <strong className="font-semibold text-gray-900">{total}</strong>{" "}
          product{total !== 1 ? "s" : ""}
        </span>
        {hasActiveFilters && (
          <span className="font-medium text-[#3d0a20]">
            Filtered View Active
          </span>
        )}
      </div>

      {/* Table */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-none border border-gray-200 bg-white py-20 text-center">
          <Package className="h-12 w-12 text-gray-300" />
          <h3 className="text-base font-semibold text-gray-900">
            No products found
          </h3>
          <p className="max-w-md text-sm text-gray-500">
            {hasActiveFilters
              ? "No catalog items matched your current filter combinations. Try adjusting or resetting filters."
              : "Your catalog is empty. Start by adding your first product with sizes and prices."}
          </p>
          {hasActiveFilters ? (
            <Link
              href="/admin/products"
              className="mt-2 text-xs font-semibold text-[#3d0a20] underline"
            >
              Clear all filters
            </Link>
          ) : (
            <Link
              href="/admin/products/new"
              className="mt-2 inline-flex items-center gap-2 rounded-none border border-[#3d0a20] bg-[#3d0a20] px-4 py-2 text-xs font-semibold text-white hover:bg-[#5c1130]"
            >
              + Create First Product
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-none border border-gray-200 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-xs">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Item",
                    "Category & Brand",
                    "Variants",
                    "Price (INR)",
                    "Inventory",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => {
                  const stock = product.totalStock;
                  const isOutOfStock = stock === 0;
                  const isLowStock = stock > 0 && stock <= 10;

                  return (
                    <tr
                      key={product.id}
                      className="transition-colors hover:bg-gray-50/80"
                    >
                      {/* Item Thumbnail & Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden border border-gray-200 bg-gray-100">
                            {product.primaryImageUrl ? (
                              <Image
                                src={product.primaryImageUrl}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-gray-300">
                                <Package className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="font-semibold text-gray-900 transition-colors hover:text-[#3d0a20] hover:underline"
                            >
                              {product.name}
                            </Link>
                            <div className="font-mono text-[11px] text-gray-400">
                              /p/{product.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category & Brand */}
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                        <span className="inline-block rounded-none border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-800">
                          {product.categoryName}
                        </span>
                        {product.brandName && (
                          <div className="mt-1 text-[11px] text-gray-500">
                            by {product.brandName}
                          </div>
                        )}
                      </td>

                      {/* Variants */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 rounded-none border border-gray-200 bg-white px-2 py-0.5 text-xs font-semibold text-gray-700">
                          <Layers className="h-3 w-3 text-gray-400" />
                          <span>
                            {product.variantCount} variant
                            {product.variantCount !== 1 ? "s" : ""}
                          </span>
                        </span>
                      </td>

                      {/* Price Range */}
                      <td className="px-4 py-3 font-medium whitespace-nowrap text-gray-900">
                        {Number(product.minPrice) ===
                        Number(product.maxPrice) ? (
                          formatPrice(product.minPrice)
                        ) : (
                          <span>
                            {formatPrice(product.minPrice)} –{" "}
                            {formatPrice(product.maxPrice)}
                          </span>
                        )}
                      </td>

                      {/* Stock Badge */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-none border px-2.5 py-1 text-xs font-bold ${
                            isOutOfStock
                              ? "border-red-200 bg-red-50 text-red-700"
                              : isLowStock
                                ? "border-amber-200 bg-amber-50 text-amber-800"
                                : "border-emerald-200 bg-emerald-50 text-emerald-800"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isOutOfStock
                                ? "bg-red-500"
                                : isLowStock
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                            }`}
                          />
                          <span>
                            {isOutOfStock
                              ? "Out of stock"
                              : isLowStock
                                ? `${stock} left (Low)`
                                : `${stock} in stock`}
                          </span>
                        </span>
                      </td>

                      {/* Status Toggle (Active / Draft) */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <AdminProductStatusToggle
                          productId={product.id}
                          initialValue={product.isActive}
                        />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="rounded-none border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-2xs transition-colors hover:border-[#3d0a20] hover:text-[#3d0a20]"
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/p/${product.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Preview product on live store"
                            className="rounded-none border border-gray-200 bg-white p-1 text-gray-400 shadow-2xs transition-colors hover:border-gray-400 hover:text-gray-900"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Standardized Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <div className="text-xs text-gray-500">
            Page <span className="font-semibold text-gray-800">{page}</span> of{" "}
            <span className="font-semibold text-gray-800">{totalPages}</span>
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            buildUrl={buildPaginationUrl}
          />
        </div>
      )}
    </div>
  );
}
