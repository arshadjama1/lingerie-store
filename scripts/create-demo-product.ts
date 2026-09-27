/* eslint-disable no-console */
import { createId } from "@paralleldrive/cuid2";
import dotenv from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "../db/schema";

const isProd =
  process.argv.includes("--prod") || process.env.SEED_TARGET === "prod";

if (isProd) {
  dotenv.config({ path: ".env", override: true });
} else {
  dotenv.config({ path: ".env.local" });
  if (!process.env.DATABASE_DIRECT_URL && !process.env.DATABASE_URL) {
    dotenv.config({ path: ".env" });
  }
}

const databaseUrl = process.env.DATABASE_DIRECT_URL || process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error(
    "❌ DATABASE_DIRECT_URL or DATABASE_URL is not set in environment."
  );
  process.exit(1);
}

try {
  const hostMatch = databaseUrl.match(/@([^:/]+)/);
  console.log(
    `📡 Target database host: ${hostMatch ? hostMatch[1] : "unknown"} (${isProd ? "PROD" : "LOCAL/DEV"})`
  );
} catch {
  // ignore
}

const client = postgres(databaseUrl, { max: 1 });
const db = drizzle(client, { schema });

const DEMO_PRODUCT_SLUG = "surekh-test-item-1rs";
const DEMO_VARIANT_SKU = "DEMO-TEST-01";
const DEMO_IMAGE_URL = "/images/products/bamboo-undie-black-1.png";

