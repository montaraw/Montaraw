import { X, Search as SearchIcon, ArrowRight, Clock, Trash2, Tag } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '../../context/ProductContext';
import { api } from '../../api/client';

export default function SearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const { products } = useProducts();
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Fetch real database recent searches on open
  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      
      api.getRecentSearches()
        .then((res) => {
          if (isMounted && res.searches) {
            setRecentSearches(res.searches);
          }
        })
        .catch(() => {
          // If backend offline, fall back to local storage
          try {
            const saved = JSON.parse(localStorage.getItem('montaraw_recent_searches') || '[]');
            if (isMounted) setRecentSearches(saved);
          } catch (e) {}
        });
    } else {
      setQuery('');
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const saveRecentSearch = async (term) => {
    if (!term || !term.trim()) return;
    const clean = term.trim();
    
    // Optimistically update UI
    setRecentSearches((prev) => {
      const filtered = prev.filter((t) => t.toLowerCase() !== clean.toLowerCase());
      const updated = [clean, ...filtered].slice(0, 8);
      localStorage.setItem('montaraw_recent_searches', JSON.stringify(updated));
      return updated;
    });

    // Save to Database
    try {
      await api.saveRecentSearch(clean);
    } catch (e) {
      console.warn('[SearchOverlay] Could not save recent search to database:', e.message);
    }
  };

  const removeRecentSearch = async (termToRemove, e) => {
    e.stopPropagation();
    
    // Optimistically update UI
    setRecentSearches((prev) => {
      const updated = prev.filter((t) => t !== termToRemove);
      localStorage.setItem('montaraw_recent_searches', JSON.stringify(updated));
      return updated;
    });

    // Delete from Database
    try {
      await api.deleteRecentSearch(termToRemove);
    } catch (e) {
      console.warn('[SearchOverlay] Could not delete recent search from database:', e.message);
    }
  };

  const clearAllRecentSearches = async () => {
    setRecentSearches([]);
    localStorage.removeItem('montaraw_recent_searches');

    // Clear from Database
    try {
      await api.clearRecentSearches();
    } catch (e) {
      console.warn('[SearchOverlay] Could not clear recent searches from database:', e.message);
    }
  };

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase().trim();
    const matched = products
      .filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.categorySlug?.toLowerCase().includes(q) ||
          p.category?.name?.toLowerCase().includes(q) ||
          (typeof p.category === 'string' && p.category.toLowerCase().includes(q)) ||
          p.description?.toLowerCase().includes(q) ||
          p.gender?.toLowerCase().includes(q) ||
          p.fabric?.toLowerCase().includes(q)
      )
      .slice(0, 6);
    setResults(matched);
  }, [query, products]);

  const handleSelect = (product) => {
    saveRecentSearch(product.name);
    navigate(`/product/${product.id || product.slug}`);
    onClose();
  };

  const handleSearchTerm = (term) => {
    saveRecentSearch(term);
    setQuery(term);
    navigate(`/shop?search=${encodeURIComponent(term)}`);
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query.trim());
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-start px-4 pt-12 md:pt-24 pb-12 overflow-y-auto font-inter text-white"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-2xl bg-[#121212] border border-white/20 rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <form onSubmit={handleSubmit} className="relative border-b border-white/15 bg-[#161616]">
              <SearchIcon
                size={22}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-red shrink-0"
              />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search garments, dresses, oversized tees, hoodies..."
                className="w-full bg-transparent text-white placeholder-gray-400 pl-14 pr-24 py-4 md:py-5 text-sm md:text-base font-inter focus:outline-none font-medium"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="text-xs px-2 py-1 rounded-md bg-white/10 text-gray-300 hover:text-white"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 text-gray-300 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label="Close search"
                >
                  <X size={18} />
                </button>
              </div>
            </form>

            {/* Real Database Recent Searches Section (Shown when Query is empty) */}
            {!query.trim() && (
              <div className="p-5 md:p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-wider">
                    <Clock size={14} className="text-brand-red" />
                    <span>Recent Searches</span>
                  </div>
                  {recentSearches.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAllRecentSearches}
                      className="text-[11px] font-bold text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1 uppercase"
                    >
                      <Trash2 size={12} />
                      <span>Clear All</span>
                    </button>
                  )}
                </div>

                {recentSearches.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {recentSearches.map((term, i) => (
                      <div
                        key={i}
                        onClick={() => handleSearchTerm(term)}
                        className="group cursor-pointer px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 text-xs text-white font-medium transition-all inline-flex items-center gap-2"
                      >
                        <Clock size={12} className="text-gray-400 group-hover:text-brand-red transition-colors" />
                        <span>{term}</span>
                        <button
                          type="button"
                          onClick={(e) => removeRecentSearch(term, e)}
                          className="p-0.5 rounded-full hover:bg-white/20 text-gray-400 hover:text-white transition-colors"
                          title="Remove search"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 py-3 text-center sm:text-left">
                    No recent searches yet. Search for garments, categories, or fabrics above.
                  </p>
                )}
              </div>
            )}

            {/* Matching Live Results */}
            {results.length > 0 && (
              <div className="divide-y divide-white/10 max-h-[60vh] overflow-y-auto">
                <div className="px-5 py-2.5 bg-black/40 flex items-center justify-between text-[11px] text-gray-300 font-bold uppercase">
                  <span>Garments Found ({results.length})</span>
                  <span>Tap to inspect</span>
                </div>
                {results.map((product) => (
                  <button
                    key={product.id || product.slug}
                    onClick={() => handleSelect(product)}
                    className="w-full flex items-center justify-between gap-4 p-4 hover:bg-white/5 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3.5">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-14 h-16 object-cover rounded-xl bg-black border border-white/10 shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div>
                        <span className="text-[10px] font-bold text-brand-red uppercase block">
                          {product.gender || 'Unisex'} • {product.categorySlug || 'Couture'}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-white uppercase line-clamp-1 group-hover:text-red-400 transition-colors">
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs sm:text-sm font-black text-white">
                            ₹{product.price?.toLocaleString()}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-[11px] text-gray-400 line-through">
                              ₹{product.originalPrice?.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 text-gray-400 group-hover:text-white group-hover:bg-brand-red/20 transition-all shrink-0">
                      <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                ))}

                {/* View All Results Button */}
                <div className="p-3.5 bg-black/60 text-center">
                  <button
                    onClick={handleSubmit}
                    className="btn-primary py-2.5 px-6 rounded-xl text-xs font-bold uppercase inline-flex items-center gap-2 shadow-xl"
                  >
                    <span>View all results for "{query}"</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* No Results Fallback */}
            {query.trim().length >= 2 && results.length === 0 && (
              <div className="p-8 text-center space-y-2">
                <Tag size={28} className="text-white/30 mx-auto mb-2" />
                <p className="text-sm font-bold text-white uppercase">No Garments Found for "{query}"</p>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Try searching for keywords like "dress", "oversized", "hoodie", "cargo", or explore our collection lookbook.
                </p>
                <button
                  onClick={() => {
                    navigate('/shop');
                    onClose();
                  }}
                  className="btn-primary py-2 px-5 rounded-xl text-xs font-bold uppercase mt-3 inline-block"
                >
                  Explore All Garments
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
