export default function ProductCardSkeleton({ count = 1 }) {
  const items = Array.from({ length: count });

  return (
    <>
      {items.map((_, i) => (
        <div
          key={i}
          className="group flex flex-col rounded-2xl overflow-hidden bg-[#131313] border border-white/10 shadow-lg animate-shimmer"
        >
          {/* Main Image Area with Badges */}
          <div className="relative aspect-[3/4] w-full bg-[#181818] overflow-hidden">
            {/* Top Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
              <div className="h-5 w-14 bg-white/10 rounded-md" />
            </div>

            {/* Wishlist Button Placeholder */}
            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10" />

            {/* Bottom Quick Bar Placeholder */}
            <div className="absolute bottom-3 left-3 right-3 h-8 bg-white/5 rounded-xl backdrop-blur-sm" />
          </div>

          {/* Details Section */}
          <div className="p-3.5 sm:p-4 space-y-2.5 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              {/* Category & Rating Row */}
              <div className="flex items-center justify-between">
                <div className="h-3 w-16 bg-white/10 rounded" />
                <div className="h-3 w-10 bg-white/10 rounded" />
              </div>

              {/* Product Title */}
              <div className="h-4 w-5/6 bg-white/15 rounded" />
              <div className="h-3.5 w-1/2 bg-white/10 rounded" />
            </div>

            {/* Price Row & Color Dots */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-5 w-16 bg-white/20 rounded" />
                <div className="h-4 w-10 bg-white/10 rounded" />
              </div>

              {/* Color Swatches */}
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-white/15" />
                <div className="w-3 h-3 rounded-full bg-white/15" />
                <div className="w-3 h-3 rounded-full bg-white/15" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
