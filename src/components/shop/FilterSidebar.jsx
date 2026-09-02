import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { X, SlidersHorizontal, Sparkles, Flame, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '../../context/ProductContext';

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '30', '32', '34', '36', 'One Size'];

const womenSubcategories = [
  { label: 'Pakistani Suits', slug: 'pakistani-suits' },
  { label: 'Suits', slug: 'suits' },
  { label: 'Cord Set', slug: 'cord-set' },
];

export default function FilterSidebar({ filters, setFilters, isOpen, onClose }) {
  const { loading } = useProducts();
  const [, setSearchParams] = useSearchParams();
  const [womenOpen, setWomenOpen] = useState(true);

  // Auto-open women accordion if a women subcategory or women gender is active
  useEffect(() => {
    if (
      filters.gender === 'women' ||
      womenSubcategories.some((s) => s.slug === filters.category)
    ) {
      setWomenOpen(true);
    }
  }, [filters.gender, filters.category]);

  const handleAllCollections = () => {
    setFilters((prev) => ({
      ...prev,
      gender: 'all',
      category: 'all',
      isSale: false,
      isNew: false,
    }));
    const params = new URLSearchParams(window.location.search);
    params.delete('gender');
    params.delete('category');
    params.delete('sale');
    params.delete('new');
    setSearchParams(params);
  };

  const handleGenderChange = (gender) => {
    setFilters((prev) => ({
      ...prev,
      gender,
      category: 'all',
      isSale: false,
      isNew: false,
    }));
    const params = new URLSearchParams(window.location.search);
    if (gender !== 'all') {
      params.set('gender', gender);
    } else {
      params.delete('gender');
    }
    params.delete('category');
    params.delete('sale');
    params.delete('new');
    setSearchParams(params);
  };

  const handleCategoryChange = (slug, gender = 'women') => {
    setFilters((prev) => ({
      ...prev,
      category: slug,
      gender: slug === 'all' ? 'all' : gender,
      isSale: false,
      isNew: false,
    }));
    const params = new URLSearchParams(window.location.search);
    if (slug !== 'all') {
      params.set('category', slug);
      if (gender) params.set('gender', gender);
    } else {
      params.delete('category');
      params.delete('gender');
    }
    params.delete('sale');
    params.delete('new');
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

  const toggleSale = () => {
    setFilters((prev) => {
      const nextSale = !prev.isSale;
      const params = new URLSearchParams(window.location.search);
      if (nextSale) {
        params.set('sale', 'true');
        params.delete('new');
      } else {
        params.delete('sale');
      }
      setSearchParams(params);
      return { ...prev, isSale: nextSale, isNew: nextSale ? false : prev.isNew };
    });
  };

  const toggleNewArrivals = () => {
    setFilters((prev) => {
      const nextNew = !prev.isNew;
      const params = new URLSearchParams(window.location.search);
      if (nextNew) {
        params.set('new', 'true');
        params.delete('sale');
      } else {
        params.delete('new');
      }
      setSearchParams(params);
      return { ...prev, isNew: nextNew, isSale: nextNew ? false : prev.isSale };
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

  const isAllActive =
    (!filters.category || filters.category === 'all') &&
    (!filters.gender || filters.gender === 'all') &&
    !filters.isNew &&
    !filters.isSale;

  const isWomenAllActive =
    filters.gender === 'women' &&
    (!filters.category || filters.category === 'all') &&
    !filters.isNew &&
    !filters.isSale;

  const isMenActive =
    filters.gender === 'men' &&
    (!filters.category || filters.category === 'all') &&
    !filters.isNew &&
    !filters.isSale;

  const hasActiveFilters =
    !isAllActive ||
    (filters.sizes?.length > 0) ||
    (filters.minPrice > 0) ||
    (filters.maxPrice < 10000);

  const content = (
    <div className="space-y-6 font-inter text-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/15">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-white" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Filters & Collections
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

      {/* Primary Category & Subcategory Navigation */}
      <div>
        <h4 className="text-xs font-bold text-gray-300 uppercase mb-3 flex items-center justify-between">
          <span>Categories & Lines</span>
        </h4>

        <div className="space-y-1.5">
          {/* 1. All Collections */}
          <button
            onClick={handleAllCollections}
            className={`w-full flex items-center justify-between text-left text-xs py-2.5 px-3 rounded-xl transition-all ${
              isAllActive
                ? 'text-white bg-brand-red font-bold shadow-lg ring-1 ring-white/20'
                : 'text-gray-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>All Collections</span>
            {isAllActive && <Check size={14} className="text-white shrink-0" />}
          </button>

          {/* 2. WOMEN Group with Subcategories */}
          <div className="rounded-xl border border-white/10 overflow-hidden bg-white/[0.02]">
            <div className="flex items-center justify-between bg-white/5">
              <button
                onClick={() => handleGenderChange('women')}
                className={`flex-1 flex items-center justify-between text-left text-xs py-2.5 px-3 font-bold transition-all ${
                  isWomenAllActive
                    ? 'text-white bg-brand-red shadow-md'
                    : 'text-white hover:text-brand-red'
                }`}
              >
                <span>WOMEN (ALL)</span>
                {isWomenAllActive && <Check size={14} className="text-white shrink-0" />}
              </button>

              <button
                onClick={() => setWomenOpen(!womenOpen)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                aria-label="Toggle subcategories"
              >
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    womenOpen ? 'rotate-180 text-brand-red' : ''
                  }`}
                />
              </button>
            </div>

            {/* Women Subcategories (Pakistani Suits, Suits, Cord Set) */}
            <AnimatePresence>
              {womenOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-black/60 py-1.5 px-2 space-y-1 border-t border-white/5"
                >
                  {womenSubcategories.map((sub) => {
                    const isSubActive = filters.category === sub.slug;
                    return (
                      <button
                        key={sub.slug}
                        onClick={() => handleCategoryChange(sub.slug, 'women')}
                        className={`w-full flex items-center justify-between text-left text-xs py-2 px-2.5 rounded-lg transition-all ${
                          isSubActive
                            ? 'text-white bg-brand-red font-bold shadow-md ring-1 ring-white/30'
                            : 'text-gray-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span>• {sub.label}</span>
                        {isSubActive && <Check size={13} className="text-white shrink-0" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3. MEN Category */}
          <button
            onClick={() => handleGenderChange('men')}
            className={`w-full flex items-center justify-between text-left text-xs py-2.5 px-3 rounded-xl transition-all ${
              isMenActive
                ? 'text-white bg-blue-600 font-bold shadow-lg ring-1 ring-white/20'
                : 'text-gray-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>MEN (ALL)</span>
            {isMenActive && <Check size={14} className="text-white shrink-0" />}
          </button>

          {/* 4. NEW ARRIVALS */}
          <button
            onClick={toggleNewArrivals}
            className={`w-full flex items-center justify-between text-left text-xs py-2.5 px-3 rounded-xl transition-all ${
              filters.isNew
                ? 'text-white bg-brand-red font-bold shadow-lg ring-1 ring-white/20'
                : 'text-gray-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles size={13} className={filters.isNew ? 'text-white' : 'text-brand-red'} />
              <span>New Arrivals '25</span>
            </div>
            {filters.isNew && <Check size={14} className="text-white shrink-0" />}
          </button>

          {/* 5. SALE & ARCHIVE */}
          <button
            onClick={toggleSale}
            className={`w-full flex items-center justify-between text-left text-xs py-2.5 px-3 rounded-xl transition-all ${
              filters.isSale
                ? 'text-white bg-brand-red font-bold shadow-lg ring-1 ring-white/20'
                : 'text-red-400 hover:text-red-300 hover:bg-brand-red/10'
            }`}
          >
            <div className="flex items-center gap-2">
              <Flame size={13} className={filters.isSale ? 'text-white' : 'text-brand-red'} />
              <span>Archive Sale</span>
            </div>
            {filters.isSale && <Check size={14} className="text-white shrink-0" />}
          </button>
        </div>
      </div>

      {/* Sizes Filter */}
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
                className={`min-w-[38px] h-9 px-2 text-xs font-bold rounded-lg border transition-all duration-200 flex items-center justify-center gap-1 ${
                  active
                    ? 'bg-brand-red text-white border-brand-red shadow-md ring-1 ring-white/20'
                    : 'bg-[#141414] text-white border-white/15 hover:border-white/40'
                }`}
              >
                <span>{size}</span>
                {active && <Check size={10} className="text-white" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Filter */}
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
            className="w-full bg-[#141414] border border-white/20 text-white placeholder-gray-400 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-red font-medium"
          />
          <span className="text-gray-300 font-bold">—</span>
          <input
            type="number"
            placeholder="Max ₹"
            value={filters.maxPrice === 10000 ? '' : filters.maxPrice}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) || 10000 }))
            }
            className="w-full bg-[#141414] border border-white/20 text-white placeholder-gray-400 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-red font-medium"
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
              className="absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-[#0d0d0d] border-r border-white/20 overflow-y-auto p-6 flex flex-col justify-between shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/15">
                  <h3 className="text-sm font-bold text-white uppercase">
                    Filters & Collections
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
                  className="w-full btn-primary py-3.5 text-xs font-bold uppercase rounded-xl shadow-xl flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  <span>Apply Filters</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
