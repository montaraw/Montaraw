import { Heart, ShoppingBag, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

export default function ProductCard({ product, index = 0 }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [quickAdded, setQuickAdded] = useState(false);
  const wishlisted = isInWishlist(product.id);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const size = product.sizes?.[0] || 'M';
    const color = product.colors?.[0] || '#000000';
    addToCart(product, size, color, 1);
    setQuickAdded(true);
    setTimeout(() => setQuickAdded(false), 2000);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="group font-inter"
    >
      <Link to={`/product/${product.id}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-[3/4] bg-[#141414] rounded-2xl overflow-hidden mb-3 border border-white/15 group-hover:border-white/40 transition-all duration-300 shadow-lg">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Badges Overlay */}
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
            {product.isNew && (
              <span className="text-[10px] font-bold uppercase bg-brand-red text-white px-2 py-0.5 rounded-md shadow-md">
                New
              </span>
            )}
            {discountPercent > 0 && (
              <span className="text-[10px] font-bold uppercase bg-black/90 backdrop-blur-md text-green-400 border border-green-500/40 px-2 py-0.5 rounded-md shadow-md">
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* Floating Heart Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center bg-black/60 backdrop-blur-md border border-white/20 hover:bg-black hover:scale-110 transition-all duration-300"
            aria-label="Toggle wishlist"
          >
            <Heart
              size={15}
              className={`transition-colors duration-300 ${
                wishlisted ? 'fill-brand-red text-brand-red' : 'text-white'
              }`}
            />
          </button>

          {/* Quick Add Overlay Button */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-10">
            <button
              onClick={handleQuickAdd}
              className={`w-full font-bold text-[11px] uppercase py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xl ${
                quickAdded
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-black hover:bg-gray-200'
              }`}
            >
              {quickAdded ? (
                <>
                  <Check size={14} />
                  Added!
                </>
              ) : (
                <>
                  <ShoppingBag size={14} />
                  Quick Add
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info Below Image */}
        <div className="px-1 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-gray-300 uppercase">
            <span className="font-semibold text-gray-300">
              {product.gender || 'Unisex'} • {typeof product.category === 'object' && product.category?.name ? product.category.name : (typeof product.category === 'string' ? product.category.replace(/-/g, ' ') : (product.categorySlug?.replace(/-/g, ' ') || 'Collection'))}
            </span>
          </div>

          <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1 group-hover:text-brand-red transition-colors">
            {product.name}
          </h3>

          <div className="flex items-baseline gap-2 pt-0.5">
            <p className="text-xs sm:text-sm font-black text-white">
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
    </motion.div>
  );
}
