import { Link } from 'react-router-dom';
import { ArrowRight, Heart } from 'lucide-react';
import ProductCard from '../ui/ProductCard';
import { useProducts } from '../../context/ProductContext';
import { useWishlist } from '../../context/WishlistContext';

export default function NewArrivals() {
  const { products, loading } = useProducts();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Pick top 5 newest arrivals (both women dresses and men drops)
  const displayProducts = products.filter((p) => p.isNew).slice(0, 5);

  if (loading || !displayProducts.length) {
    return (
      <section className="py-8 md:py-16 bg-brand-black font-inter text-white">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          {/* Skeleton Header */}
          <div className="flex items-end justify-between mb-6 md:mb-10">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
                <span className="text-brand-red text-xs font-bold uppercase tracking-wider">
                  FRESH ATELIER LOOKS
                </span>
                <span className="text-[10px] text-gray-400 font-medium hidden sm:inline">
                  • Syncing Latest Drops...
                </span>
              </div>
              <div className="h-7 md:h-9 w-44 md:w-64 bg-white/10 rounded-lg animate-pulse" />
            </div>
            <div className="h-4 w-28 bg-white/10 rounded animate-pulse" />
          </div>

          {/* Mobile Skeleton: List Cards */}
          <div className="block md:hidden space-y-3">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="flex items-center gap-3.5 p-2.5 rounded-2xl bg-[#141414] border border-white/10 animate-pulse"
              >
                <div className="w-18 h-20 rounded-xl bg-[#1a1a1a] shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="w-12 h-3 bg-white/15 rounded" />
                  <div className="w-3/4 h-3.5 bg-white/10 rounded" />
                  <div className="w-20 h-4 bg-white/15 rounded" />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Skeleton: 5 Product Cards */}
          <div className="hidden md:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((idx) => (
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
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 md:py-16 bg-brand-black font-inter text-white">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-6 md:mb-10">
          <div>
            <span className="text-brand-red text-xs font-bold uppercase block mb-1">
              FRESH ATELIER LOOKS
            </span>
            <h2 className="text-xl md:text-3xl font-black text-white uppercase">
              NEW ARRIVALS
            </h2>
          </div>
          <Link
            to="/shop?new=true"
            className="flex items-center gap-1.5 text-xs font-bold text-white hover:text-red-400 transition-colors uppercase group"
          >
            <span>EXPLORE ALL NEW</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Mobile View: Vertical Product List Rows */}
        <div className="block md:hidden space-y-3">
          {displayProducts.map((product) => {
            const wishlisted = isInWishlist(product.id);
            return (
              <div
                key={product.id}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-[#141414] border border-white/15 shadow-md"
              >
                <Link to={`/product/${product.id}`} className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className="w-18 h-20 rounded-xl overflow-hidden bg-[#1a1a1a] shrink-0 border border-white/15">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {product.gender === 'women' && (
                        <span className="text-[10px] font-bold text-brand-red uppercase">Women</span>
                      )}
                      {product.gender === 'men' && (
                        <span className="text-[10px] font-bold text-blue-400 uppercase">Men</span>
                      )}
                    </div>
                    <h3 className="text-xs font-bold text-white line-clamp-1">
                      {product.name}
                    </h3>
                    <div className="flex items-baseline gap-2 mt-1">
                      <p className="text-sm font-black text-white">
                        ₹{product.price.toLocaleString()}
                      </p>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <p className="text-xs text-gray-400 line-through">
                          ₹{product.originalPrice.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Wishlist Heart Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleWishlist(product);
                  }}
                  className="p-3 text-white hover:text-brand-red shrink-0"
                  aria-label="Wishlist"
                >
                  <Heart
                    size={18}
                    className={wishlisted ? 'fill-brand-red text-brand-red' : ''}
                  />
                </button>
              </div>
            );
          })}
        </div>

        {/* Desktop View: Grid */}
        <div className="hidden md:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {displayProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
