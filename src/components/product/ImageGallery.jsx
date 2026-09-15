import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ZoomIn, X, Play, Film, Volume2, Maximize2 } from 'lucide-react';
import { normalizeProductMedia, getEmbedVideoUrl, isVideoUrl } from '../../utils/mediaHelper';

export default function ImageGallery({ images = [], videos = [] }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Normalize media items into unified list of images and videos
  const mediaList = normalizeProductMedia(images, videos);
  const activeMedia = mediaList[active] || mediaList[0];

  const touchStartX = useRef(null);

  const prev = () => setActive((p) => (p - 1 + mediaList.length) % mediaList.length);
  const next = () => setActive((p) => (p + 1) % mediaList.length);

  // Touch swipe support for mobile
  const handleTouchStart = (e) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    setIsPaused(false);
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) next();
      else prev();
    }
    touchStartX.current = null;
  };

  // Auto-scroll slideshow every 4 seconds ONLY when viewing static images and not paused/zoomed
  useEffect(() => {
    if (mediaList.length <= 1 || isPaused || zoomed || activeMedia?.type === 'video') return;

    const interval = setInterval(() => {
      setActive((prevIdx) => (prevIdx + 1) % mediaList.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [mediaList.length, isPaused, zoomed, activeMedia?.type]);

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
  }, [zoomed, mediaList.length]);

  if (!mediaList.length) {
    return (
      <div className="aspect-[3/4] bg-[#121212] rounded-3xl border border-white/10 flex items-center justify-center text-gray-500">
        No media available
      </div>
    );
  }

  return (
    <div className="space-y-4 font-inter">
      {/* Main Showcase (Image or Video) */}
      <div
        className="relative aspect-[3/4] bg-[#111111] rounded-3xl overflow-hidden border border-white/15 group shadow-2xl"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          {activeMedia?.type === 'video' ? (
            <motion.div
              key={`video-${active}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full bg-black flex items-center justify-center relative"
            >
              {activeMedia.url.includes('youtube.com') ||
              activeMedia.url.includes('youtu.be') ||
              activeMedia.url.includes('vimeo.com') ? (
                <iframe
                  src={getEmbedVideoUrl(activeMedia.url)}
                  title="Product video showcase"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={activeMedia.url}
                  controls
                  playsInline
                  autoPlay
                  muted
                  loop
                  className="w-full h-full object-cover"
                />
              )}

              {/* Video Type Indicator Badge */}
              <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-brand-red/40 text-brand-red font-mono text-[11px] font-bold flex items-center gap-1.5 shadow-lg pointer-events-none">
                <Film size={12} />
                <span>VIDEO DEMO</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`img-${active}`}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="w-full h-full cursor-zoom-in"
              onClick={() => setZoomed(true)}
            >
              <img
                src={activeMedia?.url}
                alt="Product perspective"
                className="w-full h-full object-cover"
              />

              {/* Zoom Hint Icon */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                <div className="w-10 h-10 flex items-center justify-center bg-black/75 backdrop-blur-md rounded-2xl border border-white/20 text-white shadow-xl">
                  <ZoomIn size={18} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Counter Badge */}
        {mediaList.length > 1 && (
          <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white font-mono text-[11px] font-bold pointer-events-none">
            {active + 1} / {mediaList.length}
          </div>
        )}

        {/* Previous / Next Arrows */}
        {mediaList.length > 1 && (
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
              {mediaList.map((item, i) => (
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
                  aria-label={`Go to media ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails Gallery Strip (Photos & Videos) */}
      {mediaList.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
          {mediaList.map((item, i) => (
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
              {item.type === 'video' ? (
                <div className="w-full h-full bg-[#161616] flex flex-col items-center justify-center relative">
                  {item.url.includes('youtube.com') || item.url.includes('youtu.be') ? (
                    <div className="w-full h-full bg-black/80 flex items-center justify-center">
                      <Film size={20} className="text-brand-red" />
                    </div>
                  ) : (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover opacity-60"
                      muted
                      playsInline
                    />
                  )}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                    <div className="w-7 h-7 rounded-full bg-brand-red/90 text-white flex items-center justify-center shadow-md">
                      <Play size={12} fill="currentColor" className="ml-0.5" />
                    </div>
                    <span className="text-[9px] font-bold text-white uppercase mt-1 tracking-wider">
                      Video
                    </span>
                  </div>
                </div>
              ) : (
                <img
                  src={item.url}
                  alt=""
                  className="w-full h-full object-cover bg-black"
                />
              )}
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
                {active + 1} / {mediaList.length}
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
            {mediaList.length > 1 && (
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

            {/* Zoomed Media Display */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-w-[90vw] max-h-[85vh] overflow-hidden rounded-3xl border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {activeMedia?.type === 'video' ? (
                activeMedia.url.includes('youtube.com') ||
                activeMedia.url.includes('youtu.be') ||
                activeMedia.url.includes('vimeo.com') ? (
                  <div className="w-[85vw] max-w-4xl aspect-video rounded-3xl overflow-hidden bg-black">
                    <iframe
                      src={getEmbedVideoUrl(activeMedia.url)}
                      title="Fullscreen video"
                      className="w-full h-full"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <video
                    src={activeMedia.url}
                    controls
                    autoPlay
                    className="w-full max-h-[85vh] object-contain rounded-3xl bg-black"
                  />
                )
              ) : (
                <img
                  src={activeMedia?.url}
                  alt="Zoomed product inspection"
                  className="w-full h-full object-contain max-h-[85vh]"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
