export default function ProductDetailSkeleton() {
  return (
    <div className="pt-8 md:pt-12 pb-20 min-h-screen bg-brand-black font-inter text-white">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2 mb-6 animate-shimmer">
          <div className="h-3 w-12 bg-white/10 rounded" />
          <div className="h-3 w-3 bg-white/10 rounded" />
          <div className="h-3 w-12 bg-white/10 rounded" />
          <div className="h-3 w-3 bg-white/10 rounded" />
          <div className="h-3 w-20 bg-white/15 rounded" />
          <div className="h-3 w-3 bg-white/10 rounded" />
          <div className="h-3 w-32 bg-white/10 rounded" />
        </div>

        {/* 2-Column Product Layout Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Left Column: Image Gallery Skeleton */}
          <div className="space-y-4 animate-shimmer">
            {/* Main Showcase */}
            <div className="aspect-[3/4] bg-[#141414] rounded-3xl border border-white/10 relative overflow-hidden flex flex-col justify-between p-4">
              <div className="flex items-center justify-between">
                <div className="h-6 w-20 bg-white/10 rounded-full" />
                <div className="h-6 w-14 bg-white/10 rounded-full" />
              </div>
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-brand-red animate-spin" />
              </div>
              <div className="flex justify-center">
                <div className="h-2 w-24 bg-white/10 rounded-full" />
              </div>
            </div>

            {/* Thumbnails Row */}
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl bg-[#181818] border border-white/10 shrink-0"
                />
              ))}
            </div>
          </div>

          {/* Right Column: Product Info Skeleton */}
          <div className="space-y-6 animate-shimmer">
            {/* Brand Category Tag & Rating */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-5 w-24 bg-brand-red/20 rounded-md" />
                <div className="h-4 w-28 bg-white/10 rounded" />
              </div>

              {/* Title */}
              <div className="h-8 w-4/5 bg-white/20 rounded-xl" />
              <div className="h-6 w-1/2 bg-white/15 rounded-lg" />
            </div>

            {/* Price Box */}
            <div className="p-4 bg-[#141414] border border-white/10 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-28 bg-white/20 rounded-lg" />
                <div className="h-5 w-20 bg-white/10 rounded" />
              </div>
              <div className="h-6 w-20 bg-green-500/20 rounded-full" />
            </div>

            {/* Color Selection Skeleton */}
            <div className="space-y-2.5">
              <div className="flex justify-between">
                <div className="h-4 w-24 bg-white/15 rounded" />
                <div className="h-4 w-16 bg-white/10 rounded" />
              </div>
              <div className="flex gap-2.5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-9 h-9 rounded-full bg-[#1c1c1c] border border-white/15" />
                ))}
              </div>
            </div>

            {/* Size Selection Skeleton */}
            <div className="space-y-2.5">
              <div className="flex justify-between">
                <div className="h-4 w-24 bg-white/15 rounded" />
                <div className="h-4 w-20 bg-white/10 rounded" />
              </div>
              <div className="flex gap-2.5">
                {['XS', 'S', 'M', 'L', 'XL'].map((s) => (
                  <div key={s} className="w-12 h-11 rounded-xl bg-[#1c1c1c] border border-white/15" />
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <div className="flex-1 h-14 bg-brand-red/30 rounded-2xl" />
              <div className="w-14 h-14 bg-[#181818] border border-white/15 rounded-2xl" />
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-[#141414] rounded-xl border border-white/10" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
