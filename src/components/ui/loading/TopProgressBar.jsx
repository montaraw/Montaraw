import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '../../../context/ProductContext';

export default function TopProgressBar() {
  const location = useLocation();
  const { isSyncing, loading } = useProducts() || {};
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);

  // Trigger on route transition
  useEffect(() => {
    setActive(true);
    setProgress(30);

    const t1 = setTimeout(() => setProgress(75), 150);
    const t2 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => setActive(false), 300);
    }, 450);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [location.pathname, location.search]);

  // Also trigger when context is actively syncing
  useEffect(() => {
    if (isSyncing || loading) {
      setActive(true);
      setProgress(60);
    } else {
      setProgress(100);
      const timer = setTimeout(() => setActive(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isSyncing, loading]);

  return (
    <AnimatePresence>
      {active && (
        <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-[2.5px] bg-black/20">
          <motion.div
            initial={{ width: '0%', opacity: 1 }}
            animate={{ width: `${progress}%`, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ ease: 'easeInOut', duration: 0.3 }}
            className="h-full bg-gradient-to-r from-red-600 via-brand-red to-orange-400 shadow-[0_0_12px_#ff2d2d]"
          />
        </div>
      )}
    </AnimatePresence>
  );
}
