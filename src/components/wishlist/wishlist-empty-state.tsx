import Link from "next/link";

import { ArrowRight, Heart } from "lucide-react";

export function WishlistEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-rose-200 bg-white/80 px-6 py-20 text-center shadow-xs">
      <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 text-[var(--accent)] shadow-inner">
        <Heart className="h-10 w-10 stroke-[1.5] text-[var(--accent)]" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4 animate-ping rounded-full bg-rose-400 opacity-75" />
      </div>

      <h2 className="font-serif text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
        Your Wishlist is Empty
      </h2>

      <p className="mt-2.5 max-w-md text-sm leading-relaxed text-neutral-500">
        You haven&apos;t saved any favorites yet. Explore our handcrafted
        lingerie collections and tap the heart icon to save the styles you
        adore.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/bras"
          className="inline-flex items-center gap-2 rounded-none bg-[var(--accent)] px-6 py-3 text-xs font-black tracking-widest text-white uppercase shadow-sm transition-all hover:bg-[var(--accent-dark)] hover:shadow-md"
        >
          <span>Explore Bras</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          href="/panties"
          className="inline-flex items-center gap-2 rounded-none border border-neutral-200 bg-white px-6 py-3 text-xs font-black tracking-widest text-neutral-800 uppercase shadow-xs transition-colors hover:border-[var(--accent)] hover:bg-rose-50 hover:text-[var(--accent)]"
        >
          <span>Explore Panties</span>
        </Link>
      </div>
    </div>
  );
}
