"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

type CategoryOption = {
  id: string;
  name: string;
  path: string;
  parentId: string | null;
  isActive: boolean;
  sortOrder: number;
  slug: string;
};

interface AdminCategoriesClientProps {
  categories: CategoryOption[];
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
  parentId: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AdminCategoriesClient({
  categories,
}: AdminCategoriesClientProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryOption | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
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
        const err = await res.json();
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
        const err = await res.json();
        throw new Error(err.error || "Failed to update category status");
      }

      toast.success("Category status updated");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {categories.length} categories total
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded-none border border-[#3d0a20] bg-[#3d0a20] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#5c1130]"
        >
          + Add Category
        </button>
      </div>

      <div className="overflow-x-auto rounded-none border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Path
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Parent
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Sort Order
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((cat) => {
              const parent = cat.parentId
                ? categories.find((c) => c.id === cat.parentId)
                : null;
              return (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold text-gray-900">
                    {cat.name}
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-500">
                    {cat.path}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {parent ? parent.name : "Root"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${cat.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{cat.sortOrder}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="mr-4 text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleStatus(cat)}
                      className="text-[#3d0a20] hover:underline"
                    >
                      Toggle Active
                    </button>
                  </td>
                </tr>
              );
            })}
            {categories.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleCloseModal}
          />
          <div className="relative w-full max-w-lg rounded-none bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingCategory ? "Edit Category" : "Add Category"}
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
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    {...register("name")}
                    type="text"
                    onChange={(e) => {
                      register("name").onChange(e);
                      if (!editingCategory) {
                        setValue("slug", slugify(e.target.value), {
                          shouldValidate: true,
                        });
                      }
                    }}
                    className="w-full rounded-none border border-gray-300 px-3 py-2 text-sm focus:border-[#3d0a20] focus:ring-1 focus:ring-[#3d0a20] focus:outline-none"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Slug
                  </label>
                  <input
                    {...register("slug")}
                    type="text"
                    className="w-full rounded-none border border-gray-300 px-3 py-2 text-sm focus:border-[#3d0a20] focus:ring-1 focus:ring-[#3d0a20] focus:outline-none"
                  />
                  {errors.slug && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.slug.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Parent Category
                  </label>
                  <select
                    {...register("parentId")}
                    className="w-full rounded-none border border-gray-300 px-3 py-2 text-sm focus:border-[#3d0a20] focus:ring-1 focus:ring-[#3d0a20] focus:outline-none"
                  >
                    <option value="">Root (no parent)</option>
                    {categories
                      .filter((c) => c.id !== editingCategory?.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.path})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Sort Order
                  </label>
                  <input
                    {...register("sortOrder")}
                    type="number"
                    className="w-full rounded-none border border-gray-300 px-3 py-2 text-sm focus:border-[#3d0a20] focus:ring-1 focus:ring-[#3d0a20] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    {...register("isActive")}
                    type="checkbox"
                    id="isActive"
                    className="h-4 w-4 rounded-none border-gray-300 text-[#3d0a20] focus:ring-[#3d0a20]"
                  />
                  <label
                    htmlFor="isActive"
                    className="text-sm font-medium text-gray-700"
                  >
                    Active
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-none border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-none border border-[#3d0a20] bg-[#3d0a20] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5c1130] disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
