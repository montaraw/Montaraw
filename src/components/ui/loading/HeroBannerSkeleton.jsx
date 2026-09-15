export default function HeroBannerSkeleton() {
  return (
    <section className="relative min-h-[70vh] md:min-h-[78vh] lg:min-h-[82vh] lg:max-h-[820px] flex items-center overflow-hidden bg-[#0d0d0d] font-inter text-white border-b border-white/5 animate-shimmer">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 bg-radial-gradient from-brand-red/10 via-transparent to-transparent opacity-30" />

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 md:px-8 w-full py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text Block */}
          <div className="lg:col-span-7 space-y-5 max-w-xl">
            {/* Pill Tag */}
            <div className="h-7 w-36 bg-brand-red/20 border border-brand-red/30 rounded-full" />

            {/* Headline */}
            <div className="space-y-3">
              <div className="h-12 md:h-16 w-5/6 bg-white/20 rounded-2xl" />
              <div className="h-10 md:h-14 w-3/4 bg-white/15 rounded-xl" />
            </div>

            {/* Subtitle / Description */}
            <div className="space-y-2 pt-1">
              <div className="h-4 w-full bg-white/10 rounded" />
              <div className="h-4 w-4/5 bg-white/10 rounded" />
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4 pt-3">
              <div className="h-13 w-48 bg-brand-red/40 rounded-xl" />
              <div className="h-13 w-40 bg-white/10 border border-white/15 rounded-xl" />
            </div>
          </div>

          {/* Right Image Placeholder Frame */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="aspect-[4/5] rounded-3xl bg-[#141414] border border-white/10 p-6 flex flex-col justify-end shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="relative z-10 space-y-2">
                <div className="h-4 w-28 bg-white/15 rounded" />
                <div className="h-6 w-44 bg-white/25 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Slider Dots Placeholder */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className="w-8 h-2 rounded-full bg-brand-red" />
        <div className="w-2 h-2 rounded-full bg-white/20" />
        <div className="w-2 h-2 rounded-full bg-white/20" />
      </div>
    </section>
  );
}
