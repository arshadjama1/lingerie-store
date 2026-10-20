/**
 * Natural sorting order for lingerie and apparel sizes.
 * XS...XXL, followed by numeric band/cup sizes (30...42), followed by Free Size.
 */
export const SIZE_ORDER: Record<string, number> = {
  XS: 1,
  S: 2,
  M: 3,
  L: 4,
  XL: 5,
  XXL: 6,
  "2XL": 6,
  "3XL": 7,
  "4XL": 8,
  "30": 10,
  "30B": 11,
  "30C": 12,
  "30D": 13,
  "32": 20,
  "32A": 21,
  "32B": 22,
  "32C": 23,
  "32D": 24,
  "32DD": 25,
  "32E": 26,
  "34": 30,
  "34A": 31,
  "34B": 32,
  "34C": 33,
  "34D": 34,
  "34DD": 35,
  "34E": 36,
  "36": 40,
  "36A": 41,
  "36B": 42,
  "36C": 43,
  "36D": 44,
  "36DD": 45,
  "36E": 46,
  "38": 50,
  "38A": 51,
  "38B": 52,
  "38C": 53,
  "38D": 54,
  "38DD": 55,
  "38E": 56,
  "40": 60,
  "40A": 61,
  "40B": 62,
  "40C": 63,
  "40D": 64,
  "40DD": 65,
  "40E": 66,
  "42": 70,
  "42A": 71,
  "42B": 72,
  "42C": 73,
  "42D": 74,
  FS: 99,
  "FREE SIZE": 99,
  "ONE SIZE": 99,
};

/**
 * Sorts an array of size strings naturally according to SIZE_ORDER.
 */
export function sortSizesNaturally(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const orderA = SIZE_ORDER[a.trim().toUpperCase()] ?? 50;
    const orderB = SIZE_ORDER[b.trim().toUpperCase()] ?? 50;
    if (orderA !== orderB) return orderA - orderB;
    return a.localeCompare(b);
  });
}

/**
 * Size chart image paths served from public/images/products/
 */
export const BRA_SIZE_CHART_URL =
  "/images/products/surekh_lounge_size_chart_450x600.png";
export const UNDIES_SIZE_CHART_URL =
  "/images/products/surekh_size_chart_450x600_proportional.png";
export const SET_SIZE_CHART_URL =
  "/images/products/surekh_set_size_chart_450x600_fixed_text.png";

export interface ProductSizeChart {
  type: "bra" | "undie" | "set";
  url: string;
  alt: string;
}

/**
 * Returns the appropriate size chart for a given product.
 * Sets map to the set size chart.
 * Undies/panties map to the proportional undies size chart.
 * Bras, bralettes, and loungewear/camisoles map to the lounge bra size chart.
 */
export function getProductSizeChart(product: {
  category?: {
    slug?: string | null;
    name?: string | null;
    path?: string | null;
  } | null;
  name?: string | null;
  slug?: string | null;
  tags?: string[] | null;
}): ProductSizeChart {
  const catSlug = product.category?.slug?.toLowerCase() || "";
  const catName = product.category?.name?.toLowerCase() || "";
  const prodName = product.name?.toLowerCase() || "";
  const prodSlug = product.slug?.toLowerCase() || "";
  const tags = (product.tags || []).map((t) => t.toLowerCase());

  const isSet =
    catSlug === "sets" ||
    catSlug.includes("set") ||
    catName.includes("set") ||
    tags.includes("set") ||
    tags.includes("sets") ||
    tags.includes("lingerie-set") ||
    prodSlug === "luxuria-pad-lingerie-set" ||
    prodSlug === "overlap-bralette-hipster-set" ||
    prodSlug.includes("set") ||
    prodName.includes("set");

  if (isSet) {
    return {
      type: "set",
      url: SET_SIZE_CHART_URL,
      alt: `${product.name || "Product"} Set Size Chart`,
    };
  }

  const isUndie =
    catSlug === "panties" ||
    catName.includes("panty") ||
    catName.includes("panties") ||
    catName.includes("undie") ||
    tags.includes("undie") ||
    tags.includes("panty") ||
    tags.includes("panties") ||
    tags.includes("boyleg") ||
    prodName.includes("undie") ||
    prodName.includes("panty") ||
    prodName.includes("panties") ||
    prodName.includes("boyleg") ||
    prodSlug.includes("undie") ||
    prodSlug.includes("panty") ||
    prodSlug.includes("boyleg");

  if (isUndie && catSlug !== "bras" && !prodName.includes(" bra")) {
    return {
      type: "undie",
      url: UNDIES_SIZE_CHART_URL,
      alt: `${product.name || "Product"} Undies Size Chart`,
    };
  }

  return {
    type: "bra",
    url: BRA_SIZE_CHART_URL,
    alt: `${product.name || "Product"} Bra & Lounge Size Chart`,
  };
}
