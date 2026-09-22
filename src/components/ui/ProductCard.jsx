import { memo, useState, useCallback, useEffect, useRef } from 'react';
import { Heart, ShoppingBag, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { getOptimizedImageUrl } from '../../utils/imageOptimizer';

const ProductCard = memo(function ProductCard({ product }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [quickAdded, setQuickAdded] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const touchStartX = useRef(null);
  const wishlisted = isInWishlist(product.id);

  // Clean list of image URLs (filtering out any non-image media)
  const imageList = (
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [product.image]
  ).filter((img) => img && typeof img === 'string' && !img.match(/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i) && !img.includes('youtube.com') && !img.includes('youtu.be') && !img.includes('vimeo.com'));

  const finalImages = imageList.length > 0 ? imageList : [product.image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80'];
  const activeImage = finalImages[activeMediaIndex] || finalImages[0];

  // Continuous auto-sliding for product card images
  useEffect(() => {
    if (finalImages.length <= 1) return;

    const interval = setInterval(() => {
      setActiveMediaIndex((prev) => (prev + 1) % finalImages.length);
    }, 3200);

    return () => clearInterval(interval);
  }, [finalImages.length]);

  const handlePrevMedia = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setActiveMediaIndex((prev) => (prev - 1 + finalImages.length) % finalImages.length);
    },
    [finalImages.length]
  );

  const handleNextMedia = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setActiveMediaIndex((prev) => (prev + 1) % finalImages.length);
    },
    [finalImages.length]
  );

  // Touch swipe support for mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 35) {
      if (diff > 0) {
        // swipe left -> next
        setActiveMediaIndex((prev) => (prev + 1) % finalImages.length);
      } else {
        // swipe right -> prev
        setActiveMediaIndex((prev) => (prev - 1 + finalImages.length) % finalImages.length);
      }
    }
    touchStartX.current = null;
  };

  const handleQuickAdd = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      const size = product.sizes?.[0] || 'M';
      const color = product.colors?.[0] || '#000000';
      addToCart(product, size, color, 1);
      setQuickAdded(true);
      setTimeout(() => setQuickAdded(false), 2000);
    },
    [addToCart, product]
  );

  const handleWishlistToggle = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleWishlist(product);
    },
    [toggleWishlist, product]
  );

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  return (
    <div
      className="group font-inter w-full min-w-0 transition-transform duration-300 select-none"
    >
      <Link to={`/product/${product.id}`} className="block w-full min-w-0">
        {/* Interactive Image Carousel Container with Fixed 3:4 Aspect Ratio (Zero CLS) */}
        <div
          className="relative aspect-[3/4] bg-[#141414] rounded-2xl overflow-hidden mb-3 border border-white/15 group-hover:border-white/40 transition-all duration-300 shadow-lg"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Active Product Image */}
          <img
            key={activeImage}
            src={getOptimizedImageUrl(activeImage, { width: 600, quality: 80 })}
            alt={product.name || 'Montaraw Product'}
            width="300"
            height="400"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80';
            }}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Badges Overlay */}
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 pointer-events-none">
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
            type="button"
            onClick={handleWishlistToggle}
            className="absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full flex items-center justify-center bg-black/60 backdrop-blur-md border border-white/20 hover:bg-black hover:scale-110 transition-all duration-300"
            aria-label="Toggle wishlist"
          >
            <Heart
              size={15}
              className={`transition-colors duration-300 ${
                wishlisted ? 'fill-brand-red text-brand-red' : 'text-white'
              }`}
            />
          </button>

          {/* Media Slider Left / Right Navigation Chevrons */}
          {finalImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevMedia}
                className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-md border border-white/20"
                aria-label="Previous preview"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={handleNextMedia}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-md border border-white/20"
                aria-label="Next preview"
              >
                <ChevronRight size={16} />
              </button>

              {/* Bottom Dash Progress Indicators */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center gap-1 z-10 pointer-events-none">
                {finalImages.map((m, idx) => (
                  <span
                    key={idx}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      idx === activeMediaIndex
                        ? 'w-4 bg-brand-red shadow-sm'
                        : 'w-1 bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Quick Add Overlay Button */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-20">
            <button
              type="button"
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
              {product.gender || 'Women'} •{' '}
              {typeof product.category === 'object' && product.category?.name
                ? product.category.name
                : typeof product.category === 'string'
                ? product.category.replace(/-/g, ' ')
                : product.categorySlug?.replace(/-/g, ' ') || 'Collection'}
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
    </div>
  );
});

export default ProductCard;
