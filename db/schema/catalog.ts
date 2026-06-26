import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import {
  boolean,
  check,
  decimal,
  index,
  integer,
  jsonb,
  pgTable,
  smallint,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const categories = pgTable(
  "categories",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    path: varchar("path", { length: 500 }).notNull(),
    parentId: text("parent_id").references((): AnyPgColumn => categories.id),
    imageUrl: text("image_url"),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: smallint("sort_order").default(0).notNull(),
  },
  (t) => [
    index("categories_path_idx").on(t.path),
    index("categories_parent_idx").on(t.parentId),
  ]
);

export const brands = pgTable(
  "brands",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    logoUrl: text("logo_url"),
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
  },
  (t) => [index("brands_slug_idx").on(t.slug)]
);

export const products = pgTable(
  "products",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    slug: varchar("slug", { length: 500 }).notNull().unique(),
    name: varchar("name", { length: 500 }).notNull(),
    description: text("description"),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id),
    categoryPath: varchar("category_path", { length: 500 }).notNull(),
    brandId: text("brand_id").references(() => brands.id),
    hsnCode: varchar("hsn_code", { length: 10 }),
    attributes: jsonb("attributes")
      .$type<Record<string, string>>()
      .default({})
      .notNull(),
    tags: text("tags").array().default([]).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    soldCount: integer("sold_count").default(0).notNull(),
    ratingAvg: decimal("rating_avg", { precision: 3, scale: 2 })
      .default("0")
      .notNull(),
    ratingCount: integer("rating_count").default(0).notNull(),
    metaTitle: varchar("meta_title", { length: 255 }),
    metaDesc: text("meta_desc"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("products_category_path_active_idx").on(t.categoryPath, t.isActive),
    index("products_brand_active_idx").on(t.brandId, t.isActive),
    index("products_active_featured_idx").on(t.isActive, t.isFeatured),
    index("products_slug_idx").on(t.slug),
  ]
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    sku: varchar("sku", { length: 100 }).notNull().unique(),
    size: varchar("size", { length: 50 }),
    color: varchar("color", { length: 50 }),
    colorHex: varchar("color_hex", { length: 7 }),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    mrp: decimal("mrp", { precision: 10, scale: 2 }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: smallint("sort_order").default(0).notNull(),
    weightGrams: integer("weight_grams"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    index("variants_product_active_idx").on(t.productId, t.isActive),
    index("variants_sku_idx").on(t.sku),
    check("price_lte_mrp", sql`${t.price} <= ${t.mrp}`),
  ]
);

export const productImages = pgTable(
  "product_images",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variantId: text("variant_id").references(() => productVariants.id, {
      onDelete: "cascade",
    }),
    url: text("url").notNull(),
    alt: text("alt"),
    isPrimary: boolean("is_primary").default(false).notNull(),
    sortOrder: smallint("sort_order").default(0).notNull(),
  },
  (t) => [
    index("product_images_product_sort_idx").on(t.productId, t.sortOrder),
    index("product_images_variant_idx").on(t.variantId),
  ]
);

export const inventory = pgTable(
  "inventory",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    variantId: text("variant_id")
      .notNull()
      .unique()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    quantity: integer("quantity").default(0).notNull(),
    reservedQuantity: integer("reserved_quantity").default(0).notNull(),
    lowStockAlert: integer("low_stock_alert").default(5).notNull(),
  },
  (t) => [
    index("inventory_variant_idx").on(t.variantId),
    check("quantity_non_negative", sql`${t.quantity} >= 0`),
    check("reserved_lte_quantity", sql`${t.reservedQuantity} <= ${t.quantity}`),
  ]
);

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "category_parent",
  }),
  children: many(categories, { relationName: "category_parent" }),
  products: many(products),
}));

export const brandsRelations = relations(brands, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  brand: one(brands, { fields: [products.brandId], references: [brands.id] }),
  variants: many(productVariants),
  images: many(productImages),
}));

export const productVariantsRelations = relations(
  productVariants,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
    images: many(productImages),
    inventory: one(inventory, {
      fields: [productVariants.id],
      references: [inventory.variantId],
    }),
  })
);

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [productImages.variantId],
    references: [productVariants.id],
  }),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  variant: one(productVariants, {
    fields: [inventory.variantId],
    references: [productVariants.id],
  }),
}));
