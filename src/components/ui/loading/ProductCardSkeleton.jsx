import { motion } from 'framer-motion';

export default function ProductCardSkeleton({ count = 1 }) {
  const items = Array.from({ length: count });

  return (
    <>
      {items.map((_, i) => (
        <div
          key={i}
          className="group flex flex-col rounded-2xl overflow-hidden bg-[#0d0d0d] border border-white/15 shadow-[0_8px_30px_rgb(0,0,0,0.6)]"
        >
          {/* Main Image Area with Luxury Glowing Infinite & Looping Animation */}
          <div className="relative aspect-[3/4] w-full bg-[#111111] overflow-hidden flex flex-col items-center justify-center">
            {/* Subtle Vignette & Shimmer Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 pointer-events-none" />

            {/* Pulsing Vibrant Neon Ambient Glow */}
            <div className="absolute w-28 h-28 rounded-full bg-gradient-to-br from-red-600/30 via-red-500/15 to-transparent blur-2xl animate-pulse" />

            {/* Central Animated Looping Processing Container */}
            <div className="relative z-10 flex flex-col items-center justify-center gap-3">
              {/* Dual Concentric Looping Rings & Infinity Center */}
              <div className="relative w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center">
                {/* Outer Circular Track Ring */}
                <div className="absolute inset-0 rounded-full border border-white/10" />

                {/* Rotating Glowing Neon Red Orbit */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#ff3333] border-r-[#ff3333]/60 shadow-[0_0_12px_rgba(255,51,51,0.5)]"
                />

                {/* Counter-Rotating Crisp Platinum Sub-orbit */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-1.5 rounded-full border border-transparent border-b-white/80 border-l-white/30"
                />

                {/* Central Flowing Infinite Symbol (∞) */}
                <svg
                  viewBox="0 0 100 50"
                  className="w-10 h-5.5 filter drop-shadow-[0_0_10px_rgba(255,51,51,0.85)] drop-shadow-[0_0_3px_rgba(255,255,255,0.9)]"
                >
                  <defs>
                    <linearGradient id={`infGrad-card-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ff2222" />
                      <stop offset="35%" stopColor="#ffffff" />
                      <stop offset="70%" stopColor="#ff4444" />
                      <stop offset="100%" stopColor="#ff2222" />
                    </linearGradient>
                  </defs>
                  {/* Static Infinity Track */}
                  <path
                    d="M 50,25 C 35,10 15,10 15,25 C 15,40 35,40 50,25 C 65,10 85,10 85,25 C 85,40 65,40 50,25 Z"
                    fill="none"
                    stroke="rgba(255,255,255,0.18)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Flowing Glowing Trace */}
                  <motion.path
                    d="M 50,25 C 35,10 15,10 15,25 C 15,40 35,40 50,25 C 65,10 85,10 85,25 C 85,40 65,40 50,25 Z"
                    fill="none"
                    stroke={`url(#infGrad-card-${i})`}
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="80 120"
                    animate={{ strokeDashoffset: [0, -200] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                  />
                </svg>
              </div>

              {/* High-Contrast Processing Micro-Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/85 border border-white/20 backdrop-blur-xl shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff3333] shadow-[0_0_8px_#ff3333] animate-ping" />
                <span className="text-[9.5px] font-mono font-bold tracking-widest text-white/95 uppercase">
                  Processing...
                </span>
              </div>
            </div>

            {/* Top Badges Placeholders */}
            <div className="absolute top-3 left-3 z-10">
              <div className="h-4 w-12 bg-white/10 rounded-md backdrop-blur-sm animate-pulse" />
            </div>
            <div className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white/10 backdrop-blur-sm animate-pulse" />
          </div>

          {/* Details Section Skeleton */}
          <div className="p-3.5 sm:p-4 space-y-2.5 flex-1 flex flex-col justify-between bg-[#0d0d0d]">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-2.5 w-16 bg-white/15 rounded animate-pulse" />
                <div className="h-2.5 w-8 bg-white/10 rounded animate-pulse" />
              </div>
              <div className="h-3.5 w-4/5 bg-white/20 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-white/10 rounded animate-pulse" />
            </div>

            <div className="pt-2.5 border-t border-white/10 flex items-center justify-between">
              <div className="h-4 w-16 bg-white/25 rounded animate-pulse" />
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-white/20 animate-pulse" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/20 animate-pulse" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/20 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
