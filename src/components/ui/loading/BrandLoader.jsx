import { motion } from 'framer-motion';

export default function BrandLoader({
  text = 'Curating Luxury Collection...',
  size = 'md',
  fullScreen = false,
  minHeight = 'min-h-[40vh]',
}) {
  const sizeMap = {
    sm: {
      ring: 'w-14 h-14',
      glow: 'w-16 h-16',
      svg: 'w-10 h-6',
      text: 'text-[10px]',
    },
    md: {
      ring: 'w-20 h-20',
      glow: 'w-24 h-24',
      svg: 'w-14 h-8',
      text: 'text-xs',
    },
    lg: {
      ring: 'w-28 h-28',
      glow: 'w-32 h-32',
      svg: 'w-20 h-11',
      text: 'text-sm',
    },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const content = (
    <div className="flex flex-col items-center justify-center gap-4 text-center px-4 font-inter select-none">
      {/* Animated Glowing Infinite Symbol & Looping Orbit Container */}
      <div className="relative flex items-center justify-center">
        {/* Pulsing Vibrant Ambient Neon Glow */}
        <div
          className={`absolute rounded-full bg-gradient-to-br from-red-600/35 via-red-500/20 to-transparent blur-2xl animate-pulse ${currentSize.glow}`}
        />

        {/* Outer Circular Track Ring */}
        <div
          className={`rounded-full border border-white/15 bg-black/40 backdrop-blur-sm ${currentSize.ring}`}
        />

        {/* Outer Rotating Glowing Neon Brand Orbit */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
          className={`absolute rounded-full border-2 border-transparent border-t-[#ff3333] border-r-[#ff3333]/60 shadow-[0_0_15px_rgba(255,51,51,0.6)] ${currentSize.ring}`}
        />

        {/* Counter-Rotating Platinum Sub-orbit */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          className={`absolute rounded-full border border-transparent border-b-white/80 border-l-white/40 w-3/4 h-3/4`}
        />

        {/* Center Glowing Infinity Loop Symbol (∞) */}
        <div className="relative z-10 flex items-center justify-center">
          <svg
            viewBox="0 0 100 50"
            className={`${currentSize.svg} filter drop-shadow-[0_0_12px_rgba(255,51,51,0.9)] drop-shadow-[0_0_4px_rgba(255,255,255,0.95)]`}
          >
            <defs>
              <linearGradient id="brand-inf-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ff2222" />
                <stop offset="35%" stopColor="#ffffff" />
                <stop offset="70%" stopColor="#ff4444" />
                <stop offset="100%" stopColor="#ff2222" />
              </linearGradient>
            </defs>
            {/* Background Infinity Path */}
            <path
              d="M 50,25 C 35,10 15,10 15,25 C 15,40 35,40 50,25 C 65,10 85,10 85,25 C 85,40 65,40 50,25 Z"
              fill="none"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Animated Flowing Trace */}
            <motion.path
              d="M 50,25 C 35,10 15,10 15,25 C 15,40 35,40 50,25 C 65,10 85,10 85,25 C 85,40 65,40 50,25 Z"
              fill="none"
              stroke="url(#brand-inf-grad)"
              strokeWidth="3.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="80 120"
              animate={{ strokeDashoffset: [0, -200] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
            />
          </svg>
        </div>
      </div>

      {/* Luxury Label with Animated Processing Badge */}
      {text && (
        <div className="space-y-1.5">
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`font-mono uppercase font-bold tracking-[0.25em] text-white/95 ${currentSize.text}`}
          >
            {text}
          </motion.p>
          <div className="flex items-center justify-center gap-2 px-3.5 py-1 rounded-full bg-black/85 border border-white/20 backdrop-blur-xl mx-auto w-fit shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff3333] shadow-[0_0_8px_#ff3333] animate-ping" />
            <span className="text-[10px] text-white/75 tracking-widest font-mono uppercase font-semibold">
              MONTARAW ATELIER
            </span>
          </div>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#080808]/95 backdrop-blur-2xl flex items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <div className={`w-full flex items-center justify-center ${minHeight} bg-transparent`}>
      {content}
    </div>
  );
}
