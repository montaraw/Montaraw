import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import MontarawLogo from './MontarawLogo';

export default function SplashScreen() {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Hide immediately on admin routes
    if (location.pathname.startsWith('/admin')) {
      setIsOpen(false);
      document.body.style.overflow = '';
      return;
    }

    const handleOpenSplash = () => {
      setIsOpen(true);
      document.body.style.overflow = 'hidden';
    };

    window.addEventListener('montaraw_open_splash', handleOpenSplash);

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('montaraw_open_splash', handleOpenSplash);
      document.body.style.overflow = '';
    };
  }, [location.pathname, isOpen]);

  const handleSelectGender = (gender) => {
    setIsOpen(false);
    document.body.style.overflow = '';

    if (gender === 'women') {
      navigate('/shop?gender=women');
    } else if (gender === 'men') {
      navigate('/shop?gender=men');
    } else {
      navigate('/shop');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="montaraw-responsive-splash"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.28 }}
        className="fixed inset-0 z-[9999] w-full h-full bg-black/90 backdrop-blur-xl text-white font-inter flex items-center justify-center p-4 sm:p-6 overflow-y-auto select-none"
      >
        {/* Subtle Ambient Red Light Effect */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-red/15 rounded-full blur-[120px] pointer-events-none" />

        {/* Modal Container Card (Centered on Desktop, Full-Height Card on Mobile) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          className="relative w-full max-w-lg bg-[#111111]/95 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between my-auto"
        >
          {/* Top Header Row with Centered Animated Logo */}
          <div className="relative w-full flex items-center justify-center pt-1 z-10">
            <motion.div
              initial={{ y: -20, opacity: 0, scale: 0.88 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.08 }}
              className="text-center relative inline-block"
            >
              {/* Pulsing Red Ambient Aura behind Logo */}
              <motion.div
                animate={{
                  opacity: [0.25, 0.6, 0.25],
                  scale: [0.9, 1.1, 0.9],
                }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 bg-brand-red/25 blur-xl -z-10 rounded-full"
              />
              <MontarawLogo iconSize="w-9 h-9 sm:w-11 sm:h-11" textSize="text-2xl sm:text-3xl font-black" />
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.35, duration: 0.5, ease: 'easeOut' }}
                className="h-[1.5px] bg-gradient-to-r from-transparent via-brand-red to-transparent mt-1"
              />
            </motion.div>
          </div>

          {/* Middle Section: Animated Title & 2 Category Cards */}
          <div className="w-full space-y-4 sm:space-y-5 z-10 py-5">
            {/* Animated Header Text */}
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.18, duration: 0.35 }}
              className="text-center space-y-1"
            >
              <h1 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight leading-tight">
                Who Are You Shopping For?
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 font-medium">
                Choose a category to explore the latest drop
              </p>
            </motion.div>

            {/* 2 Interactive Cards (MEN & WOMEN) */}
            <div className="grid grid-cols-2 gap-3.5 sm:gap-5 pt-1">
              {/* 1. MEN CARD */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                whileTap={{ scale: 0.96 }}
                whileHover={{ y: -3 }}
                onClick={() => handleSelectGender('men')}
                className="group relative rounded-2xl overflow-hidden cursor-pointer border border-white/15 hover:border-white/50 active:border-white transition-all duration-300 bg-[#161616] flex flex-col shadow-2xl"
              >
                <div className="aspect-[4/5] w-full overflow-hidden relative bg-black">
                  <img
                    src="/file_000000004af882088bac62a7d4856663.png"
                    alt="Men Collection"
                    className="w-full h-full object-cover group-hover:scale-105 group-active:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                </div>

                <div className="p-3 sm:p-4 bg-[#161616] space-y-1 text-center border-t border-white/5">
                  <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                    MEN
                  </h2>
                  <p className="text-[10px] sm:text-xs text-gray-400 font-medium truncate">
                    Streetwear & Tees
                  </p>
                  <div className="pt-1.5">
                    <button className="w-full py-2 sm:py-2.5 rounded-xl bg-white hover:bg-gray-100 text-black text-xs font-black uppercase flex items-center justify-center gap-1 shadow-md transition-colors">
                      <span>Shop Men</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* 2. WOMEN CARD */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                whileTap={{ scale: 0.96 }}
                whileHover={{ y: -3 }}
                onClick={() => handleSelectGender('women')}
                className="group relative rounded-2xl overflow-hidden cursor-pointer border border-white/15 hover:border-brand-red/60 active:border-brand-red transition-all duration-300 bg-[#161616] flex flex-col shadow-2xl"
              >
                <div className="aspect-[4/5] w-full overflow-hidden relative bg-black">
                  <img
                    src="/file_000000002a4482068aa6da09fe513d5f.png"
                    alt="Women Collection"
                    className="w-full h-full object-cover group-hover:scale-105 group-active:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                </div>

                <div className="p-3 sm:p-4 bg-[#161616] space-y-1 text-center border-t border-white/5">
                  <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                    WOMEN
                  </h2>
                  <p className="text-[10px] sm:text-xs text-gray-400 font-medium truncate">
                    Pakistani Suits & Cord Sets
                  </p>
                  <div className="pt-1.5">
                    <button className="w-full py-2 sm:py-2.5 rounded-xl bg-brand-red hover:bg-red-700 text-white text-xs font-black uppercase flex items-center justify-center gap-1 shadow-md shadow-brand-red/20 transition-colors">
                      <span>Shop Women</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Bottom Bar: Explore All Link */}
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.32 }}
            className="w-full text-center pt-1 pb-1 z-10"
          >
            <button
              onClick={() => handleSelectGender('all')}
              className="text-sm font-bold text-gray-300 hover:text-white underline underline-offset-4 tracking-wide transition-colors"
            >
              Explore all products →
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
