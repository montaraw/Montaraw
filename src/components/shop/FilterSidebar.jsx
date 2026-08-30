import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { X, SlidersHorizontal, Sparkles, Flame, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '../../context/ProductContext';

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '30', '32', '34', '36', 'One Size'];

const colorOptions = [
  { name: 'Noir Black', value: '#000000' },
  { name: 'Off White', value: '#f5f5f5' },
  { name: 'Charcoal', value: '#2d2d2d' },
  { name: 'Wine / Burgundy', value: '#3b1424' },
  { name: 'Midnight Navy', value: '#1a1a2e' },
  { name: 'Olive Drab', value: '#2d3328' },
  { name: 'Silver / Grey', value: '#c0c0c0' },
  { name: 'Vintage Mocha', value: '#8a7968' },
];

export default function FilterSidebar({ filters, setFilters, isOpen, onClose }) {
  const { categories, loading } = useProducts();
  const [, setSearchParams] = useSearchParams();

  const handleGenderChange = (gender) => {
    setFilters((prev) => ({ ...prev, gender }));
    const params = new URLSearchParams(window.location.search);
    if (gender !== 'all') {
      params.set('gender', gender);
    } else {
      params.delete('gender');
    }
    setSearchParams(params);
  };

  const handleCategoryChange = (slug) => {
    setFilters((prev) => ({ ...prev, category: slug }));
    const params = new URLSearchParams(window.location.search);
    if (slug !== 'all') {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    setSearchParams(params);
  };

  const toggleSize = (size) => {
    setFilters((prev) => {
      const currentSizes = prev.sizes || [];
      return {
        ...prev,
        sizes: currentSizes.includes(size)
          ? currentSizes.filter((s) => s !== size)
          : [...currentSizes, size],
      };
    });
  };

  const toggleColor = (color) => {
    setFilters((prev) => {
      const currentColors = prev.colors || [];
      return {
        ...prev,
        colors: currentColors.includes(color)
          ? currentColors.filter((c) => c !== color)
          : [...currentColors, color],
      };
    });
  };

  const toggleSale = () => {
    setFilters((prev) => {
      const nextSale = !prev.isSale;
      const params = new URLSearchParams(window.location.search);
      if (nextSale) params.set('sale', 'true');
      else params.delete('sale');
      setSearchParams(params);
      return { ...prev, isSale: nextSale };
    });
  };

  const toggleNewArrivals = () => {
    setFilters((prev) => {
      const nextNew = !prev.isNew;
      const params = new URLSearchParams(window.location.search);
      if (nextNew) params.set('new', 'true');
      else params.delete('new');
      setSearchParams(params);
      return { ...prev, isNew: nextNew };
    });
  };

  const clearFilters = () => {
    setFilters({
      gender: 'all',
      category: 'all',
      isSale: false,
      isNew: false,
      sizes: [],
      colors: [],
      minPrice: 0,
      maxPrice: 10000,
      sortBy: 'latest',
      search: '',
    });
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters =
    (filters.gender && filters.gender !== 'all') ||
    (filters.category && filters.category !== 'all') ||
    filters.isSale ||
    filters.isNew ||
    (filters.sizes?.length > 0) ||
    (filters.colors?.length > 0) ||
    (filters.minPrice > 0) ||
    (filters.maxPrice < 10000);

  const content = (
    <div className="space-y-6 font-inter text-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/15">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-white" />
          <h3 className="text-xs font-bold text-white uppercase">
            Filter Products
          </h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-red-400 hover:text-red-300 font-bold uppercase underline underline-offset-4 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>





      {/* Categories */}
      <div>
        <h4 className="text-xs font-bold text-white uppercase mb-2.5">
          Categories
        </h4>
        <div className="space-y-1">
          {loading ? (
            [1, 2, 3, 4, 5].map((idx) => (
              <div
                key={idx}
                className="w-full h-8 bg-white/5 border border-white/5 rounded-lg animate-pulse"
              />
            ))
          ) : (
            <>
              <button
                onClick={() => handleCategoryChange('all')}
                className={`w-full flex items-center justify-between text-left text-xs py-2 px-3 rounded-lg transition-all ${
                  !filters.category || filters.category === 'all'
                    ? 'text-white bg-white/15 font-bold'
                    : 'text-gray-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>All Categories</span>
              </button>

              {categories.map((cat) => {
                const active = filters.category === cat.slug;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.slug)}
                    className={`w-full flex items-center justify-between text-left text-xs py-2 px-3 rounded-lg transition-all ${
                      active
                        ? 'text-white bg-white/15 font-bold border-l-2 border-brand-red'
                        : 'text-gray-200 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {cat.gender === 'women' && (
                      <span className="text-[10px] text-red-300 bg-brand-red/20 px-1.5 py-0.5 rounded font-bold">
                        Women
                      </span>
                    )}
                  </button>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h4 className="text-xs font-bold text-white uppercase mb-2.5">
          Size
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {sizes.map((size) => {
            const active = (filters.sizes || []).includes(size);
            return (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`min-w-[38px] h-9 px-2 text-xs font-bold rounded-lg border transition-all duration-200 ${
                  active
                    ? 'bg-white text-black border-white shadow-md'
                    : 'bg-[#141414] text-white border-white/15 hover:border-white/40'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>



      {/* Price Range */}
      <div>
        <h4 className="text-xs font-bold text-white uppercase mb-2.5">
          Price Range (₹)
        </h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min ₹"
            value={filters.minPrice || ''}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, minPrice: Number(e.target.value) || 0 }))
            }
            className="w-full bg-[#141414] border border-white/20 text-white placeholder-gray-400 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-red"
          />
          <span className="text-gray-300 font-bold">—</span>
          <input
            type="number"
            placeholder="Max ₹"
            value={filters.maxPrice === 10000 ? '' : filters.maxPrice}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) || 10000 }))
            }
            className="w-full bg-[#141414] border border-white/20 text-white placeholder-gray-400 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-red"
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <div className="hidden lg:block w-72 shrink-0 font-inter">
        <div className="sticky top-24 bg-[#0f0f0f] border border-white/15 rounded-2xl p-5 shadow-xl">
          {content}
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] lg:hidden font-inter"
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-[#0d0d0d] border-r border-white/20 overflow-y-auto p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/15">
                  <h3 className="text-sm font-bold text-white uppercase">
                    Filters & Categories
                  </h3>
                  <button
                    onClick={onClose}
                    className="p-1 text-white hover:text-gray-300"
                  >
                    <X size={22} />
                  </button>
                </div>
                {content}
              </div>

              <div className="pt-6 mt-6 border-t border-white/15 sticky bottom-0 bg-[#0d0d0d]">
                <button
                  onClick={onClose}
                  className="w-full btn-primary py-3.5 text-xs font-bold uppercase rounded-xl shadow-xl"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
