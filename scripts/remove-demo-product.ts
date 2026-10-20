/* eslint-disable no-console */
import dotenv from "dotenv";
import postgres from "postgres";

function getPoolerUrl(url: string): string {
  if (url.includes("pooler.supabase.com:5432")) {
    return url.replace("pooler.supabase.com:5432", "pooler.supabase.com:6543");
  }
  return url;
}

const DEMO_PRODUCT_SLUG = "surekh-test-item-1rs";
const DEMO_VARIANT_SKU = "DEMO-TEST-01";

async function removeDemoProductFromDb(envPath: string, label: string) {
  dotenv.config({ path: envPath, override: true });
  const rawUrl = process.env.DATABASE_DIRECT_URL || process.env.DATABASE_URL;
  if (!rawUrl) {
    console.log(
      `[${label}] ⚠️ No DATABASE_DIRECT_URL or DATABASE_URL found in ${envPath}. Skipping.`
    );
    return;
  }

  const url = getPoolerUrl(rawUrl);
  const hostMatch = url.match(/@([^:/]+)(?::(\d+))?/);
  console.log(`\n========================================================`);
  console.log(`🗑️  Removing demo product from [${label}]`);
  console.log(
    `📡 Host: ${hostMatch ? hostMatch[1] : "unknown"}, Port: ${hostMatch ? hostMatch[2] : "default"}`
  );
  console.log(`========================================================`);

  const client = postgres(url, {
    max: 1,
    connect_timeout: 25,
    prepare: false,
    ssl: url.includes("supabase.com") ? "require" : undefined,
  });

  try {
    // 1. Identify product and variants
    const products = await client`
      SELECT id, name, slug 
      FROM products 
      WHERE slug = ${DEMO_PRODUCT_SLUG} 
         OR name ILIKE '%Surekh Live Demo Test Item%';
    `;

    if (products.length === 0) {
      console.log(`[${label}] ✅ No demo product found in database.`);
      return;
    }

    for (const prod of products) {
      console.log(
        `[${label}] Found product: ${prod.name} (ID: ${prod.id}, Slug: ${prod.slug})`
      );

      const variants = await client`
        SELECT id, sku FROM product_variants WHERE product_id = ${prod.id} OR sku = ${DEMO_VARIANT_SKU};
      `;
      const variantIds = variants.map((v) => v.id);

      if (variantIds.length > 0) {
        console.log(`[${label}] Deleting inventory for variants:`, variantIds);
        await client`DELETE FROM inventory WHERE variant_id = ANY(${variantIds})`;

        console.log(`[${label}] Deleting cart items if any...`);
        await client`DELETE FROM cart_items WHERE variant_id = ANY(${variantIds})`;

        console.log(`[${label}] Deleting wishlist items if any...`);
        await client`DELETE FROM wishlist_items WHERE variant_id = ANY(${variantIds}) OR product_id = ${prod.id}`;

        console.log(`[${label}] Deleting product variants...`);
        await client`DELETE FROM product_variants WHERE id = ANY(${variantIds})`;
      }

      console.log(`[${label}] Deleting product images...`);
      await client`DELETE FROM product_images WHERE product_id = ${prod.id}`;

      console.log(`[${label}] Deleting reviews if any...`);
      await client`DELETE FROM reviews WHERE product_id = ${prod.id}`;

      console.log(`[${label}] Deleting product...`);
      await client`DELETE FROM products WHERE id = ${prod.id}`;

      console.log(
        `[${label}] ✅ Successfully removed demo product ${prod.slug} (ID: ${prod.id})`
      );
    }

    // Verification
    const remaining = await client`
      SELECT id FROM products WHERE slug = ${DEMO_PRODUCT_SLUG} OR name ILIKE '%Surekh Live Demo Test Item%';
    `;
    if (remaining.length === 0) {
      console.log(`[${label}] 🎯 Verified: 0 demo products remaining.`);
    } else {
      console.warn(
        `[${label}] ⚠️ Warning: ${remaining.length} demo products still present.`
      );
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[${label}] ❌ Error removing demo product:`, errorMsg);
    throw err;
  } finally {
    await client.end();
  }
}

async function main() {
  const isProdOnly = process.argv.includes("--prod");
  const isDevOnly = process.argv.includes("--dev");

  if (isProdOnly) {
    await removeDemoProductFromDb(".env", "PRODUCTION");
  } else if (isDevOnly) {
    await removeDemoProductFromDb(".env.local", "LOCAL / DEV");
  } else {
    // Default: Clean both dev and prod databases
    await removeDemoProductFromDb(".env.local", "LOCAL / DEV");
    await removeDemoProductFromDb(".env", "PRODUCTION");
  }
}

main().catch((err) => {
  console.error("Execution failed:", err);
  process.exit(1);
});
