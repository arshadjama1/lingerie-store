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

async function seed() {
  console.log("🌱 Starting database seed...");

  // 1. Clear existing data
  console.log("🧹 Cleaning up existing catalog tables...");
  await db.delete(schema.inventory);
  await db.delete(schema.productImages);
  await db.delete(schema.productVariants);
  await db.delete(schema.products);
  await db.delete(schema.categories);
  await db.delete(schema.brands);
  console.log("🧹 Cleanup complete.");

  // 2. Seed Brands
  console.log("🏷️ Seeding brands...");
  const brandData = [
    {
      id: createId(),
      name: "Lacy Secrets",
      slug: "lacy-secrets",
      description:
        "Delicate lace design, premium construction, and absolute elegance for special moments.",
      isActive: true,
    },
    {
      id: createId(),
      name: "Comfort Curve",
      slug: "comfort-curve",
      description:
        "Everyday comfort redefined. Soft fabrics, wire-free designs, and seamless support.",
      isActive: true,
    },
    {
      id: createId(),
      name: "Satin Seduction",
      slug: "satin-seduction",
      description:
        "Luxurious silk and satin nightwear, loungewear, and premium bridal lingerie.",
      isActive: true,
    },
  ];

  await db.insert(schema.brands).values(brandData);
  const seededBrands = await db.query.brands.findMany();
  console.log(`✅ Seeded ${seededBrands.length} brands.`);

  // 3. Seed Categories
  console.log("📁 Seeding categories...");
  const categoryData = [
    {
      id: createId(),
      name: "Bras",
      slug: "bras",
      path: "bras",
      parentId: null,
      imageUrl:
        "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?q=80&w=600",
      isActive: true,
      sortOrder: 1,
    },
    {
      id: createId(),
      name: "Panties",
      slug: "panties",
      path: "panties",
      parentId: null,
      imageUrl:
        "https://images.unsplash.com/photo-1616150638538-ffb0679a3fc4?q=80&w=600",
      isActive: true,
      sortOrder: 2,
    },
    {
      id: createId(),
      name: "Nightwear",
      slug: "nightwear",
      path: "nightwear",
      parentId: null,
      imageUrl:
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600",
      isActive: true,
      sortOrder: 3,
    },
    {
      id: createId(),
      name: "Shapewear",
      slug: "shapewear",
      path: "shapewear",
      parentId: null,
      imageUrl:
        "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?q=80&w=600",
      isActive: true,
      sortOrder: 4,
    },
    {
      id: createId(),
      name: "Loungewear",
      slug: "loungewear",
      path: "loungewear",
      parentId: null,
      imageUrl:
        "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=600",
      isActive: true,
      sortOrder: 5,
    },
  ];

  await db.insert(schema.categories).values(categoryData);
  const seededCategories = await db.query.categories.findMany();
  console.log(`✅ Seeded ${seededCategories.length} categories.`);

  // Setup sample product generation details
  const designPatterns = [
    "Classic",
    "Floral Lace",
    "Seamless",
    "Plunge",
    "Wireless",
    "Push-Up",
    "Satin Trim",
    "High-Waist",
    "Luxury",
    "Mesh Detail",
  ];
  const fabrics = [
    "90% Nylon, 10% Spandex",
    "85% Polyamide, 15% Elastane",
    "100% Mulberry Silk",
    "95% Modal, 5% Elastane",
    "92% Organic Cotton, 8% Elastane",
  ];
  const closures = [
    "Hook and Eye",
    "Pull-on",
    "Side Zip",
    "Tie back",
    "Front Closure",
  ];
  const paddings = ["Padded", "Non-padded", "Lightly padded", "Removable pads"];

  const categoryProductTemplates: Record<
    string,
    { names: string[]; tags: string[]; defaultDesc: string }[]
  > = {
    bras: [
      {
        names: [
          "Balconette Bra",
          "T-Shirt Bra",
          "Sports Bra",
          "Strapless Bra",
          "Bralette",
          "Plunge Bra",
          "Maternity Bra",
          "Demi Bra",
          "Wireless Bra",
          "Corset Bra",
        ],
        tags: ["bra", "support", "everyday", "underwire"],
        defaultDesc:
          "A perfect blend of comfort and style. Features adjustable straps and hook-and-eye closure for custom fit.",
      },
    ],
    panties: [
      {
        names: [
          "Lace Thong",
          "Seamless Briefs",
          "Hipster Panty",
          "Boy Shorts",
          "High-Waisted Briefs",
          "Bikini Panty",
          "Brazilian Thong",
          "Cheeky Panty",
          "Tanga",
          "G-String",
        ],
        tags: ["panty", "cotton", "lace", "seamless", "everyday"],
        defaultDesc:
          "Soft and breathable premium fabric construction. Fits snugly and stays invisible under tight garments.",
      },
    ],
    nightwear: [
      {
        names: [
          "Satin Chemise",
          "Silk Pajama Set",
          "Lace Nighty",
          "Camisole Set",
          "Velvet Robe",
          "Babydoll Dress",
          "Sleep Shirt",
          "Cotton Nightdress",
          "Bridal Robe Set",
          "Slip Dress",
        ],
        tags: ["nightwear", "sleepwear", "satin", "silk", "lounge"],
        defaultDesc:
          "Elegant drape and luxurious feel. Designed for relaxed night sleep or lazy lounging Sundays.",
      },
    ],
    shapewear: [
      {
        names: [
          "Tummy Control Bodysuit",
          "High-Waist Thigh Slimmer",
          "Waist Clincher",
          "Seamless Shaping Slip",
          "Booty Lifter Shorts",
          "Arm Shaper",
          "Full Body Suit",
          "Plunge Shaping Bodysuit",
          "Thigh Control Panty",
          "Camisole Shaper",
        ],
        tags: ["shapewear", "slimming", "tummy-control", "compression"],
        defaultDesc:
          "Medium-to-firm compression targeted zone shaping. Flat seams make it completely invisible under bodycon dresses.",
      },
    ],
    loungewear: [
      {
        names: [
          "Ribbed Knit Set",
          "Oversized Hoodie Set",
          "Fleece Joggers",
          "Satin Loungewear Set",
          "Knit Cardigan",
          "Modal Pajamas",
          "Terry Cloth Shorts",
          "Soft Modal Jogger Set",
          "Cashmere Blend Lounge Pants",
          "Zip-Up Romper",
        ],
        tags: ["loungewear", "comfy", "casual", "indoor"],
        defaultDesc:
          "Ultrasoft fabric blend meant for cozy and comfortable indoor wear, home workouts, or quick errand runs.",
      },
    ],
  };

  const sizesMap: Record<string, string[]> = {
    bras: ["32B", "34B", "36B", "32C", "34C", "36C", "38C"],
    panties: ["S", "M", "L", "XL", "XXL"],
    nightwear: ["S", "M", "L", "XL"],
    shapewear: ["S", "M", "L", "XL", "XXL"],
    loungewear: ["S", "M", "L", "XL"],
  };

  const colors = [
    { name: "Midnight Black", hex: "#0b0c10" },
    { name: "Crimson Red", hex: "#990000" },
    { name: "Dusty Rose", hex: "#dcae1d" },
    { name: "Pure White", hex: "#ffffff" },
    { name: "Satin Nude", hex: "#e5a88a" },
    { name: "Navy Blue", hex: "#1f3a52" },
    { name: "Emerald Green", hex: "#004b49" },
  ];

  const unsplashCatalogImages = [
    "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?q=80&w=600",
    "https://images.unsplash.com/photo-1616150638538-ffb0679a3fc4?q=80&w=600",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600",
    "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?q=80&w=600",
    "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=600",
    "https://images.unsplash.com/photo-1562572159-4ebcd318f4dd?q=80&w=600",
    "https://images.unsplash.com/photo-1581599129568-e3315162762b?q=80&w=600",
  ];

  console.log("🛍️ Generating 100 products (20 per category)...");
  let skuCounter = 1000;

  for (const cat of seededCategories) {
    const templates =
      categoryProductTemplates[cat.slug] || categoryProductTemplates["bras"];
    const template = templates[0];
    const sizes = sizesMap[cat.slug] || sizesMap["bras"];

    // Generate 20 products for this category
    for (let i = 0; i < 20; i++) {
      const brand = seededBrands[i % seededBrands.length];
      const designPattern = designPatterns[i % designPatterns.length];
      const templateName = template.names[i % template.names.length];

      const productName = `${designPattern} ${templateName}`;
      const productSlug = `${productName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${i}-${cat.slug}`;
      const productId = createId();

      const attributes = {
        fabric: fabrics[i % fabrics.length],
        closure: closures[i % closures.length],
        padding: paddings[i % paddings.length],
        careInstructions:
          "Hand wash only in cold water. Do not bleach or iron.",
      };

      // Create product
      await db.insert(schema.products).values({
        id: productId,
        name: productName,
        slug: productSlug,
        description: `${template.defaultDesc} Featuring ${designPattern.toLowerCase()} elements, made of premium raw material. Perfect fit and lasting quality.`,
        categoryId: cat.id,
        categoryPath: cat.path,
        brandId: brand.id,
        hsnCode: "62121000",
        attributes: attributes,
        tags: [...template.tags, designPattern.toLowerCase(), brand.slug],
        isActive: true,
        isFeatured: i < 3,
        soldCount: Math.floor(Math.random() * 500) + 10,
        ratingAvg: (Math.random() * 1.5 + 3.5).toFixed(2),
        ratingCount: Math.floor(Math.random() * 80) + 5,
        metaTitle: `${productName} | Shop Lingerie Online`,
        metaDesc: `Buy the premium ${productName} online at the best prices. Features include: ${attributes.fabric}, ${attributes.padding}.`,
      });

      // Create variants (different color & sizes)
      const productColors = [
        colors[i % colors.length],
        colors[(i + 2) % colors.length],
      ];

      const productSizes = sizes.slice(0, 3);

      let variantSortOrder = 0;

      for (const color of productColors) {
        for (const size of productSizes) {
          const variantId = createId();
          skuCounter++;
          const sku = `LS-${cat.slug.substring(0, 2).toUpperCase()}-${skuCounter}`;

          const baseMrp =
            799 + i * 100 + (size === "S" || size === "32B" ? 0 : 50);
          const discountPct = 0.1 + Math.random() * 0.2;
          const basePrice = Math.floor(baseMrp * (1 - discountPct));

          await db.insert(schema.productVariants).values({
            id: variantId,
            productId: productId,
            sku: sku,
            size: size,
            color: color.name,
            colorHex: color.hex,
            price: basePrice.toFixed(2),
            mrp: baseMrp.toFixed(2),
            isActive: true,
            sortOrder: variantSortOrder++,
            weightGrams: 120 + size.length * 15,
          });

          // Create inventory for this variant
          await db.insert(schema.inventory).values({
            id: createId(),
            variantId: variantId,
            quantity: Math.floor(Math.random() * 50) + 10,
            reservedQuantity: 0,
            lowStockAlert: 5,
          });
        }
      }

      // Create Images
      const primaryImgUrl =
        unsplashCatalogImages[i % unsplashCatalogImages.length];
      const secondaryImgUrl =
        unsplashCatalogImages[(i + 3) % unsplashCatalogImages.length];

      await db.insert(schema.productImages).values([
        {
          id: createId(),
          productId: productId,
          variantId: null,
          url: primaryImgUrl,
          alt: `${productName} Main View`,
          isPrimary: true,
          sortOrder: 1,
        },
        {
          id: createId(),
          productId: productId,
          variantId: null,
          url: secondaryImgUrl,
          alt: `${productName} Detail View`,
          isPrimary: false,
          sortOrder: 2,
        },
      ]);
    }
  }

  console.log(
    "✅ Seed generation complete. 100 products, variants, inventory, and images are successfully created."
  );
}

seed()
  .then(() => {
    console.log("✨ Seed successfully complete!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Seed failed with errors:", err);
    process.exit(1);
  });
