import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';

export default function HeroSection() {
  const { banners } = useProducts();
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

  if (!banners.length) {
    return (
      <section className="relative min-h-[75vh] md:min-h-[85vh] lg:min-h-[88vh] flex items-center justify-center bg-brand-black font-inter text-white px-4">
        <div className="text-center space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-red/20 border border-brand-red/40 backdrop-blur-md">
            <Sparkles size={14} className="text-brand-red animate-pulse" />
            <span className="text-[13px] font-bold text-red-300 uppercase">MONTARAW ATELIER</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white uppercase tracking-normal">
            BEYOND YOUR LIMITS
          </h1>
          <p className="text-sm text-gray-300">
            High-end streetwear and couture silhouettes crafted for the uncompromising.
          </p>
          <div className="pt-2">
            <Link to="/shop" className="btn-primary py-3.5 px-8 text-xs font-black uppercase rounded-xl inline-flex items-center gap-2">
              Explore Collection <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    );
  }
  const banner = banners[current];

  return (
    <section className="relative min-h-[75vh] md:min-h-[85vh] lg:min-h-[88vh] flex items-center overflow-hidden bg-brand-black font-inter text-white">
      {/* Background Image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img
            src={banner.image}
            alt={banner.headline}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-95"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-brand-black/40" />
        </motion.div>
      </AnimatePresence>

      {/* Hero Content positioned higher up */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 md:px-8 w-full py-10 md:py-12 -translate-y-2 md:-translate-y-6">
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

                {/* Main Headline (+2px) */}
                <h1 className="text-[34px] sm:text-[54px] md:text-[66px] lg:text-[72px] font-black text-white uppercase leading-[1.05] mb-4 tracking-normal">
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

                {/* Modern CTA Action Buttons (+2px) */}
                <div className="flex flex-wrap items-center gap-3.5 mb-4 pb-4">
                  <Link
                    to={banner.link || '/shop'}
                    className="btn-primary py-4 px-8 text-[14px] font-black uppercase rounded-xl inline-flex items-center gap-2.5 group shadow-2xl hover:scale-105 transition-all"
                  >
                    <span>EXPLORE COLLECTION</span>
                    <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    to="/shop?new=true"
                    className="px-7 py-4 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 hover:border-white text-white text-[14px] font-black uppercase backdrop-blur-md transition-all shadow-xl inline-flex items-center gap-2"
                  >
                    <Sparkles size={15} className="text-brand-red" />
                    <span>NEW ARRIVALS '25</span>
                  </Link>
                </div>

                {/* Key Metrics (+2px) */}
                <div className="flex items-center gap-6 md:gap-10 pt-8 md:pt-4 border-t border-white/20">
                  <div>
                    <p className="text-[20px] md:text-[24px] font-black text-white">240+ GSM</p>
                    <p className="text-[13px] font-bold text-gray-200 uppercase mt-0.5">Heavyweight Cotton</p>
                  </div>
                  <div>
                    <p className="text-[20px] md:text-[24px] font-black text-white">100% RAW</p>
                    <p className="text-[13px] font-bold text-gray-200 uppercase mt-0.5">Single-Brand Signature</p>
                  </div>
                  <div>
                    <p className="text-[20px] md:text-[24px] font-black text-white">4.9 ★</p>
                    <p className="text-[13px] font-bold text-gray-200 uppercase mt-0.5">Customer Loved</p>
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
