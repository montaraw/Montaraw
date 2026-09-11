import { useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { defaultBanners } from '../../data/seedData';
import { getOptimizedImageUrl } from '../../utils/imageOptimizer';

const HeroSection = memo(function HeroSection() {
  const { banners, loading } = useProducts();
  const activeBanners = banners && banners.length > 0 ? banners : (loading ? [] : defaultBanners);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  const prev = () => setCurrent((p) => (p - 1 + activeBanners.length) % activeBanners.length);
  const next = () => setCurrent((p) => (p + 1) % activeBanners.length);

  if (loading && activeBanners.length === 0) {
    return (
      <section className="relative min-h-[70vh] md:min-h-[78vh] lg:min-h-[82vh] lg:max-h-[820px] flex items-center overflow-hidden bg-[#0d0d0d] font-inter text-white">
        <div className="relative z-10 max-w-[1440px] mx-auto px-4 md:px-8 w-full py-8 md:py-10">
          <div className="max-w-xl space-y-4 animate-pulse">
            <div className="h-7 w-36 bg-white/15 rounded-full" />
            <div className="h-16 w-3/4 bg-white/10 rounded-2xl" />
            <div className="h-4 w-full bg-white/10 rounded" />
            <div className="h-4 w-2/3 bg-white/10 rounded" />
            <div className="flex gap-3 pt-3">
              <div className="h-12 w-44 bg-brand-red/30 rounded-xl" />
              <div className="h-12 w-44 bg-white/10 rounded-xl" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const banner = activeBanners[current] || activeBanners[0] || defaultBanners[0];
  const fallbackBannerImg = current === 1
    ? '/file_000000002a4482068aa6da09fe513d5f.png'
    : '/file_000000004af882088bac62a7d4856663.png';
  const optimizedBannerImg = getOptimizedImageUrl(banner?.image || fallbackBannerImg, { width: 1400, quality: 85 });

  return (
    <section className="relative min-h-[70vh] md:min-h-[78vh] lg:min-h-[82vh] lg:max-h-[820px] flex items-center overflow-hidden bg-brand-black font-inter text-white">
      {/* Background Image with Top-Focused Framing */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <img
            src={optimizedBannerImg}
            alt={banner.headline || 'Montaraw Luxury Collection'}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = fallbackBannerImg;
            }}
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Tag Pill */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-red/20 border border-brand-red/40 backdrop-blur-md mb-3.5 shadow-lg">
                  <Sparkles size={14} className="text-brand-red animate-pulse" />
                  <span className="text-[13px] font-bold text-red-300 uppercase">
                    {banner.title || "NEW COLLECTION '25"}
                  </span>
                </div>

                {/* Main Headline */}
                <h1 className="text-[40px] sm:text-[54px] md:text-[66px] lg:text-[72px] font-black text-white uppercase leading-[1.02] sm:leading-[1.05] mb-3.5 sm:mb-4 tracking-normal">
                  {(banner.headline || 'BEYOND YOUR LIMITS').split(' ').map((word, i) => (
                    <span key={i} className="block">
                      {word}
                    </span>
                  ))}
                </h1>

                {/* Subtitle Description */}
                <p className="text-[14px] sm:text-[16px] text-gray-100 font-medium leading-relaxed max-w-lg mb-7">
                  {banner.subtitle || 'Signature 240 GSM Oversized T-Shirts, Drop Shoulder Streetwear, and Luxury Couture.'}
                </p>

                {/* CTA Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 mb-5 pb-2">
                  <Link
                    to={banner.link || '/shop'}
                    className="btn-primary py-3 sm:py-4 px-5 sm:px-8 text-xs sm:text-[14px] font-black uppercase rounded-xl inline-flex items-center gap-2 group shadow-2xl hover:scale-105 transition-all"
                  >
                    <span>{banner.buttonText || 'EXPLORE COLLECTION'}</span>
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

                {/* Key Metrics Strip */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 pt-5 sm:pt-6 border-t border-white/20 max-w-xl">
                  <div className="p-2.5 sm:p-0 rounded-xl bg-black/40 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none border border-white/15 sm:border-0 text-center sm:text-left shadow-sm sm:shadow-none">
                    <p className="text-xs sm:text-lg md:text-[22px] font-black text-white">100% PURE</p>
                    <p className="text-[10px] sm:text-xs font-bold text-gray-300 uppercase mt-0.5 leading-tight">Velvet & Silk</p>
                  </div>
                  <div className="p-2.5 sm:p-0 rounded-xl bg-black/40 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none border border-white/15 sm:border-0 text-center sm:text-left shadow-sm sm:shadow-none">
                    <p className="text-xs sm:text-lg md:text-2xl font-black text-white">HAND-CRAFTED</p>
                    <p className="text-[10px] sm:text-xs font-bold text-gray-300 uppercase mt-0.5 leading-tight">Zari Embroidery</p>
                  </div>
                  <div className="p-2.5 sm:p-0 rounded-xl bg-black/40 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none border border-white/15 sm:border-0 text-center sm:text-left shadow-sm sm:shadow-none">
                    <p className="text-xs sm:text-lg md:text-2xl font-black text-white">4.9 ★</p>
                    <p className="text-[10px] sm:text-xs font-bold text-gray-300 uppercase mt-0.5 leading-tight">Top Rated</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="hidden lg:block lg:col-span-4" />
        </div>
      </div>

      {/* Navigation Controls */}
      {activeBanners.length > 1 && (
        <div className="absolute bottom-6 right-8 z-20 hidden md:flex items-center gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-2xl">
          <button
            onClick={prev}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all"
            aria-label="Previous Slide"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex items-center gap-1.5 px-2">
            {activeBanners.map((_, i) => (
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
});

export default HeroSection;
