import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ZoomIn, X, Maximize2 } from 'lucide-react';

export default function ImageGallery({ images = [] }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Normalize images list (at least 1 image)
  const validImages = Array.isArray(images) && images.length > 0 ? images.filter(Boolean) : [];

  const prev = () => setActive((p) => (p - 1 + validImages.length) % validImages.length);
  const next = () => setActive((p) => (p + 1) % validImages.length);

  // Auto-scroll slideshow every 3.5 seconds when multiple images exist
  useEffect(() => {
    if (validImages.length <= 1 || isPaused || zoomed) return;

    const interval = setInterval(() => {
      setActive((prevIdx) => (prevIdx + 1) % validImages.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [validImages.length, isPaused, zoomed]);

  // Keyboard navigation for zoomed modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setZoomed(false);
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };

    if (zoomed) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomed, validImages.length]);

  if (!validImages.length) {
    return (
      <div className="aspect-[3/4] bg-[#121212] rounded-3xl border border-white/10 flex items-center justify-center text-gray-500">
        No image available
      </div>
    );
  }

  return (
    <div className="space-y-4 font-inter">
      {/* Main Showcase Image */}
      <div
        className="relative aspect-[3/4] bg-[#111111] rounded-3xl overflow-hidden border border-white/15 cursor-zoom-in group shadow-2xl"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        onClick={() => setZoomed(true)}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={validImages[active]}
            alt="Garment perspective"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Counter Badge */}
        {validImages.length > 1 && (
          <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white font-mono text-[11px] font-bold">
            {active + 1} / {validImages.length}
          </div>
        )}

        {/* Zoom Hint Icon */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <div className="w-10 h-10 flex items-center justify-center bg-black/75 backdrop-blur-md rounded-2xl border border-white/20 text-white shadow-xl">
            <ZoomIn size={18} />
          </div>
        </div>

        {/* Previous / Next Arrows */}
        {validImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl flex items-center justify-center bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-all shadow-xl"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl flex items-center justify-center bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-all shadow-xl"
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>

            {/* Bottom Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
              {validImages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActive(i);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === active ? 'w-6 bg-brand-red shadow-sm' : 'w-1.5 bg-white/40 hover:bg-white'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails Gallery Strip */}
      {validImages.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
          {validImages.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`shrink-0 w-20 h-24 sm:w-24 sm:h-28 rounded-2xl overflow-hidden border-2 transition-all relative ${
                i === active
                  ? 'border-brand-red ring-2 ring-brand-red/30 shadow-lg scale-105'
                  : 'border-white/15 hover:border-white/40 opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover bg-black" />
            </button>
          ))}
        </div>
      )}

      {/* Full-Screen Zoom Lightbox Modal */}
      <AnimatePresence>
        {zoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 font-inter"
            onClick={() => setZoomed(false)}
          >
            {/* Top Toolbar */}
            <div className="absolute top-6 right-6 flex items-center gap-3 z-30">
              <span className="px-3.5 py-1.5 rounded-full bg-white/10 text-white font-mono text-xs font-bold">
                {active + 1} / {validImages.length}
              </span>
              <button
                type="button"
                onClick={() => setZoomed(false)}
                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                aria-label="Close fullscreen preview"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation Buttons in Lightbox */}
            {validImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    prev();
                  }}
                  className="absolute left-6 top-1/2 -translate-y-1/2 p-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-30"
                  aria-label="Previous"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    next();
                  }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-30"
                  aria-label="Next"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Zoomed Image */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-w-[90vw] max-h-[85vh] overflow-hidden rounded-3xl border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={validImages[active]}
                alt="Zoomed garment inspection"
                className="w-full h-full object-contain max-h-[85vh]"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
