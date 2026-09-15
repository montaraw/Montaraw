export default function OrderTrackingSkeleton() {
  return (
    <div className="space-y-8 animate-shimmer font-inter text-white">
      {/* Order Status Glass Card */}
      <div className="p-6 md:p-8 bg-[#141414] border border-white/10 rounded-3xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="space-y-2">
            <div className="h-3 w-28 bg-brand-red/30 rounded" />
            <div className="h-6 w-44 bg-white/20 rounded-lg" />
          </div>
          <div className="h-7 w-32 bg-white/10 rounded-full" />
        </div>

        {/* 4-Step Stepper Timeline Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-white/20" />
              </div>
              <div className="h-4 w-24 bg-white/15 rounded" />
              <div className="h-3 w-28 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Order Items & Customer Meta */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 bg-[#141414] border border-white/10 rounded-3xl space-y-4">
          <div className="h-5 w-32 bg-white/15 rounded" />
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-[#181818] rounded-2xl border border-white/5">
                <div className="w-16 h-20 rounded-xl bg-white/10 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-2/3 bg-white/15 rounded" />
                  <div className="h-3 w-1/3 bg-white/10 rounded" />
                </div>
                <div className="h-5 w-16 bg-white/15 rounded" />
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-[#141414] border border-white/10 rounded-3xl space-y-4">
          <div className="h-5 w-28 bg-white/15 rounded" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-white/10 rounded" />
            <div className="h-4 w-5/6 bg-white/10 rounded" />
            <div className="h-4 w-4/6 bg-white/10 rounded" />
            <div className="h-10 w-full bg-brand-red/20 rounded-xl mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
