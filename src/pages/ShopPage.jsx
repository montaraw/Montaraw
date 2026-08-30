import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, Grid3X3, LayoutGrid } from 'lucide-react';
import ProductCard from '../components/ui/ProductCard';
import FilterSidebar from '../components/shop/FilterSidebar';
import SortDropdown from '../components/shop/SortDropdown';
import { useProducts } from '../context/ProductContext';

export default function ShopPage() {
  const { category: urlCategory } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const queryGender = searchParams.get('gender') || 'all';
  const queryCategory = searchParams.get('category') || (urlCategory || 'all');
  const querySale = searchParams.get('sale') === 'true';
  const queryNew = searchParams.get('new') === 'true';
  const searchQuery = searchParams.get('search') || '';

  const { filterProducts, loading } = useProducts();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [gridCols, setGridCols] = useState(4);

  const [filters, setFilters] = useState({
    gender: queryGender,
    category: queryCategory,
    isSale: querySale,
    isNew: queryNew,
    sizes: [],
    colors: [],
    minPrice: 0,
    maxPrice: 10000,
    sortBy: 'latest',
    search: searchQuery,
  });

  // Sync state when URL params change
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      gender: searchParams.get('gender') || 'all',
      category: searchParams.get('category') || (urlCategory || 'all'),
      isSale: searchParams.get('sale') === 'true',
      isNew: searchParams.get('new') === 'true',
      search: searchParams.get('search') || '',
    }));
  }, [urlCategory, searchParams]);

  const filteredProducts = useMemo(() => filterProducts(filters), [filterProducts, filters]);

  // Clean, minimal title determination
  const pageTitle = useMemo(() => {
    if (searchQuery) return `SEARCH: "${searchQuery}"`;
    if (filters.isSale) return 'SALE & ARCHIVE';
    if (filters.isNew) return 'NEW ARRIVALS';
    if (urlCategory === 'dresses' || filters.category === 'dresses') return 'DRESSES & GOWNS';
    if (urlCategory === 'oversized-tshirts' || filters.category === 'oversized-tshirts') return 'OVERSIZED T-SHIRTS';
    if (urlCategory === 'hoodies' || filters.category === 'hoodies') return 'HOODIES & SWEATSHIRTS';
    if (urlCategory === 'graphic-tees' || filters.category === 'graphic-tees') return 'GRAPHIC TEES';
    if (urlCategory === 'co-ords' || filters.category === 'co-ords') return 'CO-ORD SETS';
    if (urlCategory === 'bottoms' || filters.category === 'bottoms') return 'BOTTOMS & CARGOS';
    if (urlCategory === 'accessories' || filters.category === 'accessories') return 'ACCESSORIES';
    if (filters.gender === 'women') return 'WOMEN COLLECTION';
    if (filters.gender === 'men') return 'MEN COLLECTION';
    if (urlCategory && urlCategory !== 'all') return urlCategory.replace(/-/g, ' ').toUpperCase();
    return 'ALL PRODUCTS';
  }, [filters, urlCategory, searchQuery]);

  return (
    <div className="pt-6 md:pt-10 pb-20 min-h-screen bg-brand-black font-inter text-white">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-3 flex items-center gap-2 text-xs font-inter text-gray-300">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-white transition-colors">Shop</Link>
          {filters.gender !== 'all' && (
            <>
              <span>/</span>
              <span className="text-white font-semibold capitalize">{filters.gender}</span>
            </>
          )}
          {filters.category !== 'all' && (
            <>
              <span>/</span>
              <span className="text-white font-semibold capitalize">{filters.category.replace(/-/g, ' ')}</span>
            </>
          )}
        </div>

        {/* Clean, Sleek Title Header */}
        <div className="mb-6 md:mb-8 pb-4 border-b border-white/15 flex flex-col md:flex-row md:items-end justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase leading-tight">
              {pageTitle}
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 font-inter mt-1">
              Showing <strong className="text-white">{filteredProducts.length}</strong> piece{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Layout with Sidebar & Product Grid */}
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            isOpen={filtersOpen}
            onClose={() => setFiltersOpen(false)}
          />

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/15">
              <div className="flex items-center gap-3">
                {/* Mobile Filter Trigger Button */}
                <button
                  onClick={() => setFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 text-xs font-bold uppercase text-white bg-[#1a1a1a] border border-white/20 px-4 py-2.5 rounded-xl transition-all"
                >
                  <SlidersHorizontal size={14} />
                  Filters
                </button>
                {loading ? (
                  <div className="h-4 w-24 bg-white/15 rounded animate-pulse" />
                ) : (
                  <span className="text-xs md:text-sm text-gray-300 font-inter">
                    <strong className="text-white">{filteredProducts.length}</strong> items found
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Grid Density Switcher (Desktop) */}
                <div className="hidden md:flex items-center bg-[#151515] border border-white/15 rounded-lg p-0.5">
                  <button
                    onClick={() => setGridCols(3)}
                    className={`p-1.5 rounded transition-colors ${gridCols === 3 ? 'text-white bg-white/20' : 'text-gray-400 hover:text-white'}`}
                    title="3 Columns"
                  >
                    <Grid3X3 size={16} />
                  </button>
                  <button
                    onClick={() => setGridCols(4)}
                    className={`p-1.5 rounded transition-colors ${gridCols === 4 ? 'text-white bg-white/20' : 'text-gray-400 hover:text-white'}`}
                    title="4 Columns"
                  >
                    <LayoutGrid size={16} />
                  </button>
                </div>

                <SortDropdown
                  value={filters.sortBy}
                  onChange={(val) => setFilters((prev) => ({ ...prev, sortBy: val }))}
                />
              </div>
            </div>

            {/* Product Grid / Skeleton Loading */}
            {loading ? (
              <div
                className={`grid grid-cols-2 gap-3 md:gap-5 ${
                  gridCols === 3
                    ? 'sm:grid-cols-2 md:grid-cols-3'
                    : 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                }`}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl bg-[#141414] border border-white/10 p-3 flex flex-col gap-3 animate-pulse"
                  >
                    <div className="aspect-[3/4] w-full rounded-xl bg-[#1c1c1c]" />
                    <div className="space-y-2 px-1">
                      <div className="h-3 w-16 bg-white/15 rounded" />
                      <div className="h-4 w-3/4 bg-white/10 rounded" />
                      <div className="h-4 w-24 bg-white/20 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div
                className={`grid grid-cols-2 gap-3 md:gap-5 ${
                  gridCols === 3
                    ? 'sm:grid-cols-2 md:grid-cols-3'
                    : 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                }`}
              >
                {filteredProducts.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 px-4 bg-[#121212] border border-white/15 rounded-2xl">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <SlidersHorizontal size={20} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1 uppercase">
                  No Matching Pieces Found
                </h3>
                <p className="text-xs text-gray-300 font-inter max-w-md mx-auto mb-5">
                  Try adjusting your selected filters or exploring other categories.
                </p>
                <button
                  onClick={() => {
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
                  }}
                  className="btn-primary py-2.5 px-6 text-xs font-bold uppercase rounded-xl"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
