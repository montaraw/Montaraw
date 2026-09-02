import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';

export default function HeroSection() {
  const { banners, loading } = useProducts();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const prev = () => setCurrent((p) => (p - 1 + banners.length) % banners.length);
  const next = () => setCurrent((p) => (p + 1) % banners.length);

  if (loading || !banners.length) {
    return (
      <section className="relative min-h-[75vh] md:min-h-[85vh] lg:min-h-[88vh] flex items-center bg-[#0a0a0a] font-inter text-white px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent" />
        <div className="relative z-10 max-w-[1440px] mx-auto px-4 md:px-8 w-full py-10 md:py-12 animate-pulse space-y-5">
          <div className="w-36 h-6 rounded-full bg-white/10" />
          <div className="space-y-3">
            <div className="h-10 sm:h-16 md:h-20 w-3/4 sm:w-2/3 bg-white/15 rounded-2xl" />
            <div className="h-4 sm:h-5 w-1/2 sm:w-1/3 bg-white/10 rounded-lg" />
          </div>
          <div className="flex gap-3 pt-2">
            <div className="w-40 sm:w-48 h-12 rounded-xl bg-brand-red/40" />
            <div className="w-36 sm:w-40 h-12 rounded-xl bg-white/10" />
          </div>
        </div>
      </section>
    );
  }
  const banner = banners[current];

  return (
    <section className="relative min-h-[70vh] md:min-h-[78vh] lg:min-h-[82vh] lg:max-h-[820px] flex items-center overflow-hidden bg-brand-black font-inter text-white">
      {/* Background Image with Clean Top-Focused Framing */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <img
            src={banner.image}
            alt={banner.headline}
            className="absolute inset-0 w-full h-full object-cover object-top md:object-[center_15%] opacity-95"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-black/30" />
        </motion.div>
      </AnimatePresence>

      {/* Hero Content */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 md:px-8 w-full py-8 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Text Box */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${current}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
              >
                {/* Tag Pill (+2px) */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-red/20 border border-brand-red/40 backdrop-blur-md mb-3.5 shadow-lg">
                  <Sparkles size={14} className="text-brand-red animate-pulse" />
                  <span className="text-[13px] font-bold text-red-300 uppercase">
                    {banner.title}
                  </span>
                </div>

                {/* Main Headline (Enhanced for Phone & Desktop) */}
                <h1 className="text-[40px] sm:text-[54px] md:text-[66px] lg:text-[72px] font-black text-white uppercase leading-[1.02] sm:leading-[1.05] mb-3.5 sm:mb-4 tracking-normal">
                  {banner.headline.split(' ').map((word, i) => (
                    <span key={i} className="block">
                      {word}
                    </span>
                  ))}
                </h1>

                {/* Subtitle Description (+2px) */}
                <p className="text-[14px] sm:text-[16px] text-gray-100 font-medium leading-relaxed max-w-lg mb-7">
                  {banner.subtitle}
                </p>

                {/* Modern CTA Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 mb-5 pb-2">
                  <Link
                    to={banner.link || '/shop'}
                    className="btn-primary py-3 sm:py-4 px-5 sm:px-8 text-xs sm:text-[14px] font-black uppercase rounded-xl inline-flex items-center gap-2 group shadow-2xl hover:scale-105 transition-all"
                  >
                    <span>EXPLORE COLLECTION</span>
                    <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    to="/shop?new=true"
                    className="px-4 sm:px-7 py-3 sm:py-4 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 hover:border-white text-white text-xs sm:text-[14px] font-black uppercase backdrop-blur-md transition-all shadow-xl inline-flex items-center gap-2"
                  >
                    <Sparkles size={14} className="text-brand-red" />
                    <span>NEW ARRIVALS '25</span>
                  </Link>
                </div>

                {/* Key Metrics - Mobile Optimized 3-Column Glass Strip */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 pt-5 sm:pt-6 border-t border-white/20 max-w-xl">
                  <div className="p-2.5 sm:p-0 rounded-xl bg-black/40 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none border border-white/15 sm:border-0 text-center sm:text-left shadow-sm sm:shadow-none">
                    <p className="text-xs sm:text-lg md:text-[22px] font-black text-white">100% COTTON</p>
                    <p className="text-[10px] sm:text-xs font-bold text-gray-300 uppercase mt-0.5 leading-tight">Bio-Washed</p>
                  </div>
                  <div className="p-2.5 sm:p-0 rounded-xl bg-black/40 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none border border-white/15 sm:border-0 text-center sm:text-left shadow-sm sm:shadow-none">
                    <p className="text-xs sm:text-lg md:text-2xl font-black text-white ">PRE-SHRUNK</p>
                    <p className="text-[10px] sm:text-xs font-bold text-gray-300 uppercase mt-0.5 leading-tight">Heavy Weave</p>
                  </div>
                  <div className="p-2.5 sm:p-0 rounded-xl bg-black/40 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none border border-white/15 sm:border-0 text-center sm:text-left shadow-sm sm:shadow-none">
                    <p className="text-xs sm:text-lg md:text-2xl font-black text-white ">4.9 ★</p>
                    <p className="text-[10px] sm:text-xs font-bold text-gray-300 uppercase mt-0.5 leading-tight">Top Rated</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="hidden lg:block lg:col-span-4" />
        </div>
      </div>

      {/* Slide Navigation Controls */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 right-8 z-20 hidden md:flex items-center gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-2xl">
          <button
            onClick={prev}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all"
            aria-label="Previous Slide"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex items-center gap-1.5 px-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`transition-all duration-300 rounded-full ${i === current
                  ? 'w-6 h-1.5 bg-brand-red'
                  : 'w-1.5 h-1.5 bg-white/40 hover:bg-white'
                  }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all"
            aria-label="Next Slide"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </section>
  );
}
