"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { FolderTree, Package, Plus } from "lucide-react";

interface CatalogNavTabsProps {
  productCount?: number;
  categoryCount?: number;
}

export function CatalogNavTabs({
  productCount,
  categoryCount,
}: CatalogNavTabsProps) {
  const pathname = usePathname();

  const tabs = [
    {
      name: "Products",
      href: "/admin/products",
      icon: Package,
      count: productCount,
      active: pathname.startsWith("/admin/products"),
    },
    {
      name: "Categories",
      href: "/admin/categories",
      icon: FolderTree,
      count: categoryCount,
      active: pathname.startsWith("/admin/categories"),
    },
  ];

  return (
    <div className="flex flex-col gap-3 border-b border-gray-200 pb-2 sm:flex-row sm:items-center sm:justify-between">
      <nav
        className="flex space-x-1 sm:space-x-2"
        aria-label="Catalog navigation"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`group inline-flex items-center gap-2 border-b-2 px-3 py-2 text-xs font-semibold tracking-wider uppercase transition-all sm:text-sm ${
                tab.active
                  ? "border-[#3d0a20] text-[#3d0a20]"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-900"
              }`}
            >
              <Icon
                className={`h-4 w-4 transition-colors ${
                  tab.active
                    ? "text-[#3d0a20]"
                    : "text-gray-400 group-hover:text-gray-600"
                }`}
              />
              <span>{tab.name}</span>
              {tab.count !== undefined && (
                <span
                  className={`ml-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    tab.active
                      ? "bg-[#3d0a20]/10 text-[#3d0a20]"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2">
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-1.5 rounded-none border border-[#3d0a20] bg-[#3d0a20] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#5c1130]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Product</span>
        </Link>
      </div>
    </div>
  );
}
