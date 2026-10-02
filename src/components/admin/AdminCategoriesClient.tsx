"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CornerDownRight,
  ExternalLink,
  FolderTree,
  Loader2,
  Plus,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

import { slugify } from "@/lib/utils";

import { CatalogNavTabs } from "@/components/admin/CatalogNavTabs";

interface CategoryOption {
  id: string;
  name: string;
  path: string;
  parentId: string | null;
  isActive: boolean;
  sortOrder: number;
  slug: string;
}

interface AdminCategoriesClientProps {
  categories: CategoryOption[];
  stats?: {
    productCount: number;
    categoryCount: number;
  };
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must only contain lowercase letters, numbers, and hyphens"
    ),
  parentId: z.string().optional(),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export function AdminCategoriesClient({
  categories,
  stats,
}: AdminCategoriesClientProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryOption | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      parentId: "",
      sortOrder: 0,
      isActive: true,
    },
  });

  const watchParentId = watch("parentId");
  const watchSlug = watch("slug");

  // Calculate predicted path in real-time
  const predictedPath = useMemo(() => {
    const parent = categories.find((c) => c.id === watchParentId);
    if (!parent) return watchSlug || "your-slug";
    return `${parent.path}/${watchSlug || "your-slug"}`;
  }, [categories, watchParentId, watchSlug]);

  // Filter categories by search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.path.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q)
    );
  }, [categories, searchQuery]);

  const rootCategoriesCount = useMemo(
    () => categories.filter((c) => !c.parentId).length,
    [categories]
  );
  const subCategoriesCount = useMemo(
    () => categories.filter((c) => c.parentId).length,
    [categories]
  );

  function handleOpenCreate() {
    setEditingCategory(null);
    reset({
      name: "",
      slug: "",
      parentId: "",
      sortOrder: 0,
      isActive: true,
    });
    setIsModalOpen(true);
  }

  function handleOpenEdit(category: CategoryOption) {
    setEditingCategory(category);
    reset({
      name: category.name,
      slug: category.slug,
      parentId: category.parentId || "",
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    });
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingCategory(null);
  }

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : "/api/admin/categories";

      const method = editingCategory ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          parentId: data.parentId || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save category");
      }

      toast.success(
        `Category ${editingCategory ? "updated" : "created"} successfully`
      );
      handleCloseModal();
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function toggleStatus(category: CategoryOption) {
    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !category.isActive }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update category status");
      }

      toast.success(
        category.isActive ? "Category deactivated" : "Category activated"
      );
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <FolderTree className="h-6 w-6 text-[#3d0a20]" />
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Category Management
          </h1>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Organize storefront department taxonomy, create hierarchical
          sub-categories, and manage navigation URL paths.
        </p>
      </div>

      {/* Catalog Navigation */}
      <CatalogNavTabs
        productCount={stats?.productCount}
        categoryCount={stats?.categoryCount ?? categories.length}
      />

      {/* KPI Counters */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="border border-gray-200 bg-white p-4">
          <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
            Total Categories
          </span>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {categories.length}
          </p>
          <p className="mt-0.5 text-xs text-gray-400">Total taxonomy nodes</p>
        </div>

        <div className="border border-gray-200 bg-white p-4">
          <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
            Root Collections
          </span>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {rootCategoriesCount}
          </p>
          <p className="mt-0.5 text-xs text-gray-400">Top-level navigation</p>
        </div>

        <div className="border border-gray-200 bg-white p-4">
          <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
            Sub-Categories
          </span>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {subCategoriesCount}
          </p>
          <p className="mt-0.5 text-xs text-gray-400">Nested sub-departments</p>
        </div>

        <div className="border border-gray-200 bg-white p-4">
          <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
            Active Status
          </span>
          <p className="mt-2 text-2xl font-bold text-emerald-700">
            {categories.filter((c) => c.isActive).length}
          </p>
          <p className="mt-0.5 text-xs text-gray-400">
            Live on storefront menu
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-none border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories by name, path, or slug..."
            className="w-full rounded-none border border-gray-200 py-2 pr-3 pl-9 text-sm focus:border-[#3d0a20] focus:ring-1 focus:ring-[#3d0a20] focus:outline-none"
          />
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-1.5 rounded-none border border-[#3d0a20] bg-[#3d0a20] px-4 py-2 text-xs font-semibold tracking-wider text-white uppercase transition-colors hover:bg-[#5c1130]"
        >
          <Plus className="h-4 w-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="overflow-hidden rounded-none border border-gray-200 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
                  Category Name
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
                  Taxonomy Path
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
                  Parent Collection
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
                  Sort Order
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCategories.map((cat) => {
                const parent = cat.parentId
                  ? categories.find((c) => c.id === cat.parentId)
                  : null;
                const isNested = Boolean(cat.parentId);

                return (
                  <tr
                    key={cat.id}
                    className="transition-colors hover:bg-gray-50/80"
                  >
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      <div className="flex items-center gap-1.5">
                        {isNested ? (
                          <span className="flex items-center pl-4 text-gray-400">
                            <CornerDownRight className="h-3.5 w-3.5" />
                          </span>
                        ) : null}
                        <span>{cat.name}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded-none border border-gray-200 bg-gray-50 px-2 py-0.5 font-mono text-[11px] text-gray-700">
                        {cat.path}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {parent ? (
                        <span className="rounded-none border border-gray-200 bg-white px-2 py-0.5 text-xs text-gray-700">
                          {parent.name}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">
                          Root (None)
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => toggleStatus(cat)}
                        className={`inline-flex items-center gap-1.5 rounded-none border px-2 py-0.5 text-xs font-semibold transition-colors ${
                          cat.isActive
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                            : "border-gray-200 bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                        title="Click to toggle status"
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            cat.isActive ? "bg-emerald-500" : "bg-gray-400"
                          }`}
                        />
                        {cat.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>

                    <td className="px-4 py-3 text-gray-600">{cat.sortOrder}</td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="rounded-none border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-2xs hover:border-[#3d0a20] hover:text-[#3d0a20]"
                        >
                          Edit
                        </button>

                        <Link
                          href={`/${cat.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View category page on live store"
                          className="rounded-none border border-gray-200 bg-white p-1 text-gray-400 shadow-2xs transition-colors hover:border-gray-400 hover:text-gray-900"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredCategories.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    No categories found matching &quot;{searchQuery}&quot;.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={handleCloseModal}
          />
          <div className="relative w-full max-w-lg rounded-none border border-gray-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-base font-bold text-gray-900">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold tracking-wider text-gray-700 uppercase">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("name")}
                    type="text"
                    placeholder="e.g. Bralettes"
                    onChange={(e) => {
                      register("name").onChange(e);
                      if (!editingCategory) {
                        setValue("slug", slugify(e.target.value), {
                          shouldValidate: true,
                        });
                      }
                    }}
                    className="w-full rounded-none border border-gray-200 px-3 py-2 text-sm focus:border-[#3d0a20] focus:ring-1 focus:ring-[#3d0a20] focus:outline-none"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold tracking-wider text-gray-700 uppercase">
                    URL Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("slug")}
                    type="text"
                    placeholder="bralettes"
                    className="w-full rounded-none border border-gray-200 px-3 py-2 font-mono text-xs focus:border-[#3d0a20] focus:ring-1 focus:ring-[#3d0a20] focus:outline-none"
                  />
                  {errors.slug && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.slug.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold tracking-wider text-gray-700 uppercase">
                    Parent Collection
                  </label>
                  <select
                    {...register("parentId")}
                    className="w-full rounded-none border border-gray-200 px-3 py-2 text-sm focus:border-[#3d0a20] focus:ring-1 focus:ring-[#3d0a20] focus:outline-none"
                  >
                    <option value="">Root Category (No Parent)</option>
                    {categories
                      .filter(
                        (c) => !editingCategory || c.id !== editingCategory.id
                      )
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.path})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Real-time Path Preview */}
                <div className="rounded-none border border-gray-200 bg-gray-50 p-3">
                  <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                    Calculated Taxonomy Path
                  </span>
                  <div className="mt-1 font-mono text-xs font-semibold text-[#3d0a20]">
                    /{predictedPath}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold tracking-wider text-gray-700 uppercase">
                      Sort Order
                    </label>
                    <input
                      {...register("sortOrder", { valueAsNumber: true })}
                      type="number"
                      className="w-full rounded-none border border-gray-200 px-3 py-2 text-sm focus:border-[#3d0a20] focus:ring-1 focus:ring-[#3d0a20] focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        {...register("isActive")}
                        type="checkbox"
                        className="h-4 w-4 cursor-pointer accent-[#3d0a20]"
                      />
                      <span className="text-xs font-semibold text-gray-700">
                        Active on Store
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-none border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-none border border-[#3d0a20] bg-[#3d0a20] px-5 py-2 text-xs font-semibold tracking-wider text-white uppercase hover:bg-[#5c1130] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : editingCategory ? (
                    "Save Changes"
                  ) : (
                    "Create Category"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
