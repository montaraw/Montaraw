export default function CategorySkeleton() {
  return (
    <section className="py-12 md:py-16 bg-brand-black font-inter text-white">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        {/* Header Skeleton */}
        <div className="flex items-end justify-between mb-6 md:mb-10 animate-shimmer">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
              <div className="h-3 w-28 bg-brand-red/30 rounded" />
            </div>
            <div className="h-8 md:h-10 w-48 md:w-64 bg-white/15 rounded-xl" />
          </div>
          <div className="h-4 w-20 bg-white/10 rounded" />
        </div>

        {/* Mobile View: Circular Avatar Skeletons */}
        <div className="flex md:hidden items-center justify-between gap-4 overflow-x-auto no-scrollbar py-2 animate-shimmer">
          {[1, 2, 3, 4, 5].map((idx) => (
            <div key={idx} className="flex flex-col items-center shrink-0 w-20">
              <div className="w-18 h-18 rounded-full bg-[#181818] border border-white/10" />
              <div className="w-14 h-3 bg-white/10 rounded mt-2" />
            </div>
          ))}
        </div>

        {/* Desktop View: Grid of Luxury Category Cards */}
        <div className="hidden md:grid grid-cols-3 gap-6 lg:gap-8 animate-shimmer">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="aspect-[3/4] rounded-2xl bg-[#141414] border border-white/10 p-6 flex flex-col justify-between shadow-xl relative overflow-hidden"
            >
              {/* Badge placeholder */}
              <div className="w-24 h-6 rounded-full bg-white/10" />

              {/* Bottom Text Content */}
              <div className="space-y-3">
                <div className="h-6 w-3/4 bg-white/20 rounded-lg" />
                <div className="h-4 w-1/3 bg-white/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
