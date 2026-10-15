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
