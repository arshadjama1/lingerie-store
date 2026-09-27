/* eslint-disable no-console */
import { createId } from "@paralleldrive/cuid2";
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

dotenv.config({ path: ".env.local" });
if (!process.env.DATABASE_DIRECT_URL && !process.env.DATABASE_URL) {
  dotenv.config({ path: ".env" });
}

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
  Blue: "#2563eb",
  Brown: "#6e473b",
  Burgundy: "#6b1d2f",
  Grey: "#71717a",
  "Berry Pink": "#be185d",
  Coffee: "#543d2b",
};

async function seed() {
  console.log("🌱 Starting database seed with updated client data...");

  // ── 1. Clear ALL dependent data in correct FK order ─────────────────────────
  console.log("🧹 Cleaning up existing data...");
  // cart_items → checkout_sessions → carts
  await db.delete(schema.cartItems);
  await db.delete(schema.checkoutSessions);
  await db.delete(schema.carts);
  // wishlist, reviews
  await db.delete(schema.wishlistItems);
  await db.delete(schema.reviews);
  // payments & coupon usage
  await db.delete(schema.payments);
  await db.delete(schema.couponUsage);
  // return_requests → order_items / order_status_history → orders
  await db.delete(schema.returnRequests);
  await db.delete(schema.orderItems);
  await db.delete(schema.orderStatusHistory);
  await db.delete(schema.orders);
  // coupons (references categories)
  await db.delete(schema.coupons);
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
      "Surekh — thoughtfully designed innerwear and loungewear crafted from premium bamboo, modal and seamless fabrics for everyday comfort naturally.",
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
      imageUrl: `${IMG}/bamboo-bra-black-1.png`,
      isActive: true,
      sortOrder: 1,
    },
    {
      id: createId(),
      name: "Panties",
      slug: "panties",
      path: "panties",
      parentId: null,
      imageUrl: `${IMG}/bamboo-undie-black-1.png`,
      isActive: true,
      sortOrder: 2,
    },
    {
      id: createId(),
      name: "Sets",
      slug: "sets",
      path: "sets",
      parentId: null,
      imageUrl: `${IMG}/lingerie-set-olive-1.png`,
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
      imageUrl: `${IMG}/camisole-pink-1.png`,
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
    // ── 1. Bamboo Fabric Undie ───────────────────────────────────────────────
    {
      name: "Bamboo Fabric Undie",
      slug: "bamboo-fabric-undie",
      categorySlug: "panties",
      description: `# SUREK Bamboo Fabric Undie — Black

**Softness that moves with you.**

Meet the **SUREK Bamboo Fabric Undie**, designed for everyday comfort with a smooth, lightweight feel. Crafted from a premium blend of **95% bamboo and 5% elastane**, it offers a soft touch against the skin with comfortable stretch that moves naturally with your body.

The classic **black finish** makes it an effortless everyday essential, while the flexible construction provides a comfortable fit throughout the day.

### Key Features

* **Premium Bamboo Blend:** Made with 95% bamboo and 5% elastane.
* **Soft & Comfortable:** Smooth fabric designed for an easy, comfortable feel against the skin.
* **Flexible Fit:** Elastane provides gentle stretch for freedom of movement.
* **Everyday Essential:** Ideal for daily wear and easy to pair with your everyday wardrobe.
* **Classic Black:** A timeless color that belongs in every essentials collection.
* **Inclusive Sizing:** Available in **XS, S, M, L, XL, and XXL**.

### Fabric Composition

**95% Bamboo | 5% Elastane**

### Available Sizes

**XS | S | M | L | XL | XXL**

### Color

**Black**

**SUREK — Everyday comfort, naturally.**`,
      fabric: "95% Bamboo, 5% Elastane",
      tags: ["bamboo", "undie", "panty", "everyday", "best-seller"],
      isFeatured: true,
      isBestSeller: true,
      productImages: [
        {
          url: `${IMG}/bamboo-undie-black-1.png`,
          alt: "Bamboo Fabric Undie – Black Studio Front",
          isPrimary: true,
        },
        {
          url: `${IMG}/bamboo-undie-black-2.png`,
          alt: "Bamboo Fabric Undie – Black Lifestyle",
          isPrimary: false,
        },
        {
          url: `${IMG}/bamboo-undie-navy-1.png`,
          alt: "Bamboo Fabric Undie – Navy Blue Studio",
          isPrimary: false,
        },
        {
          url: `${IMG}/bamboo-undie-navy-2.png`,
          alt: "Bamboo Fabric Undie – Navy Blue Lifestyle",
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
              url: `${IMG}/bamboo-undie-black-1.png`,
              alt: "Bamboo Fabric Undie Black Studio",
              isPrimary: true,
            },
            {
              url: `${IMG}/bamboo-undie-black-2.png`,
              alt: "Bamboo Fabric Undie Black Lifestyle",
              isPrimary: false,
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
              url: `${IMG}/bamboo-undie-navy-1.png`,
              alt: "Bamboo Fabric Undie Navy Blue Studio",
              isPrimary: true,
            },
            {
              url: `${IMG}/bamboo-undie-navy-2.png`,
              alt: "Bamboo Fabric Undie Navy Blue Lifestyle",
              isPrimary: false,
            },
          ],
        },
      ],
    },

    // ── 2. Bamboo Fabric Bra ─────────────────────────────────────────────────
    {
      name: "Bamboo Fabric Bra",
      slug: "bamboo-fabric-bra",
      categorySlug: "bras",
      description: `# SUREK Bamboo Fabric Bra — Black

**Soft support for every day.**

Meet the **SUREK Bamboo Fabric Bra**, designed to bring together everyday comfort, a soft feel, and a flexible fit. Made from a premium blend of **95% bamboo and 5% elastane**, the fabric feels smooth against the skin while offering comfortable stretch that moves naturally with you.

The classic **black finish** makes it a versatile everyday essential, designed to fit seamlessly into your daily wardrobe.

### Key Features

* **Premium Bamboo Blend:** Made with 95% bamboo and 5% elastane.
* **Soft & Comfortable:** Smooth fabric designed for a comfortable feel against the skin.
* **Flexible Fit:** Elastane adds stretch for natural freedom of movement.
* **Everyday Support:** Designed for comfortable, everyday wear.
* **Classic Black:** A timeless shade that pairs effortlessly with your wardrobe.
* **Inclusive Sizing:** Available in **XS, S, M, L, XL, and XXL**.

### Fabric Composition

**95% Bamboo | 5% Elastane**

### Available Sizes

**XS | S | M | L | XL | XXL**

### Color

**Black**

**SUREK — Everyday comfort, naturally.**`,
      fabric: "95% Bamboo, 5% Elastane",
      tags: ["bamboo", "bra", "lounge-bra", "wire-free", "best-seller"],
      isFeatured: true,
      isBestSeller: true,
      productImages: [
        {
          url: `${IMG}/bamboo-bra-black-1.png`,
          alt: "Bamboo Fabric Bra – Black Front",
          isPrimary: true,
        },
        {
          url: `${IMG}/bamboo-bra-navy-1.png`,
          alt: "Bamboo Fabric Bra – Navy Blue Front",
          isPrimary: false,
        },
        {
          url: `${IMG}/bamboo-bra-cinder-1.png`,
          alt: "Bamboo Fabric Bra – Cinder Front",
          isPrimary: false,
        },
        {
          url: `${IMG}/bamboo-bra-black-2.png`,
          alt: "Bamboo Fabric Bra – Black Detail",
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
              url: `${IMG}/bamboo-bra-black-1.png`,
              alt: "Bamboo Fabric Bra Black Front",
              isPrimary: true,
            },
            {
              url: `${IMG}/bamboo-bra-black-2.png`,
              alt: "Bamboo Fabric Bra Black Side",
              isPrimary: false,
            },
            {
              url: `${IMG}/bamboo-bra-black-3.png`,
              alt: "Bamboo Fabric Bra Black Detail",
              isPrimary: false,
            },
            {
              url: `${IMG}/bamboo-bra-black-4.png`,
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
              url: `${IMG}/bamboo-bra-navy-1.png`,
              alt: "Bamboo Fabric Bra Navy Blue Front",
              isPrimary: true,
            },
            {
              url: `${IMG}/bamboo-bra-navy-2.png`,
              alt: "Bamboo Fabric Bra Navy Blue Side",
              isPrimary: false,
            },
            {
              url: `${IMG}/bamboo-bra-navy-3.png`,
              alt: "Bamboo Fabric Bra Navy Blue Detail",
              isPrimary: false,
            },
            {
              url: `${IMG}/bamboo-bra-navy-4.png`,
              alt: "Bamboo Fabric Bra Navy Blue Back",
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
              url: `${IMG}/bamboo-bra-cinder-1.png`,
              alt: "Bamboo Fabric Bra Cinder Front",
              isPrimary: true,
            },
            {
              url: `${IMG}/bamboo-bra-cinder-2.png`,
              alt: "Bamboo Fabric Bra Cinder Side",
              isPrimary: false,
            },
            {
              url: `${IMG}/bamboo-bra-cinder-3.png`,
              alt: "Bamboo Fabric Bra Cinder Detail",
              isPrimary: false,
            },
            {
              url: `${IMG}/bamboo-bra-cinder-4.png`,
              alt: "Bamboo Fabric Bra Cinder Model",
              isPrimary: false,
            },
          ],
        },
      ],
    },

    // ── 3. Overlap Bralette with Hipster Set ─────────────────────────────────
    {
      name: "Overlap Bralette with Hipster Set",
      slug: "overlap-bralette-hipster-set",
      categorySlug: "sets",
      description: `# SUREK Overlap Bralette with Hipster Set — Maroon

**Effortless comfort, made to move with you.**

Meet the **SUREK Overlap Bralette with Hipster Set**, a coordinated everyday essential designed for softness, flexibility, and all-day comfort. Crafted from a premium blend of **95% Modal and 5% elastane**, the fabric offers a smooth, soft feel against the skin with comfortable stretch for natural movement.

The elegant **maroon finish** adds a refined touch to this versatile set, while the coordinated bralette and hipster create a comfortable matching look for everyday wear.

### Key Features

* **Premium Modal Blend:** Made with 95% Modal and 5% elastane.
* **Soft & Smooth Feel:** Modal fabric provides a soft, comfortable feel against the skin.
* **Flexible Fit:** Elastane adds stretch for easy movement and a comfortable fit.
* **Coordinated Set:** Includes an **overlap bralette and matching hipster**.
* **Everyday Comfort:** Designed for comfortable daily wear.
* **Elegant Maroon:** A rich, sophisticated shade that adds a stylish touch.
* **Inclusive Sizing:** Available in **XS, S, M, L, XL, and XXL**.

### Set Includes

**1 Overlap Bralette + 1 Matching Hipster**

### Fabric Composition

**95% Modal | 5% Elastane**

### Available Sizes

**XS | S | M | L | XL | XXL**

### Color

**Maroon**

**SUREK — Everyday comfort, naturally.**`,
      fabric: "95% Modal, 5% Elastane",
      tags: ["bralette", "hipster", "set", "modal", "lingerie-set"],
      isFeatured: true,
      isBestSeller: false,
      productImages: [
        {
          url: `${IMG}/overlap-bralette-placeholder.png`,
          alt: "Overlap Bralette with Hipster Set – Imagery Coming Soon",
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
              url: `${IMG}/overlap-bralette-placeholder.png`,
              alt: "Overlap Bralette Hipster Set Maroon – Imagery Coming Soon",
              isPrimary: true,
            },
          ],
        },
      ],
    },

    // ── 4. Mischief Lounge Bra ───────────────────────────────────────────────
    {
      name: "Mischief Lounge Bra",
      slug: "mischief-lounge-bra",
      categorySlug: "bras",
      description: `# SUREK Mischief Lounge Bra — Pink

**Relaxed comfort with a playful touch.**

Meet the **SUREK Mischief Lounge Bra**, designed for easy everyday comfort with a soft, smooth feel. Crafted from a premium blend of **95% Modal and 5% elastane**, the fabric feels gentle against the skin while offering comfortable stretch that moves naturally with your body.

The playful **pink finish** adds a fresh, cheerful touch, making it an effortless choice for lounging, relaxing, or comfortable everyday wear.

### Key Features

* **Premium Modal Blend:** Made with 95% Modal and 5% elastane.
* **Soft & Smooth Feel:** Designed to feel gentle and comfortable against the skin.
* **Flexible Stretch:** Elastane provides comfortable stretch for natural movement.
* **Relaxed Everyday Wear:** Ideal for lounging, relaxing, and everyday comfort.
* **Playful Pink:** A fresh, vibrant shade with a fun and youthful feel.
* **Inclusive Sizing:** Available in **XS, S, M, L, XL, and XXL**.

### Fabric Composition

**95% Modal | 5% Elastane**

### Available Sizes

**XS | S | M | L | XL | XXL**

### Color

**Pink**

**SUREK — Everyday comfort, naturally.**`,
      fabric: "95% Modal, 5% Elastane",
      tags: ["lounge-bra", "modal", "bralette", "casual"],
      isFeatured: false,
      isBestSeller: false,
      productImages: [
        {
          url: `${IMG}/mischief-lounge-bra-1.png`,
          alt: "Mischief Lounge Bra – Pink Front",
          isPrimary: true,
        },
        {
          url: `${IMG}/mischief-lounge-bra-2.png`,
          alt: "Mischief Lounge Bra – Pink Side",
          isPrimary: false,
        },
        {
          url: `${IMG}/mischief-lounge-bra-3.png`,
          alt: "Mischief Lounge Bra – Pink Detail",
          isPrimary: false,
        },
        {
          url: `${IMG}/mischief-lounge-bra-4.png`,
          alt: "Mischief Lounge Bra – Pink Back",
          isPrimary: false,
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
              url: `${IMG}/mischief-lounge-bra-1.png`,
              alt: "Mischief Lounge Bra Pink Front",
              isPrimary: true,
            },
            {
              url: `${IMG}/mischief-lounge-bra-2.png`,
              alt: "Mischief Lounge Bra Pink Side",
              isPrimary: false,
            },
            {
              url: `${IMG}/mischief-lounge-bra-3.png`,
              alt: "Mischief Lounge Bra Pink Detail",
              isPrimary: false,
            },
            {
              url: `${IMG}/mischief-lounge-bra-4.png`,
              alt: "Mischief Lounge Bra Pink Back",
              isPrimary: false,
            },
          ],
        },
      ],
    },

    // ── 5. Pack of 3 Floral Undie ────────────────────────────────────────────
    {
      name: "Pack of 3 Floral Undie",
      slug: "pack-of-3-floral-undie",
      categorySlug: "panties",
      description: `# SUREK Pack of 3 Floral Undie — Navy Blue

**Everyday comfort, with a touch of floral charm.**

Meet the **SUREK Pack of 3 Floral Undie**, a practical everyday essential designed for softness, flexibility, and lasting comfort. Crafted from a premium blend of **95% Modal and 5% elastane**, the fabric feels smooth and gentle against the skin while providing comfortable stretch for natural movement.

The **navy blue** color adds a timeless, versatile touch, while the floral design brings a subtle feminine detail to your everyday essentials. With three pieces included, this pack makes it easy to refresh your daily underwear collection.

### Key Features

* **Premium Modal Blend:** Made with 95% Modal and 5% elastane.
* **Soft & Smooth Feel:** Designed for a gentle, comfortable feel against the skin.
* **Flexible Fit:** Elastane provides comfortable stretch for easy movement.
* **Floral Design:** A delicate floral detail adds a stylish touch to an everyday essential.
* **Convenient 3-Pack:** Includes **3 floral undies** for everyday rotation.
* **Classic Navy Blue:** A versatile shade that complements any essentials collection.
* **Inclusive Sizing:** Available in **XS, S, M, L, XL, and XXL**.

### Pack Includes

**3 Floral Undies**

### Fabric Composition

**95% Modal | 5% Elastane**

### Available Sizes

**XS | S | M | L | XL | XXL**

### Color

**Navy Blue**

**SUREK — Everyday comfort, naturally.**`,
      fabric: "95% Modal, 5% Elastane",
      tags: ["floral", "undie", "pack", "modal", "high-leg"],
      isFeatured: false,
      isBestSeller: false,
      productImages: [
        {
          url: `${IMG}/floral-undie-navy-1.png`,
          alt: "Pack of 3 Floral Undie – Navy Blue Front",
          isPrimary: true,
        },
        {
          url: `${IMG}/floral-undie-pink-1.png`,
          alt: "Pack of 3 Floral Undie – Pink Front",
          isPrimary: false,
        },
        {
          url: `${IMG}/floral-undie-green-1.png`,
          alt: "Pack of 3 Floral Undie – Green Front",
          isPrimary: false,
        },
        {
          url: `${IMG}/floral-undie-navy-2.png`,
          alt: "Pack of 3 Floral Undie – Navy Blue Angle",
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
              url: `${IMG}/floral-undie-navy-1.png`,
              alt: "Pack of 3 Floral Undie Navy Blue Front",
              isPrimary: true,
            },
            {
              url: `${IMG}/floral-undie-navy-2.png`,
              alt: "Pack of 3 Floral Undie Navy Blue Side",
              isPrimary: false,
            },
            {
              url: `${IMG}/floral-undie-navy-3.png`,
              alt: "Pack of 3 Floral Undie Navy Blue Detail",
              isPrimary: false,
            },
            {
              url: `${IMG}/floral-undie-navy-4.png`,
              alt: "Pack of 3 Floral Undie Navy Blue Back",
              isPrimary: false,
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
              url: `${IMG}/floral-undie-pink-1.png`,
              alt: "Pack of 3 Floral Undie Pink Front",
              isPrimary: true,
            },
            {
              url: `${IMG}/floral-undie-pink-2.png`,
              alt: "Pack of 3 Floral Undie Pink Side",
              isPrimary: false,
            },
            {
              url: `${IMG}/floral-undie-pink-3.png`,
              alt: "Pack of 3 Floral Undie Pink Detail",
              isPrimary: false,
            },
            {
              url: `${IMG}/floral-undie-pink-4.png`,
              alt: "Pack of 3 Floral Undie Pink Back",
              isPrimary: false,
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
              url: `${IMG}/floral-undie-green-1.png`,
              alt: "Pack of 3 Floral Undie Green Front",
              isPrimary: true,
            },
            {
              url: `${IMG}/floral-undie-green-2.png`,
              alt: "Pack of 3 Floral Undie Green Side",
              isPrimary: false,
            },
            {
              url: `${IMG}/floral-undie-green-3.png`,
              alt: "Pack of 3 Floral Undie Green Detail",
              isPrimary: false,
            },
          ],
        },
      ],
    },

    // ── 6. Seamless Undie pack of 3 ──────────────────────────────────────────
    {
      name: "Seamless Undie pack of 3",
      slug: "seamless-undie-pack-of-3",
      categorySlug: "panties",
      description: `# SUREK Seamless Undie Pack of 3 — Black

**Smooth comfort, seamless confidence.**

Meet the **SUREK Seamless Undie Pack of 3**, designed for everyday comfort with a smooth, streamlined feel. The seamless construction helps create a clean look under clothing while providing comfortable flexibility for everyday movement.

Finished in classic **black**, this versatile 3-pack is an easy addition to your everyday essentials collection. With sizes ranging from **M to 3XL**, it offers comfortable options for a wider range of fits.

### Key Features

* **Seamless Construction:** Designed for a smooth, streamlined feel and a clean appearance under clothing.
* **Everyday Comfort:** Made for comfortable daily wear and easy movement.
* **Flexible Fit:** Designed to move comfortably with your body.
* **Convenient 3-Pack:** Includes **3 seamless undies** for easy everyday rotation.
* **Classic Black:** A timeless, versatile shade for your essentials collection.
* **Extended Size Range:** Available in **M, L, XL, XXL, and 3XL**.
* **Imported:** Imported product.

### Pack Includes

**3 Seamless Undies**

### Material

**Imported**

### Available Sizes

**M | L | XL | XXL | 3XL**

### Color

**Black**

**SUREK — Everyday comfort, naturally.**`,
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
          url: `${IMG}/seamless-undie-navy-1.png`,
          alt: "Seamless Undie – Navy Blue Front",
          isPrimary: false,
        },
        {
          url: `${IMG}/seamless-undie-black-1.png`,
          alt: "Seamless Undie – Black Front",
          isPrimary: false,
        },
        {
          url: `${IMG}/seamless-undie-maroon-1.png`,
          alt: "Seamless Undie – Maroon Front",
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
              url: `${IMG}/seamless-undie-black-1.png`,
              alt: "Seamless Undie Pack Black Front",
              isPrimary: true,
            },
            {
              url: `${IMG}/seamless-undie-black-2.png`,
              alt: "Seamless Undie Pack Black Side",
              isPrimary: false,
            },
            {
              url: `${IMG}/seamless-undie-black-3.png`,
              alt: "Seamless Undie Pack Black Detail",
              isPrimary: false,
            },
            {
              url: `${IMG}/seamless-undie-black-4.png`,
              alt: "Seamless Undie Pack Black Flat",
              isPrimary: false,
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
              url: `${IMG}/seamless-undie-navy-1.png`,
              alt: "Seamless Undie Pack Navy Blue Front",
              isPrimary: true,
            },
            {
              url: `${IMG}/seamless-undie-navy-2.png`,
              alt: "Seamless Undie Pack Navy Blue Side",
              isPrimary: false,
            },
            {
              url: `${IMG}/seamless-undie-navy-3.png`,
              alt: "Seamless Undie Pack Navy Blue Detail",
              isPrimary: false,
            },
            {
              url: `${IMG}/seamless-undie-navy-4.png`,
              alt: "Seamless Undie Pack Navy Blue Back",
              isPrimary: false,
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
              url: `${IMG}/seamless-undie-maroon-1.png`,
              alt: "Seamless Undie Pack Maroon Front",
              isPrimary: true,
            },
            {
              url: `${IMG}/seamless-undie-maroon-2.png`,
              alt: "Seamless Undie Pack Maroon Side",
              isPrimary: false,
            },
            {
              url: `${IMG}/seamless-undie-maroon-3.png`,
              alt: "Seamless Undie Pack Maroon Detail",
              isPrimary: false,
            },
            {
              url: `${IMG}/seamless-undie-maroon-4.png`,
              alt: "Seamless Undie Pack Maroon Flat",
              isPrimary: false,
            },
          ],
        },
      ],
    },

    // ── 7. Luxuria Pad Lingerie Set ──────────────────────────────────────────
    {
      name: "Luxuria Pad Lingerie set",
      slug: "luxuria-pad-lingerie-set",
      categorySlug: "sets",
      description: `# SUREK Luxuria Pad Lingerie Set — Olive

**Elegant comfort with a touch of everyday luxury.**

Meet the **SUREK Luxuria Pad Lingerie Set**, designed to bring together a refined look, comfortable wear, and effortless everyday style. The **olive** shade adds a sophisticated, modern touch, making this set a versatile addition to your lingerie collection.

Designed with **padded support**, the set offers a comfortable fit while creating a smooth and flattering silhouette. Its coordinated design makes it an easy choice for everyday wear or when you want to add a little extra elegance to your essentials.

### Key Features

* **Padded Design:** Designed to provide comfortable support and a smooth silhouette.
* **Elegant & Comfortable:** Combines everyday comfort with a refined lingerie look.
* **Coordinated Set:** A complete matching lingerie set for a polished appearance.
* **Sophisticated Olive:** A rich, contemporary shade with an understated elegance.
* **Versatile Wear:** Suitable for everyday wear and special occasions.
* **Classic Sizing:** Available in **32, 34, and 36**.

### Product Type

**Padded Lingerie Set**

### Available Sizes

**32 | 34 | 36**

### Color

**Olive**

**SUREK — Everyday comfort, naturally.**`,
      fabric: "Padded Lace & Smooth Microfibre",
      tags: ["lingerie-set", "padded", "luxury", "sets"],
      isFeatured: false,
      isBestSeller: false,
      productImages: [
        {
          url: `${IMG}/lingerie-set-olive-1.png`,
          alt: "Luxuria Pad Lingerie Set – Olive Front",
          isPrimary: true,
        },
        {
          url: `${IMG}/lingerie-set-maroon-1.png`,
          alt: "Luxuria Pad Lingerie Set – Maroon Front",
          isPrimary: false,
        },
        {
          url: `${IMG}/lingerie-set-olive-2.png`,
          alt: "Luxuria Pad Lingerie Set – Olive Side",
          isPrimary: false,
        },
        {
          url: `${IMG}/lingerie-set-maroon-2.png`,
          alt: "Luxuria Pad Lingerie Set – Maroon Side",
          isPrimary: false,
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
              url: `${IMG}/lingerie-set-olive-1.png`,
              alt: "Luxuria Pad Lingerie Set Olive Front",
              isPrimary: true,
            },
            {
              url: `${IMG}/lingerie-set-olive-2.png`,
              alt: "Luxuria Pad Lingerie Set Olive Side",
              isPrimary: false,
            },
            {
              url: `${IMG}/lingerie-set-olive-3.png`,
              alt: "Luxuria Pad Lingerie Set Olive Detail",
              isPrimary: false,
            },
            {
              url: `${IMG}/lingerie-set-olive-4.png`,
              alt: "Luxuria Pad Lingerie Set Olive Pose",
              isPrimary: false,
            },
          ],
        },
        {
          color: "Maroon",
          sizes: ["32", "34", "36"],
          price: 700,
          mrp: 700,
          images: [
            {
              url: `${IMG}/lingerie-set-maroon-1.png`,
              alt: "Luxuria Pad Lingerie Set Maroon Front",
              isPrimary: true,
            },
            {
              url: `${IMG}/lingerie-set-maroon-2.png`,
              alt: "Luxuria Pad Lingerie Set Maroon Side",
              isPrimary: false,
            },
            {
              url: `${IMG}/lingerie-set-maroon-3.png`,
              alt: "Luxuria Pad Lingerie Set Maroon Detail",
              isPrimary: false,
            },
            {
              url: `${IMG}/lingerie-set-maroon-4.png`,
              alt: "Luxuria Pad Lingerie Set Maroon Back",
              isPrimary: false,
            },
          ],
        },
      ],
    },

    // ── 8. Camisole ──────────────────────────────────────────────────────────
    {
      name: "Camisole",
      slug: "camisole",
      categorySlug: "loungewear",
      description: `# SUREK Camisole — Black

**Simple, soft, and made for everyday comfort.**

Meet the **SUREK Camisole**, a versatile everyday essential designed for comfortable wear and effortless layering. Its classic **black** finish makes it easy to pair with your everyday wardrobe, whether worn on its own or underneath your favorite outfits.

Designed with a comfortable fit and an easy-to-wear silhouette, this camisole is a practical addition to your everyday essentials collection.

### Key Features

* **Everyday Essential:** Designed for comfortable daily wear and effortless layering.
* **Comfortable Fit:** An easy-to-wear silhouette designed for everyday movement.
* **Versatile Styling:** Ideal for layering under shirts, tops, dresses, or wearing on its own.
* **Classic Black:** A timeless shade that pairs effortlessly with different outfits.
* **Easy Wardrobe Staple:** Perfect for everyday use at home, while relaxing, or as a layering piece.
* **Extended Sizing:** Available in **L, XL, and 2XL**.

### Available Sizes

**L | XL | 2XL**

### Color

**Black**

**SUREK — Everyday comfort, naturally.**`,
      fabric: "95% Cotton Modal, 5% Elastane",
      tags: ["camisole", "lounge", "layer", "everyday"],
      isFeatured: false,
      isBestSeller: false,
      productImages: [
        {
          url: `${IMG}/camisole-black-1.png`,
          alt: "Camisole – Black Front",
          isPrimary: true,
        },
        {
          url: `${IMG}/camisole-pink-1.png`,
          alt: "Camisole – Pink Front",
          isPrimary: false,
        },
        {
          url: `${IMG}/camisole-white-1.png`,
          alt: "Camisole – White Front",
          isPrimary: false,
        },
        {
          url: `${IMG}/camisole-wine-1.png`,
          alt: "Camisole – Wine Front",
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
              url: `${IMG}/camisole-black-1.png`,
              alt: "Camisole Black Front",
              isPrimary: true,
            },
            {
              url: `${IMG}/camisole-black-2.png`,
              alt: "Camisole Black Side",
              isPrimary: false,
            },
            {
              url: `${IMG}/camisole-black-3.png`,
              alt: "Camisole Black Model",
              isPrimary: false,
            },
            {
              url: `${IMG}/camisole-black-4.png`,
              alt: "Camisole Black Detail",
              isPrimary: false,
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
              url: `${IMG}/camisole-pink-1.png`,
              alt: "Camisole Pink Front",
              isPrimary: true,
            },
            {
              url: `${IMG}/camisole-pink-2.png`,
              alt: "Camisole Pink Side",
              isPrimary: false,
            },
            {
              url: `${IMG}/camisole-pink-3.png`,
              alt: "Camisole Pink Model",
              isPrimary: false,
            },
            {
              url: `${IMG}/camisole-pink-4.png`,
              alt: "Camisole Pink Detail",
              isPrimary: false,
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
              url: `${IMG}/camisole-skin-1.png`,
              alt: "Camisole Skin Front",
              isPrimary: true,
            },
            {
              url: `${IMG}/camisole-skin-2.png`,
              alt: "Camisole Skin Side",
              isPrimary: false,
            },
            {
              url: `${IMG}/camisole-skin-3.png`,
              alt: "Camisole Skin Model",
              isPrimary: false,
            },
            {
              url: `${IMG}/camisole-skin-4.png`,
              alt: "Camisole Skin Detail",
              isPrimary: false,
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
              url: `${IMG}/camisole-white-1.png`,
              alt: "Camisole White Front",
              isPrimary: true,
            },
            {
              url: `${IMG}/camisole-white-2.png`,
              alt: "Camisole White Side",
              isPrimary: false,
            },
            {
              url: `${IMG}/camisole-white-3.png`,
              alt: "Camisole White Model",
              isPrimary: false,
            },
            {
              url: `${IMG}/camisole-white-4.png`,
              alt: "Camisole White Detail",
              isPrimary: false,
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
              url: `${IMG}/camisole-wine-1.png`,
              alt: "Camisole Wine Front",
              isPrimary: true,
            },
            {
              url: `${IMG}/camisole-wine-2.png`,
              alt: "Camisole Wine Side",
              isPrimary: false,
            },
            {
              url: `${IMG}/camisole-wine-3.png`,
              alt: "Camisole Wine Model",
              isPrimary: false,
            },
            {
              url: `${IMG}/camisole-wine-4.png`,
              alt: "Camisole Wine Detail",
              isPrimary: false,
            },
          ],
        },
      ],
    },

    // ── 9. Boyleg Undies ─────────────────────────────────────────────────────
    {
      name: "Boyleg Undies",
      slug: "boyleg",
      categorySlug: "panties",
      description: `# SUREK Seamless Boyleg Undies

**Full coverage comfort, designed for effortless movement.**

Meet the **SUREK Seamless Boyleg Undies**, designed to deliver maximum comfort with a supportive, smooth fit. Offering full rear and hip coverage with a non-chafing leg cut, these boyleg undies provide confidence under fitted clothes, loungewear, or athletic wear.

Crafted from ultra-soft stretch fabric with flexible elasticity that hugs your curves without pinching or rolling.

### Key Features

* **Boyleg Cut:** Full hip and cheek coverage preventing ride-up and chafing.
* **Ultra-Soft Stretch:** Smooth, breathable fabric that moves naturally with your body.
* **Stay-Put Waistband:** Gentle, dig-free band designed to stay in place all day.
* **Versatile Everyday Wear:** Perfect under activewear, dresses, or for comfortable sleep and lounging.
* **Inclusive Sizing:** Available in **XS, S, M, L, XL, and XXL**.

### Fabric Composition

**95% Micro Modal / Bamboo | 5% Elastane**

### Available Sizes

**XS | S | M | L | XL | XXL**

**SUREK — Everyday comfort, naturally.**`,
      fabric: "95% Micro Modal, 5% Elastane",
      tags: ["boyleg", "undie", "panty", "coverage", "seamless", "best-seller"],
      isFeatured: true,
      isBestSeller: true,
      productImages: [
        {
          url: `${IMG}/boyleg-black-1.png`,
          alt: "Boyleg Undies – Black Front",
          isPrimary: true,
        },
        {
          url: `${IMG}/boyleg-blue-1.png`,
          alt: "Boyleg Undies – Blue Front",
          isPrimary: false,
        },
        {
          url: `${IMG}/boyleg-burgundy-1.png`,
          alt: "Boyleg Undies – Burgundy Front",
          isPrimary: false,
        },
        {
          url: `${IMG}/boyleg-grey-1.png`,
          alt: "Boyleg Undies – Grey Front",
          isPrimary: false,
        },
      ],
      variants: [
        {
          color: "Black",
          sizes: ["XS", "S", "M", "L", "XL", "XXL"],
          price: 320,
          mrp: 320,
          images: [
            {
              url: `${IMG}/boyleg-black-1.png`,
              alt: "Boyleg Undies Black Front",
              isPrimary: true,
            },
            {
              url: `${IMG}/boyleg-black-2.png`,
              alt: "Boyleg Undies Black Flat",
              isPrimary: false,
            },
            {
              url: `${IMG}/boyleg-black-3.png`,
              alt: "Boyleg Undies Black Back",
              isPrimary: false,
            },
            {
              url: `${IMG}/boyleg-black-4.png`,
              alt: "Boyleg Undies Black Lifestyle",
              isPrimary: false,
            },
          ],
        },
        {
          color: "Blue",
          sizes: ["XS", "S", "M", "L", "XL", "XXL"],
          price: 320,
          mrp: 320,
          images: [
            {
              url: `${IMG}/boyleg-blue-1.png`,
              alt: "Boyleg Undies Blue Front",
              isPrimary: true,
            },
            {
              url: `${IMG}/boyleg-blue-2.png`,
              alt: "Boyleg Undies Blue Flat",
              isPrimary: false,
            },
            {
              url: `${IMG}/boyleg-blue-3.png`,
              alt: "Boyleg Undies Blue Back",
              isPrimary: false,
            },
            {
              url: `${IMG}/boyleg-blue-4.png`,
              alt: "Boyleg Undies Blue Lifestyle",
              isPrimary: false,
            },
          ],
        },
        {
          color: "Brown",
          sizes: ["XS", "S", "M", "L", "XL", "XXL"],
          price: 320,
          mrp: 320,
          images: [
            {
              url: `${IMG}/boyleg-brown-1.png`,
              alt: "Boyleg Undies Brown Front",
              isPrimary: true,
            },
            {
              url: `${IMG}/boyleg-brown-2.png`,
              alt: "Boyleg Undies Brown Flat",
              isPrimary: false,
            },
            {
              url: `${IMG}/boyleg-brown-3.png`,
              alt: "Boyleg Undies Brown Back",
              isPrimary: false,
            },
            {
              url: `${IMG}/boyleg-brown-4.png`,
              alt: "Boyleg Undies Brown Lifestyle",
              isPrimary: false,
            },
          ],
        },
        {
          color: "Burgundy",
          sizes: ["XS", "S", "M", "L", "XL", "XXL"],
          price: 320,
          mrp: 320,
          images: [
            {
              url: `${IMG}/boyleg-burgundy-1.png`,
              alt: "Boyleg Undies Burgundy Front",
              isPrimary: true,
            },
            {
              url: `${IMG}/boyleg-burgundy-2.png`,
              alt: "Boyleg Undies Burgundy Flat",
              isPrimary: false,
            },
            {
              url: `${IMG}/boyleg-burgundy-3.png`,
              alt: "Boyleg Undies Burgundy Back",
              isPrimary: false,
            },
            {
              url: `${IMG}/boyleg-burgundy-4.png`,
              alt: "Boyleg Undies Burgundy Lifestyle",
              isPrimary: false,
            },
          ],
        },
        {
          color: "Grey",
          sizes: ["XS", "S", "M", "L", "XL", "XXL"],
          price: 320,
          mrp: 320,
          images: [
            {
              url: `${IMG}/boyleg-grey-1.png`,
              alt: "Boyleg Undies Grey Front",
              isPrimary: true,
            },
            {
              url: `${IMG}/boyleg-grey-2.png`,
              alt: "Boyleg Undies Grey Flat",
              isPrimary: false,
            },
            {
              url: `${IMG}/boyleg-grey-3.png`,
              alt: "Boyleg Undies Grey Back",
              isPrimary: false,
            },
            {
              url: `${IMG}/boyleg-grey-4.png`,
              alt: "Boyleg Undies Grey Lifestyle",
              isPrimary: false,
            },
          ],
        },
        {
          color: "Berry Pink",
          sizes: ["XS", "S", "M", "L", "XL", "XXL"],
          price: 320,
          mrp: 320,
          images: [
            {
              url: `${IMG}/boyleg-berry-pink-1.png`,
              alt: "Boyleg Undies Berry Pink Front",
              isPrimary: true,
            },
            {
              url: `${IMG}/boyleg-berry-pink-2.png`,
              alt: "Boyleg Undies Berry Pink Flat",
              isPrimary: false,
            },
            {
              url: `${IMG}/boyleg-berry-pink-3.png`,
              alt: "Boyleg Undies Berry Pink Back",
              isPrimary: false,
            },
            {
              url: `${IMG}/boyleg-berry-pink-4.png`,
              alt: "Boyleg Undies Berry Pink Lifestyle",
              isPrimary: false,
            },
          ],
        },
      ],
    },

    // ── 10. Padded Lycra Bra ─────────────────────────────────────────────────
    {
      name: "Padded Lycra Bra",
      slug: "padded-bra",
      categorySlug: "bras",
      description: `# SUREK Padded Lycra Bra

**Smooth contour support meets ultra-soft luxury.**

Meet the **SUREK Padded Lycra Bra**, expertly constructed with light contoured cups and premium high-recovery Lycra. Designed to offer gentle lift, seamless shape, and full-day comfort without digging or underwire discomfort.

The smooth outer finish creates an invisible profile under tight tees and silky dresses, making it your go-to everyday essential.

### Key Features

* **Light Contoured Padding:** Delivers flattering shape, natural lift, and gentle modesty.
* **Premium Lycra Blend:** High elasticity and resilient shape retention wash after wash.
* **Wireless All-Day Support:** Comfortable freedom without restrictive wires.
* **Smooth Seamless Cups:** Clean, invisible look under thin fabrics and t-shirts.
* **Inclusive Sizing:** Available in **32, 34, 36, and 38**.

### Fabric Composition

**85% Polyamide Lycra | 15% Elastane**

### Available Sizes

**32 | 34 | 36 | 38**

**SUREK — Everyday comfort, naturally.**`,
      fabric: "85% Polyamide Lycra, 15% Elastane",
      tags: ["bra", "padded", "lycra", "t-shirt-bra", "smooth", "best-seller"],
      isFeatured: true,
      isBestSeller: true,
      productImages: [
        {
          url: `${IMG}/padded-bra-black-1.png`,
          alt: "Padded Lycra Bra – Black Front",
          isPrimary: true,
        },
        {
          url: `${IMG}/padded-bra-blue-1.png`,
          alt: "Padded Lycra Bra – Blue Front",
          isPrimary: false,
        },
        {
          url: `${IMG}/padded-bra-pink-1.png`,
          alt: "Padded Lycra Bra – Pink Front",
          isPrimary: false,
        },
        {
          url: `${IMG}/padded-bra-olive-1.png`,
          alt: "Padded Lycra Bra – Olive Front",
          isPrimary: false,
        },
      ],
      variants: [
        {
          color: "Black",
          sizes: ["32", "34", "36", "38"],
          price: 450,
          mrp: 450,
          images: [
            {
              url: `${IMG}/padded-bra-black-1.png`,
              alt: "Padded Lycra Bra Black Front",
              isPrimary: true,
            },
            {
              url: `${IMG}/padded-bra-black-2.png`,
              alt: "Padded Lycra Bra Black Flat",
              isPrimary: false,
            },
            {
              url: `${IMG}/padded-bra-black-3.png`,
              alt: "Padded Lycra Bra Black Back",
              isPrimary: false,
            },
            {
              url: `${IMG}/padded-bra-black-4.png`,
              alt: "Padded Lycra Bra Black Lifestyle",
              isPrimary: false,
            },
          ],
        },
        {
          color: "Blue",
          sizes: ["32", "34", "36", "38"],
          price: 450,
          mrp: 450,
          images: [
            {
              url: `${IMG}/padded-bra-blue-1.png`,
              alt: "Padded Lycra Bra Blue Front",
              isPrimary: true,
            },
            {
              url: `${IMG}/padded-bra-blue-2.png`,
              alt: "Padded Lycra Bra Blue Flat",
              isPrimary: false,
            },
            {
              url: `${IMG}/padded-bra-blue-3.png`,
              alt: "Padded Lycra Bra Blue Back",
              isPrimary: false,
            },
            {
              url: `${IMG}/padded-bra-blue-4.png`,
              alt: "Padded Lycra Bra Blue Lifestyle",
              isPrimary: false,
            },
          ],
        },
        {
          color: "Coffee",
          sizes: ["32", "34", "36", "38"],
          price: 450,
          mrp: 450,
          images: [
            {
              url: `${IMG}/padded-bra-coffee-1.png`,
              alt: "Padded Lycra Bra Coffee Front",
              isPrimary: true,
            },
            {
              url: `${IMG}/padded-bra-coffee-2.png`,
              alt: "Padded Lycra Bra Coffee Flat",
              isPrimary: false,
            },
            {
              url: `${IMG}/padded-bra-coffee-3.png`,
              alt: "Padded Lycra Bra Coffee Back",
              isPrimary: false,
            },
            {
              url: `${IMG}/padded-bra-coffee-4.png`,
              alt: "Padded Lycra Bra Coffee Lifestyle",
              isPrimary: false,
            },
          ],
        },
        {
          color: "Grey",
          sizes: ["32", "34", "36", "38"],
          price: 450,
          mrp: 450,
          images: [
            {
              url: `${IMG}/padded-bra-grey-1.png`,
              alt: "Padded Lycra Bra Grey Front",
              isPrimary: true,
            },
            {
              url: `${IMG}/padded-bra-grey-2.png`,
              alt: "Padded Lycra Bra Grey Flat",
              isPrimary: false,
            },
            {
              url: `${IMG}/padded-bra-grey-3.png`,
              alt: "Padded Lycra Bra Grey Back",
              isPrimary: false,
            },
            {
              url: `${IMG}/padded-bra-grey-4.png`,
              alt: "Padded Lycra Bra Grey Lifestyle",
              isPrimary: false,
            },
          ],
        },
        {
          color: "Olive",
          sizes: ["32", "34", "36", "38"],
          price: 450,
          mrp: 450,
          images: [
            {
              url: `${IMG}/padded-bra-olive-1.png`,
              alt: "Padded Lycra Bra Olive Front",
              isPrimary: true,
            },
            {
              url: `${IMG}/padded-bra-olive-2.png`,
              alt: "Padded Lycra Bra Olive Flat",
              isPrimary: false,
            },
            {
              url: `${IMG}/padded-bra-olive-3.png`,
              alt: "Padded Lycra Bra Olive Back",
              isPrimary: false,
            },
            {
              url: `${IMG}/padded-bra-olive-4.png`,
              alt: "Padded Lycra Bra Olive Lifestyle",
              isPrimary: false,
            },
          ],
        },
        {
          color: "Pink",
          sizes: ["32", "34", "36", "38"],
          price: 450,
          mrp: 450,
          images: [
            {
              url: `${IMG}/padded-bra-pink-1.png`,
              alt: "Padded Lycra Bra Pink Front",
              isPrimary: true,
            },
            {
              url: `${IMG}/padded-bra-pink-2.png`,
              alt: "Padded Lycra Bra Pink Flat",
              isPrimary: false,
            },
            {
              url: `${IMG}/padded-bra-pink-3.png`,
              alt: "Padded Lycra Bra Pink Back",
              isPrimary: false,
            },
            {
              url: `${IMG}/padded-bra-pink-4.png`,
              alt: "Padded Lycra Bra Pink Lifestyle",
              isPrimary: false,
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

    // Insert product-level images (exactly 4 images)
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

    // Insert variants & variant-level images
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

        // Variant-level images (4 images per variant)
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

    console.log(
      `  ✅ ${p.name} — ${p.variants.length} colour(s) (4 product images, 4 images/colour)`
    );
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
