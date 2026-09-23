/* eslint-disable no-console */
import { createId } from "@paralleldrive/cuid2";
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

dotenv.config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_DIRECT_URL || process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error(
    "❌ DATABASE_DIRECT_URL or DATABASE_URL is not set in environment."
  );
  process.exit(1);
}

const client = postgres(databaseUrl, { max: 1 });
const db = drizzle(client, { schema });

// ─── Image base path (served from Next.js public/) ───────────────────────────
const IMG = "/images/products";

// ─── Colour hex lookup ────────────────────────────────────────────────────────
const COLOR_HEX: Record<string, string> = {
  Black: "#1a1a1a",
  "Navy Blue": "#1f3a52",
  Cinder: "#6d6f72",
  Maroon: "#800000",
  Pink: "#f4a7b9",
  Green: "#2d6a4f",
  Olive: "#6b7c3a",
  Skin: "#e8c49a",
  White: "#ffffff",
  Wine: "#722f37",
  Aqua: "#00bcd4",
};

async function seed() {
  console.log("🌱 Starting database seed with real client data...");

  // ── 1. Clear ALL dependent data in correct FK order ─────────────────────────
  console.log("🧹 Cleaning up existing data...");
  // cart_items → checkout_sessions → carts
  await db.delete(schema.cartItems);
  await db.delete(schema.checkoutSessions);
  await db.delete(schema.carts);
  // wishlist, reviews
  await db.delete(schema.wishlistItems);
  await db.delete(schema.reviews);
  // return_requests → order_items / order_status_history → orders
  await db.delete(schema.returnRequests);
  await db.delete(schema.orderItems);
  await db.delete(schema.orderStatusHistory);
  await db.delete(schema.orders);
  // Now catalog tables
  await db.delete(schema.inventory);
  await db.delete(schema.productImages);
  await db.delete(schema.productVariants);
  await db.delete(schema.products);
  await db.delete(schema.categories);
  await db.delete(schema.brands);
  console.log("🧹 Cleanup complete.");

  // ── 2. Seed Brand ────────────────────────────────────────────────────────────
  console.log("🏷️  Seeding brand...");
  const brandId = createId();
  await db.insert(schema.brands).values({
    id: brandId,
    name: "Surekh",
    slug: "surekh",
    description:
      "Surekh — thoughtfully designed innerwear and loungewear crafted from premium bamboo, modal and seamless fabrics for everyday comfort.",
    isActive: true,
  });
  console.log("✅ Brand seeded: Surekh");

  // ── 3. Seed Categories ───────────────────────────────────────────────────────
  console.log("📁 Seeding categories...");
  const categoryData = [
    {
      id: createId(),
      name: "Bras",
      slug: "bras",
      path: "bras",
      parentId: null,
      imageUrl: `${IMG}/bamboo-bra-black.png`,
      isActive: true,
      sortOrder: 1,
    },
    {
      id: createId(),
      name: "Panties",
      slug: "panties",
      path: "panties",
      parentId: null,
      imageUrl: `${IMG}/bamboo-undie-black.png`,
      isActive: true,
      sortOrder: 2,
    },
    {
      id: createId(),
      name: "Sets",
      slug: "sets",
      path: "sets",
      parentId: null,
      imageUrl: `${IMG}/lingerie-set-olive.png`,
      isActive: true,
      sortOrder: 3,
    },
    {
      id: createId(),
      name: "Nightwear",
      slug: "nightwear",
      path: "nightwear",
      parentId: null,
      imageUrl: null,
      isActive: true,
      sortOrder: 4,
    },
    {
      id: createId(),
      name: "Shapewear",
      slug: "shapewear",
      path: "shapewear",
      parentId: null,
      imageUrl: null,
      isActive: true,
      sortOrder: 5,
    },
    {
      id: createId(),
      name: "Loungewear",
      slug: "loungewear",
      path: "loungewear",
      parentId: null,
      imageUrl: `${IMG}/camisole-black.png`,
      isActive: true,
      sortOrder: 6,
    },
  ];

  await db.insert(schema.categories).values(categoryData);
  const seededCategories = await db.query.categories.findMany();
  const catBySlug = Object.fromEntries(
    seededCategories.map((c) => [c.slug, c])
  );
  console.log(`✅ Seeded ${seededCategories.length} categories.`);

  // ── 4. Product definitions ───────────────────────────────────────────────────
  //
  // Each entry describes one product card from the Excel sheet.
  // `variants` is an array of { color, sizes[], price, mrp, images[] }
  // `images`   are product-level images (not variant-specific)
  //
  interface VariantDef {
    color: string;
    sizes: string[];
    price: number;
    mrp: number;
    images: { url: string; alt: string; isPrimary: boolean }[];
  }
  interface ProductDef {
    name: string;
    slug: string;
    categorySlug: string;
    description: string;
    fabric: string | null;
    tags: string[];
    isFeatured: boolean;
    isBestSeller: boolean;
    variants: VariantDef[];
    productImages: { url: string; alt: string; isPrimary: boolean }[];
  }

  const products: ProductDef[] = [
    // ── Bamboo Fabric Undie ──────────────────────────────────────────────────
    {
      name: "Bamboo Fabric Undie",
      slug: "bamboo-fabric-undie",
      categorySlug: "panties",
      description:
        "Ultra-soft bamboo fabric undie that keeps you fresh and comfortable all day. Made from 95% bamboo and 5% elastane for a breathable, skin-friendly fit.",
      fabric: "95% Bamboo, 5% Elastane",
      tags: ["bamboo", "undie", "panty", "everyday", "best-seller"],
      isFeatured: true,
      isBestSeller: true,
      productImages: [
        {
          url: `${IMG}/bamboo-undie-black.png`,
          alt: "Bamboo Fabric Undie – Black Front",
          isPrimary: true,
        },
        {
          url: `${IMG}/floral-undie-navy.png`,
          alt: "Bamboo Fabric Undie – Navy Front",
          isPrimary: false,
        },
      ],
      variants: [
        {
          color: "Black",
          sizes: ["XS", "S", "M", "L", "XL", "XXL"],
          price: 300,
          mrp: 300,
          images: [
            {
              url: `${IMG}/bamboo-undie-black.png`,
              alt: "Bamboo Fabric Undie Black",
              isPrimary: true,
            },
          ],
        },
        {
          color: "Navy Blue",
          sizes: ["XS", "S", "M", "L", "XL", "XXL"],
          price: 300,
          mrp: 300,
          images: [
            {
              url: `${IMG}/floral-undie-navy.png`,
              alt: "Bamboo Fabric Undie Navy Blue",
              isPrimary: true,
            },
          ],
        },
      ],
    },

    // ── Bamboo Fabric Bra ────────────────────────────────────────────────────
    {
      name: "Bamboo Fabric Bra",
      slug: "bamboo-fabric-bra",
      categorySlug: "bras",
      description:
        "Wire-free lounge bra crafted from silky-soft bamboo. Provides gentle support with a barely-there feel. Perfect for all-day wear.",
      fabric: "95% Bamboo, 5% Elastane",
      tags: ["bamboo", "bra", "lounge-bra", "wire-free", "best-seller"],
      isFeatured: true,
      isBestSeller: true,
      productImages: [
        {
          url: `${IMG}/bamboo-bra-black.png`,
          alt: "Bamboo Fabric Bra – Black Front",
          isPrimary: true,
        },
        {
          url: `${IMG}/bamboo-bra-navy.png`,
          alt: "Bamboo Fabric Bra – Navy Front",
          isPrimary: false,
        },
        {
          url: `${IMG}/bamboo-bra-cinder.png`,
          alt: "Bamboo Fabric Bra – Cinder Front",
          isPrimary: false,
        },
      ],
      variants: [
        {
          color: "Black",
          sizes: ["XS", "S", "M", "L", "XL", "XXL"],
          price: 400,
          mrp: 400,
          images: [
            {
              url: `${IMG}/bamboo-bra-black.png`,
              alt: "Bamboo Fabric Bra Black Front",
              isPrimary: true,
            },
            {
              url: `${IMG}/bamboo-bra-black-back.png`,
              alt: "Bamboo Fabric Bra Black Back",
              isPrimary: false,
            },
          ],
        },
        {
          color: "Navy Blue",
          sizes: ["XS", "S", "M", "L", "XL", "XXL"],
          price: 400,
          mrp: 400,
          images: [
            {
              url: `${IMG}/bamboo-bra-navy.png`,
              alt: "Bamboo Fabric Bra Navy Front",
              isPrimary: true,
            },
            {
              url: `${IMG}/bamboo-bra-navy-back.png`,
              alt: "Bamboo Fabric Bra Navy Back",
              isPrimary: false,
            },
          ],
        },
        {
          color: "Cinder",
          sizes: ["XS", "S", "M", "L", "XL", "XXL"],
          price: 400,
          mrp: 400,
          images: [
            {
              url: `${IMG}/bamboo-bra-cinder.png`,
              alt: "Bamboo Fabric Bra Cinder Front",
              isPrimary: true,
            },
          ],
        },
      ],
    },

    // ── Overlap Bralette with Hipster Set ────────────────────────────────────
    {
      name: "Overlap Bralette with Hipster Set",
      slug: "overlap-bralette-hipster-set",
      categorySlug: "sets",
      description:
        "Elegant overlap bralette paired with a matching hipster — a coordinated set made from silky modal for a luxurious feel.",
      fabric: "95% Modal, 5% Elastane",
      tags: ["bralette", "hipster", "set", "modal", "lingerie-set"],
      isFeatured: true,
      isBestSeller: false,
      productImages: [
        {
          url: `${IMG}/mischief-lounge-bra-pink.png`,
          alt: "Overlap Bralette with Hipster Set – Maroon",
          isPrimary: true,
        },
      ],
      variants: [
        {
          color: "Maroon",
          sizes: ["XS", "S", "M", "L", "XL", "XXL"],
          price: 750,
          mrp: 750,
          images: [
            {
              url: `${IMG}/mischief-lounge-bra-pink.png`,
              alt: "Overlap Bralette Hipster Set Maroon",
              isPrimary: true,
            },
          ],
        },
      ],
    },

    // ── Mischief Lounge Bra ──────────────────────────────────────────────────
    {
      name: "Mischief Lounge Bra",
      slug: "mischief-lounge-bra",
      categorySlug: "bras",
      description:
        "Playfully designed lounge bra in soft modal. Great for a relaxed day at home or as a stylish layer under your favourite top.",
      fabric: "95% Modal, 5% Elastane",
      tags: ["lounge-bra", "modal", "bralette", "casual"],
      isFeatured: false,
      isBestSeller: false,
      productImages: [
        {
          url: `${IMG}/mischief-lounge-bra-pink.png`,
          alt: "Mischief Lounge Bra – Pink",
          isPrimary: true,
        },
      ],
      variants: [
        {
          color: "Pink",
          sizes: ["XS", "S", "M", "L", "XL", "XXL"],
          price: 300,
          mrp: 300,
          images: [
            {
              url: `${IMG}/mischief-lounge-bra-pink.png`,
              alt: "Mischief Lounge Bra Pink",
              isPrimary: true,
            },
          ],
        },
      ],
    },

    // ── Pack of 3 Floral Undie ───────────────────────────────────────────────
    {
      name: "Pack of 3 Floral Undie",
      slug: "pack-of-3-floral-undie",
      categorySlug: "panties",
      description:
        "Get three floral-print undies in a single pack. Made from breathable modal with a comfortable high-leg cut. Great value for everyday wear.",
      fabric: "95% Modal, 5% Elastane",
      tags: ["floral", "undie", "pack", "modal", "high-leg"],
      isFeatured: false,
      isBestSeller: false,
      productImages: [
        {
          url: `${IMG}/floral-undie-navy.png`,
          alt: "Pack of 3 Floral Undie – Navy Blue",
          isPrimary: true,
        },
        {
          url: `${IMG}/floral-undie-pink.png`,
          alt: "Pack of 3 Floral Undie – Pink Back",
          isPrimary: false,
        },
      ],
      variants: [
        {
          color: "Navy Blue",
          sizes: ["XS", "S", "M", "L", "XL", "XXL"],
          price: 750,
          mrp: 750,
          images: [
            {
              url: `${IMG}/floral-undie-navy.png`,
              alt: "Pack of 3 Floral Undie Navy Blue",
              isPrimary: true,
            },
          ],
        },
        {
          color: "Pink",
          sizes: ["XS", "S", "M", "L", "XL", "XXL"],
          price: 750,
          mrp: 750,
          images: [
            {
              url: `${IMG}/floral-undie-pink.png`,
              alt: "Pack of 3 Floral Undie Pink",
              isPrimary: true,
            },
          ],
        },
        {
          color: "Green",
          sizes: ["XS", "S", "M", "L", "XL", "XXL"],
          price: 750,
          mrp: 750,
          images: [
            {
              url: `${IMG}/floral-undie-navy.png`,
              alt: "Pack of 3 Floral Undie Green",
              isPrimary: true,
            },
          ],
        },
      ],
    },

    // ── Seamless Undie Pack of 3 ─────────────────────────────────────────────
    {
      name: "Seamless Undie Pack of 3",
      slug: "seamless-undie-pack-of-3",
      categorySlug: "panties",
      description:
        "Three seamless undies with invisible edges — no panty lines, no digging. Perfect under fitted clothing. Available in classic colours.",
      fabric: "Imported Seamless Fabric",
      tags: ["seamless", "undie", "pack", "no-show", "best-seller"],
      isFeatured: true,
      isBestSeller: true,
      productImages: [
        {
          url: `${IMG}/seamless-undie-pack.png`,
          alt: "Seamless Undie Pack of 3",
          isPrimary: true,
        },
        {
          url: `${IMG}/seamless-undie-navy.png`,
          alt: "Seamless Undie – Navy Blue Front",
          isPrimary: false,
        },
      ],
      variants: [
        {
          color: "Black",
          sizes: ["M", "L", "XL", "XXL", "3XL"],
          price: 750,
          mrp: 750,
          images: [
            {
              url: `${IMG}/seamless-undie-pack.png`,
              alt: "Seamless Undie Pack Black",
              isPrimary: true,
            },
          ],
        },
        {
          color: "Navy Blue",
          sizes: ["M", "L", "XL", "XXL", "3XL"],
          price: 750,
          mrp: 750,
          images: [
            {
              url: `${IMG}/seamless-undie-navy.png`,
              alt: "Seamless Undie Pack Navy Blue",
              isPrimary: true,
            },
          ],
        },
        {
          color: "Maroon",
          sizes: ["M", "L", "XL", "XXL", "3XL"],
          price: 750,
          mrp: 750,
          images: [
            {
              url: `${IMG}/seamless-undie-pack.png`,
              alt: "Seamless Undie Pack Maroon",
              isPrimary: true,
            },
          ],
        },
      ],
    },

    // ── Luxuria Pad Lingerie Set ─────────────────────────────────────────────
    {
      name: "Luxuria Pad Lingerie Set",
      slug: "luxuria-pad-lingerie-set",
      categorySlug: "sets",
      description:
        "Premium padded lingerie set for a flattering silhouette. Olive comes in standard cup sizes; Maroon is available in a relaxed fit.",
      fabric: null,
      tags: ["lingerie-set", "padded", "luxury", "sets"],
      isFeatured: false,
      isBestSeller: false,
      productImages: [
        {
          url: `${IMG}/lingerie-set-olive.png`,
          alt: "Luxuria Pad Lingerie Set – Olive Front",
          isPrimary: true,
        },
      ],
      variants: [
        {
          color: "Olive",
          sizes: ["32", "34", "36"],
          price: 700,
          mrp: 700,
          images: [
            {
              url: `${IMG}/lingerie-set-olive.png`,
              alt: "Luxuria Pad Lingerie Set Olive",
              isPrimary: true,
            },
          ],
        },
        {
          color: "Maroon",
          sizes: ["XS", "S", "M", "L", "XL", "XXL"],
          price: 650,
          mrp: 650,
          images: [
            {
              url: `${IMG}/lingerie-set-olive.png`,
              alt: "Luxuria Pad Lingerie Set Maroon",
              isPrimary: true,
            },
          ],
        },
      ],
    },

    // ── Camisole ─────────────────────────────────────────────────────────────
    {
      name: "Camisole",
      slug: "camisole",
      categorySlug: "loungewear",
      description:
        "Lightweight, versatile camisole that can be worn on its own or layered. Available in five classic colours for every wardrobe.",
      fabric: null,
      tags: ["camisole", "lounge", "layer", "everyday"],
      isFeatured: false,
      isBestSeller: false,
      productImages: [
        {
          url: `${IMG}/camisole-black.png`,
          alt: "Camisole – Black",
          isPrimary: true,
        },
        {
          url: `${IMG}/camisole-pink.png`,
          alt: "Camisole – Pink",
          isPrimary: false,
        },
      ],
      variants: [
        {
          color: "Black",
          sizes: ["L", "XL", "2XL"],
          price: 300,
          mrp: 300,
          images: [
            {
              url: `${IMG}/camisole-black.png`,
              alt: "Camisole Black",
              isPrimary: true,
            },
          ],
        },
        {
          color: "Pink",
          sizes: ["L", "XL", "2XL"],
          price: 300,
          mrp: 300,
          images: [
            {
              url: `${IMG}/camisole-pink.png`,
              alt: "Camisole Pink",
              isPrimary: true,
            },
          ],
        },
        {
          color: "Skin",
          sizes: ["L", "XL", "2XL"],
          price: 300,
          mrp: 300,
          images: [
            {
              url: `${IMG}/camisole-black.png`,
              alt: "Camisole Skin",
              isPrimary: true,
            },
          ],
        },
        {
          color: "White",
          sizes: ["L", "XL", "2XL"],
          price: 300,
          mrp: 300,
          images: [
            {
              url: `${IMG}/camisole-black.png`,
              alt: "Camisole White",
              isPrimary: true,
            },
          ],
        },
        {
          color: "Wine",
          sizes: ["L", "XL", "2XL"],
          price: 300,
          mrp: 300,
          images: [
            {
              url: `${IMG}/camisole-black.png`,
              alt: "Camisole Wine",
              isPrimary: true,
            },
          ],
        },
      ],
    },
  ];

  // ── 5. Insert products, variants, inventory & images ─────────────────────────
  console.log(`🛍️  Seeding ${products.length} real products...`);
  let skuCounter = 1000;

  for (const p of products) {
    const cat = catBySlug[p.categorySlug];
    if (!cat) {
      console.error(`❌ Category not found: ${p.categorySlug}`);
      continue;
    }

    const productId = createId();

    // Insert product
    await db.insert(schema.products).values({
      id: productId,
      name: p.name,
      slug: p.slug,
      description: p.description,
      categoryId: cat.id,
      categoryPath: cat.path,
      brandId: brandId,
      hsnCode: "62121000",
      attributes: {
        ...(p.fabric ? { fabric: p.fabric } : {}),
        careInstructions:
          "Hand wash only in cold water. Do not bleach or iron.",
      },
      tags: [...p.tags, "surekh", ...(p.isBestSeller ? ["best-seller"] : [])],
      isActive: true,
      isFeatured: p.isFeatured,
      soldCount: p.isBestSeller
        ? Math.floor(Math.random() * 300) + 100
        : Math.floor(Math.random() * 50) + 5,
      ratingAvg: "0",
      ratingCount: 0,
      metaTitle: `${p.name} | Surekh`,
      metaDesc: `Buy ${p.name} online at Surekh.${p.fabric ? ` Made from ${p.fabric}.` : ""} Shop premium innerwear with fast delivery.`,
    });

    // Insert product-level images
    let imgSortOrder = 1;
    for (const img of p.productImages) {
      await db.insert(schema.productImages).values({
        id: createId(),
        productId,
        variantId: null,
        url: img.url,
        alt: img.alt,
        isPrimary: img.isPrimary,
        sortOrder: imgSortOrder++,
      });
    }

    // Insert variants
    let variantSortOrder = 0;
    for (const v of p.variants) {
      for (const size of v.sizes) {
        skuCounter++;
        const variantId = createId();
        const colorSlug = v.color.toLowerCase().replace(/\s+/g, "-");
        const sku = `SRK-${p.slug.substring(0, 6).toUpperCase().replace(/-/g, "")}-${colorSlug.substring(0, 3).toUpperCase()}-${size}-${skuCounter}`;

        await db.insert(schema.productVariants).values({
          id: variantId,
          productId,
          sku,
          size,
          color: v.color,
          colorHex: COLOR_HEX[v.color] ?? "#888888",
          price: v.price.toFixed(2),
          mrp: v.mrp.toFixed(2),
          isActive: true,
          sortOrder: variantSortOrder++,
          weightGrams: 120,
        });

        // Inventory
        await db.insert(schema.inventory).values({
          id: createId(),
          variantId,
          quantity: 50,
          reservedQuantity: 0,
          lowStockAlert: 5,
        });

        // Variant-level images
        let vImgSort = 1;
        for (const img of v.images) {
          await db.insert(schema.productImages).values({
            id: createId(),
            productId,
            variantId,
            url: img.url,
            alt: img.alt,
            isPrimary: img.isPrimary,
            sortOrder: vImgSort++,
          });
        }
      }
    }

    console.log(`  ✅ ${p.name} — ${p.variants.length} colour(s)`);
  }

  console.log("\n✅ Seed complete!");
  console.log(`   • 1 brand (Surekh)`);
  console.log(`   • ${seededCategories.length} categories`);
  console.log(
    `   • ${products.length} products with real data, images, variants & inventory`
  );
}

seed()
  .then(() => {
    console.log("✨ Database seeded successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
