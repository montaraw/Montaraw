import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react';
import { getOptimizedImageUrl } from '../../utils/imageOptimizer';

export default function ImageGallery({ images = [], image = '' }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  // Clean list of images
  const rawList = Array.isArray(images) && images.length > 0 ? images : (image ? [image] : []);
  const imageList = rawList.filter(
    (img) =>
      img &&
      typeof img === 'string' &&
      !img.match(/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i) &&
      !img.includes('youtube.com') &&
      !img.includes('youtu.be') &&
      !img.includes('vimeo.com')
  );

  const finalImages =
    imageList.length > 0
      ? imageList
      : ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80'];
  const activeImage = finalImages[active] || finalImages[0];

  const touchStartX = useRef(null);

  const prev = () => setActive((p) => (p - 1 + finalImages.length) % finalImages.length);
  const next = () => setActive((p) => (p + 1) % finalImages.length);

  // Touch swipe support for mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) next();
      else prev();
    }
    touchStartX.current = null;
  };

  // Continuous auto-slide slideshow every 3.5 seconds (excluding when in fullscreen zoom)
  useEffect(() => {
    if (finalImages.length <= 1 || zoomed) return;

    const interval = setInterval(() => {
      setActive((prevIdx) => (prevIdx + 1) % finalImages.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [finalImages.length, zoomed]);

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
  }, [zoomed, finalImages.length]);

  return (
    <div className="space-y-4 font-inter">
      {/* Main Showcase Image */}
      <div
        className="relative aspect-[3/4] bg-[#111111] rounded-3xl overflow-hidden border border-white/15 group shadow-2xl"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`img-${active}-${activeImage}`}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full h-full cursor-zoom-in"
            onClick={() => setZoomed(true)}
          >
            <img
              src={getOptimizedImageUrl(activeImage, { width: 1000, quality: 85 })}
              alt="Product perspective"
              className="w-full h-full object-cover"
              loading="eager"
            />

            {/* Zoom Hint Icon */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
              <div className="w-10 h-10 flex items-center justify-center bg-black/75 backdrop-blur-md rounded-2xl border border-white/20 text-white shadow-xl">
                <ZoomIn size={18} />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Counter Badge */}
        {finalImages.length > 1 && (
          <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white font-mono text-[11px] font-bold pointer-events-none">
            {active + 1} / {finalImages.length}
          </div>
        )}

        {/* Previous / Next Arrows */}
        {finalImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl flex items-center justify-center bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-all shadow-xl z-20"
              aria-label="Previous media"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl flex items-center justify-center bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-all shadow-xl z-20"
              aria-label="Next media"
            >
              <ChevronRight size={20} />
            </button>

            {/* Bottom Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
              {finalImages.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActive(i);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === active
                      ? 'w-6 bg-brand-red shadow-sm'
                      : 'w-1.5 bg-white/40 hover:bg-white'
                  }`}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails Gallery Strip */}
      {finalImages.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
          {finalImages.map((imgUrl, i) => (
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
              <img
                src={getOptimizedImageUrl(imgUrl, { width: 250, quality: 75 })}
                alt={`Thumbnail ${i + 1}`}
                className="w-full h-full object-cover bg-black"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Full-Screen Zoom / Lightbox Modal */}
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
                {active + 1} / {finalImages.length}
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
            {finalImages.length > 1 && (
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

            {/* Zoomed Image Display */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-w-[90vw] max-h-[85vh] overflow-hidden rounded-3xl border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={activeImage}
                alt="Zoomed product inspection"
                className="w-full h-full object-contain max-h-[85vh]"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
