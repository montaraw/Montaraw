export function AdminStatsSkeleton() {
  return (
    <div className="space-y-8 font-inter text-white animate-shimmer">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-[#141414] border border-white/10 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 bg-white/10 rounded" />
              <div className="w-8 h-8 rounded-xl bg-white/10" />
            </div>
            <div className="h-7 w-28 bg-white/20 rounded-lg" />
            <div className="h-3 w-36 bg-white/10 rounded" />
          </div>
        ))}
      </div>

      {/* 2 Charts / Big Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-4">
          <div className="h-5 w-40 bg-white/15 rounded" />
          <div className="h-48 bg-[#181818] rounded-xl border border-white/5" />
        </div>
        <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-4">
          <div className="h-5 w-32 bg-white/15 rounded" />
          <div className="h-48 bg-[#181818] rounded-xl border border-white/5" />
        </div>
      </div>
    </div>
  );
}

export function AdminTableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="w-full bg-[#141414] border border-white/10 rounded-2xl overflow-hidden animate-shimmer">
      {/* Table Header */}
      <div className="p-4 bg-[#181818] border-b border-white/10 flex items-center justify-between">
        <div className="h-4 w-32 bg-white/15 rounded" />
        <div className="h-8 w-24 bg-white/10 rounded-xl" />
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-white/5">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-xl bg-white/10 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 w-1/3 bg-white/15 rounded" />
                <div className="h-2.5 w-1/5 bg-white/10 rounded" />
              </div>
            </div>
            <div className="h-4 w-20 bg-white/10 rounded" />
            <div className="h-6 w-24 bg-white/10 rounded-full" />
            <div className="h-8 w-16 bg-white/10 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
