import { Link } from 'react-router-dom';
import { ArrowRight, Heart } from 'lucide-react';
import ProductCard from '../ui/ProductCard';
import { useProducts } from '../../context/ProductContext';
import { useWishlist } from '../../context/WishlistContext';

export default function NewArrivals() {
  const { products } = useProducts();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Pick top 5 newest arrivals (both women dresses and men drops)
  const displayProducts = products.filter((p) => p.isNew).slice(0, 5);

  if (!displayProducts.length) return null;

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
