/**
 * Utility to lock and unlock background scroll while keeping viewport width constant.
 *
 * Problem:
 * When setting `document.body.style.overflow = "hidden"`, the browser removes the
 * vertical scrollbar (typically ~15px on Windows/desktop). This causes centered
 * containers (e.g. `mx-auto max-w-7xl`, header logo, hero content) and right-aligned
 * elements to shift horizontally to the right. When closed, they snap back to the left.
 *
 * Solution:
 * Measure the exact scrollbar width before locking (`window.innerWidth - document.documentElement.clientWidth`).
 * When locking, compensate for the removed scrollbar by applying `paddingRight: ${scrollbarWidth}px`
 * to `document.body`. This maintains the exact same layout boundaries without layout shift (CLS).
 * Reference counting ensures multiple overlapping modals/drawers don't unlock early.
 */

let lockCount = 0;
let prevOverflow = "";
let prevPaddingRight = "";

/**
 * Returns the width of the vertical scrollbar in pixels.
 * Returns 0 in SSR or on devices with overlay scrollbars (e.g., iOS/Android/macOS overlay).
 */
export function getScrollbarWidth(): number {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return 0;
  }
  return Math.max(0, window.innerWidth - document.documentElement.clientWidth);
}

/**
 * Locks page scroll, compensating for the removed scrollbar width on desktop.
 */
export function lockScroll(): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  if (lockCount === 0) {
    const scrollbarWidth = getScrollbarWidth();

    prevOverflow = document.body.style.overflow;
    prevPaddingRight = document.body.style.paddingRight;

    if (scrollbarWidth > 0) {
      const computedPadding = window.getComputedStyle(
        document.body
      ).paddingRight;
      const currentPadding = parseFloat(computedPadding) || 0;
      document.body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
    }

    document.body.style.overflow = "hidden";
  }

  lockCount++;
}

/**
 * Releases a scroll lock. Restores original body overflow and padding
 * once all active locks have been released.
 */
export function unlockScroll(): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  if (lockCount > 0) {
    lockCount--;
  }

  if (lockCount === 0) {
    document.body.style.overflow = prevOverflow;
    document.body.style.paddingRight = prevPaddingRight;
  }
}
