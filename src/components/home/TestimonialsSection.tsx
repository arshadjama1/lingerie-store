import { Star } from "lucide-react";

import { TESTIMONIALS_DATA } from "./data/homeData";

export function TestimonialsSection() {
  return (
    <section className="border-y border-[var(--border)] bg-[var(--surface)] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="font-serif text-xl font-black tracking-tight text-[var(--accent-plum)] uppercase sm:text-2xl">
            What Our Customers Say
          </h2>
          <p className="mt-1 text-xs font-light text-gray-500 sm:text-sm">
            Real reviews from real women across India
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS_DATA.map((review) => (
            <div
              key={review.name}
              className="rounded-none border border-[var(--border)] bg-white p-5 transition-shadow hover:shadow-md"
            >
              <div className="mb-3 flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 fill-current ${i < review.rating ? "star-filled" : "star-empty"}`}
                  />
                ))}
              </div>
              <p className="mb-4 text-xs leading-relaxed font-light text-gray-700">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-plum)] text-xs font-black text-white">
                  {review.avatar}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">
                    {review.name}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {review.location} · {review.product}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
