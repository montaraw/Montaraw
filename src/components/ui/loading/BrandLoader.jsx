import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function BrandLoader({
  text = 'Curating Luxury Collection...',
  size = 'md',
  fullScreen = false,
  minHeight = 'min-h-[40vh]',
}) {
  const sizeMap = {
    sm: {
      ring: 'w-10 h-10 border-2',
      glow: 'w-14 h-14',
      icon: 14,
      text: 'text-[10px]',
    },
    md: {
      ring: 'w-16 h-16 border-[2.5px]',
      glow: 'w-20 h-20',
      icon: 20,
      text: 'text-xs',
    },
    lg: {
      ring: 'w-24 h-24 border-[3px]',
      glow: 'w-28 h-28',
      icon: 28,
      text: 'text-sm',
    },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const content = (
    <div className="flex flex-col items-center justify-center gap-4 text-center px-4 font-inter select-none">
      {/* Animated Brand Ring & Glow */}
      <div className="relative flex items-center justify-center">
        {/* Pulsing Ambient Glow */}
        <div
          className={`absolute rounded-full bg-brand-red/20 blur-xl animate-pulse ${currentSize.glow}`}
        />

        {/* Outer Rotating Track Ring */}
        <div
          className={`rounded-full border-white/10 ${currentSize.ring}`}
        />

        {/* Spinning Brand Accent Orbit */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          className={`absolute rounded-full border-transparent border-t-brand-red border-r-brand-red/40 ${currentSize.ring}`}
        />

        {/* Second Reverse Sub-orbit */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
          className={`absolute rounded-full border-transparent border-b-white/50 w-3/4 h-3/4 border`}
        />

        {/* Center Monogram / Sparkle */}
        <motion.div
          animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="relative text-brand-red"
        >
          <Sparkles size={currentSize.icon} />
        </motion.div>
      </div>

      {/* Luxury Label with Animated Gradient & Pulse */}
      {text && (
        <div className="space-y-1">
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`font-mono uppercase font-bold tracking-[0.25em] text-white/90 ${currentSize.text}`}
          >
            {text}
          </motion.p>
          <div className="flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-ping" />
            <span className="text-[10px] text-white/40 tracking-wider font-mono uppercase">
              MONTARAW ATELIER
            </span>
          </div>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#0a0a0a]/95 backdrop-blur-xl flex items-center justify-center">
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