async function main() {
  console.log("\n🚀 Starting ₹1 Demo Product Creation / Sync...");

  // 1. Find or verify category
  let category = await db.query.categories.findFirst({
    where: eq(schema.categories.slug, "panties"),
  });

  if (!category) {
    category = await db.query.categories.findFirst();
  }

  if (!category) {
    console.log("📁 No category found, creating default category...");
    const newCatId = createId();
    await db.insert(schema.categories).values({
      id: newCatId,
      name: "Panties",
      slug: "panties",
      path: "panties",
      isActive: true,
      sortOrder: 1,
    });
    category = (await db.query.categories.findFirst({
      where: eq(schema.categories.id, newCatId),
    }))!;
  }

  // 2. Find or verify brand
  let brand = await db.query.brands.findFirst({
    where: eq(schema.brands.slug, "surekh"),
  });

  if (!brand) {
    brand = await db.query.brands.findFirst();
  }

  if (!brand) {
    console.log("🏷️ No brand found, creating Surekh brand...");
    const newBrandId = createId();
    await db.insert(schema.brands).values({
      id: newBrandId,
      name: "Surekh",
      slug: "surekh",
      isActive: true,
    });
    brand = (await db.query.brands.findFirst({
      where: eq(schema.brands.id, newBrandId),
    }))!;
  }

  // 3. Check if demo product already exists
  const existingProduct = await db.query.products.findFirst({
    where: eq(schema.products.slug, DEMO_PRODUCT_SLUG),
    with: {
      variants: {
        with: {
          inventory: true,
        },
      },
      images: true,
    },
  });

  if (existingProduct) {
    console.log(
      `ℹ️  Demo product already exists (ID: ${existingProduct.id}). Updating details...`
    );

    // Update product active status
    await db
      .update(schema.products)
      .set({
        name: "Surekh Live Demo Test Item (₹1)",
        description:
          "Surekh ₹1 Live Production Payment Testing Item. Used exclusively for end-to-end verification of payment gateway integration.",
        isActive: true,
        isFeatured: false,
        updatedAt: new Date(),
      })
      .where(eq(schema.products.id, existingProduct.id));

    // Ensure variant exists & is priced at ₹1
    const variant = existingProduct.variants.find(
      (v) => v.sku === DEMO_VARIANT_SKU
    );

    if (variant) {
      await db
        .update(schema.productVariants)
        .set({
          price: "1.00",
          mrp: "1.00",
          isActive: true,
        })
        .where(eq(schema.productVariants.id, variant.id));

      if (variant.inventory) {
        await db
          .update(schema.inventory)
          .set({ quantity: 9999, reservedQuantity: 0 })
          .where(eq(schema.inventory.id, variant.inventory.id));
      } else {
        await db.insert(schema.inventory).values({
          id: createId(),
          variantId: variant.id,
          quantity: 9999,
          reservedQuantity: 0,
          lowStockAlert: 5,
        });
      }
    } else {
      const variantId = createId();
      await db.insert(schema.productVariants).values({
        id: variantId,
        productId: existingProduct.id,
        sku: DEMO_VARIANT_SKU,
        size: "Standard",
        color: "Rose",
        colorHex: "#c83c7e",
        price: "1.00",
        mrp: "1.00",
        isActive: true,
        sortOrder: 0,
        weightGrams: 100,
      });

      await db.insert(schema.inventory).values({
        id: createId(),
        variantId,
        quantity: 9999,
        reservedQuantity: 0,
        lowStockAlert: 5,
      });
    }

    // Ensure image exists
    if (!existingProduct.images || existingProduct.images.length === 0) {
      await db.insert(schema.productImages).values({
        id: createId(),
        productId: existingProduct.id,
        variantId: null,
        url: DEMO_IMAGE_URL,
        alt: "Surekh ₹1 Test Product",
        isPrimary: true,
        sortOrder: 0,
      });
    }

    console.log("✅ Demo product updated successfully!");
  } else {
    console.log("📦 Creating new ₹1 demo product...");
    const productId = createId();
    const variantId = createId();

    await db.insert(schema.products).values({
      id: productId,
      name: "Surekh Live Demo Test Item (₹1)",
      slug: DEMO_PRODUCT_SLUG,
      description:
        "Surekh ₹1 Live Production Payment Testing Item. Used exclusively for end-to-end verification of payment gateway integration.",
      categoryId: category.id,
      categoryPath: category.path,
      brandId: brand.id,
      hsnCode: "62121000",
      attributes: {
        fabric: "100% Cotton",
        purpose: "payment-testing",
        careInstructions: "Machine wash cold",
      },
      tags: ["demo", "test", "surekh"],
      isActive: true,
      isFeatured: false,
      soldCount: 0,
      ratingAvg: "5.00",
      ratingCount: 1,
      metaTitle: "Surekh Live Demo Test Item (₹1)",
      metaDesc:
        "Live payment testing product priced at ₹1 for payment verification.",
    });

    await db.insert(schema.productVariants).values({
      id: variantId,
      productId: productId,
      sku: DEMO_VARIANT_SKU,
      size: "Standard",
      color: "Rose",
      colorHex: "#c83c7e",
      price: "1.00",
      mrp: "1.00",
      isActive: true,
      sortOrder: 0,
      weightGrams: 100,
    });

    await db.insert(schema.inventory).values({
      id: createId(),
      variantId: variantId,
      quantity: 9999,
      reservedQuantity: 0,
      lowStockAlert: 5,
    });

    await db.insert(schema.productImages).values({
      id: createId(),
      productId: productId,
      variantId: variantId,
      url: DEMO_IMAGE_URL,
      alt: "Surekh ₹1 Test Product",
      isPrimary: true,
      sortOrder: 0,
    });

    console.log("✅ ₹1 Demo product created successfully!");
  }

  console.log("\n========================================================");
  console.log("🎉 ₹1 DEMO PRODUCT READY FOR PAYMENT GATEWAY TESTING");
  console.log("========================================================");
  console.log(`• Product Name : Surekh Live Demo Test Item (₹1)`);
  console.log(`• Slug         : ${DEMO_PRODUCT_SLUG}`);
  console.log(`• Variant SKU  : ${DEMO_VARIANT_SKU}`);
  console.log(`• Price        : ₹1.00 (MRP: ₹1.00)`);
  console.log(`• Shipping     : ₹0.00 (Waived for demo orders)`);
  console.log(`• Stock Qty    : 9,999`);
  console.log(`• Product URL  : /p/${DEMO_PRODUCT_SLUG}`);
  console.log("========================================================\n");

  await client.end();
}

main().catch(async (err) => {
  console.error("❌ Failed to create demo product:", err);
  await client.end();
  process.exit(1);
});
