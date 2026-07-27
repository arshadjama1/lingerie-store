import { TRUST_ITEMS_DATA } from "./data/homeData";

export function TrustStrip() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-4 pb-10 sm:px-6 lg:px-8">
      <div className="rounded-none bg-[var(--accent-plum)] p-8 sm:p-10">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {TRUST_ITEMS_DATA.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group flex flex-col items-center text-center"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-all group-hover:bg-[var(--accent)] group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xs font-black tracking-wider text-white uppercase sm:text-sm">
                  {item.title}
                </h3>
                <p className="mt-1 max-w-[160px] text-xs font-light text-pink-200">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
