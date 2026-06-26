import Link from "next/link";

const FOOTER_LINKS = {
  Shop: [
    { label: "Bras", href: "/bras" },
    { label: "Panties", href: "/panties" },
    { label: "Lingerie Sets", href: "/lingerie-sets" },
    { label: "Shapewear", href: "/shapewear" },
    { label: "Nightwear", href: "/nightwear" },
    { label: "Sale", href: "/sale" },
  ],
  Help: [
    { label: "Size Guide", href: "/size-guide" },
    { label: "Shipping & Delivery", href: "/shipping" },
    { label: "Returns & Exchanges", href: "/returns" },
    { label: "Track Order", href: "/account/orders" },
    { label: "Contact Us", href: "/contact" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Privacy Policy", href: "/legal/privacy" },
    { label: "Terms & Conditions", href: "/legal/terms" },
    { label: "Refund Policy", href: "/legal/refunds" },
  ],
};

export function Footer() {
  return (
    <footer
      className="mt-auto border-t"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Top: logo + links */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link
              href="/"
              className="text-foreground font-serif text-xl font-semibold tracking-wider"
            >
              LINGE
            </Link>
            <p className="text-foreground-muted mt-3 text-sm leading-relaxed">
              Thoughtfully designed lingerie for every woman. Made to be worn,
              loved, and remembered.
            </p>
          </div>

          {/* Link groups */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-foreground mb-4 text-xs font-semibold tracking-widest uppercase">
                {group}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-foreground-muted hover:text-foreground text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom: copyright + trust badges */}
        <div
          className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 sm:flex-row"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-foreground-muted text-xs">
            © {new Date().getFullYear()} Linge Lingerie. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <span
              className="rounded px-2 py-1 text-xs font-medium"
              style={{
                background: "var(--accent-subtle)",
                color: "var(--accent-dark)",
              }}
            >
              🔒 Secure Checkout
            </span>
            <span
              className="rounded px-2 py-1 text-xs font-medium"
              style={{
                background: "var(--accent-subtle)",
                color: "var(--accent-dark)",
              }}
            >
              🚚 Free Shipping ₹999+
            </span>
            <span
              className="rounded px-2 py-1 text-xs font-medium"
              style={{
                background: "var(--accent-subtle)",
                color: "var(--accent-dark)",
              }}
            >
              ↩ Easy Returns
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
