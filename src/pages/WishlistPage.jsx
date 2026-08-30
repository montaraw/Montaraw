import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import ProductCard from '../components/ui/ProductCard';
import { useWishlist } from '../context/WishlistContext';

export default function WishlistPage() {
  const { wishlist, clearWishlist } = useWishlist();

  return (
    <div className="pt-8 md:pt-12 pb-20 min-h-screen bg-brand-black font-inter text-white">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 md:mb-10 pb-4 border-b border-white/15">
          <div>
            <span className="text-brand-red text-xs font-bold uppercase block mb-1">
              SAVED PIECES
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white uppercase leading-tight">
              MY WISHLIST ({wishlist.length})
            </h1>
          </div>

          {wishlist.length > 0 && (
            <button
              onClick={clearWishlist}
              className="flex items-center gap-1.5 text-xs text-gray-200 hover:text-brand-red transition-colors px-3 py-1.5 rounded-lg border border-white/20 hover:border-brand-red/40 font-semibold"
            >
              <Trash2 size={14} />
              Clear Wishlist
            </button>
          )}
        </div>

        {/* Grid */}
        {wishlist.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {wishlist.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 px-4 max-w-md mx-auto bg-[#121212] border border-white/15 rounded-3xl"
          >
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-white/20 rounded-full bg-white/10 text-white">
              <Heart size={28} />
            </div>
            <h2 className="text-lg font-bold text-white mb-1 uppercase">
              Your Wishlist is Empty
            </h2>
            <p className="text-xs text-gray-300 mb-6">
              Save your favorite dresses, oversized fits, and couture pieces here to buy later.
            </p>
            <Link
              to="/shop"
              className="btn-primary py-3 px-6 text-xs font-bold uppercase rounded-xl inline-flex items-center gap-2 shadow-xl"
            >
              <ShoppingBag size={14} />
              <span>Explore Lookbook</span>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
