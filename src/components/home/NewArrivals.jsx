import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../ui/ProductCard';
import { useProducts } from '../../context/ProductContext';

const NewArrivals = memo(function NewArrivals() {
  const { products, loading } = useProducts();
  const activeProducts = products || [];

  // Filter New arrivals
  const allNewProducts = activeProducts.filter((p) => p.isNew);
  const displayProducts = (allNewProducts.length > 0 ? allNewProducts : activeProducts).slice(0, 8);

  return (
    <section className="py-8 md:py-16 bg-brand-black font-inter text-white">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-6 md:mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
              <span className="text-brand-red text-xs font-bold uppercase tracking-wider">
                FRESH ATELIER LOOKS
              </span>
            </div>
            <h2 className="text-xl md:text-3xl font-black text-white uppercase">
              NEW ARRIVALS
            </h2>
          </div>
          {!loading && displayProducts.length > 0 && (
            <Link
              to="/shop?new=true"
              className="flex items-center gap-1.5 text-xs font-bold text-white hover:text-red-400 transition-colors uppercase group"
            >
              <span>EXPLORE ALL ({allNewProducts.length || displayProducts.length})</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        {/* Responsive Product Cards Grid or Skeleton Loader */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 md:gap-5">
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
        ) : displayProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 md:gap-5">
            {displayProducts.map((product, i) => (
              <ProductCard key={product.id || `prod-${i}`} product={product} index={i} />
            ))}
          </div>
        ) : null}

        {/* View All Button */}
        {!loading && allNewProducts.length > displayProducts.length && (
          <div className="mt-8 md:mt-12 text-center">
            <Link
              to="/shop?new=true"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-white/10 hover:bg-brand-red border border-white/20 hover:border-brand-red text-white text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-xl group hover:scale-105"
            >
              <span>VIEW ALL {allNewProducts.length} NEW ARRIVALS</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
});

export default NewArrivals;
