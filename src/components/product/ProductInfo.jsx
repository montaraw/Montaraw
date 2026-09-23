import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Zap, Star, Truck, RotateCcw, Shield, Check, Ruler, X, MapPin, Loader2, Flame, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { lookupPincode } from '../../utils/pincodeService';

export default function ProductInfo({ product }) {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || 'M');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [pincode, setPincode] = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState(null);

  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const wishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, product.colors?.[selectedColorIndex] || '#000000', quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2200);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, product.colors?.[selectedColorIndex] || '#000000', quantity);
    navigate('/cart?checkout=true');
  };

  const handleCheckPincode = async (e) => {
    e.preventDefault();
    const clean = pincode.replace(/\D/g, '').trim();
    if (clean.length !== 6) {
      setPincodeStatus({
        valid: false,
        message: 'Please enter a valid 6-digit Indian PIN code.',
      });
      return;
    }

    setPincodeLoading(true);
    setPincodeStatus(null);
    try {
      const result = await lookupPincode(clean);
      if (result.success) {
        setPincodeStatus({
          valid: true,
          message: `Delivery available to ${result.city}, ${result.state} in 2-3 business days. COD eligible.`,
        });
      } else {
        setPincodeStatus({
          valid: false,
          message: result.error || 'Invalid PIN code. Please enter a valid Indian postal code.',
        });
      }
    } catch {
      setPincodeStatus({
        valid: false,
        message: 'Unable to check delivery for this PIN code right now.',
      });
    } finally {
      setPincodeLoading(false);
    }
  };

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const stockCount = typeof product.stock === 'number' ? product.stock : (parseInt(product.stock) || 0);
  const isOutOfStock = stockCount <= 0;
  const isLowStock = stockCount > 0 && stockCount <= 10;

  return (
    <div className="space-y-6 font-inter text-white">
      {/* Category / Gender & Badges */}
      <div className="flex flex-wrap items-center gap-2">
        {product.gender && (
          <span className="text-xs uppercase bg-white/15 text-white px-3 py-1 rounded-full border border-white/20 font-bold">
            {product.gender === 'women' ? "Women's Collection" : product.gender === 'men' ? "Men's Streetwear" : 'Unisex Piece'}
          </span>
        )}
        {product.isNew && (
          <span className="text-xs uppercase bg-brand-red text-white px-3 py-1 rounded-full font-bold">
            New Drop
          </span>
        )}
        {discountPercent > 0 && (
          <span className="text-xs uppercase bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full font-bold">
            Save {discountPercent}%
          </span>
        )}
      </div>

      {/* Product Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white uppercase leading-tight">
          {product.name}
        </h1>
        <p className="text-xs text-gray-300 font-mono mt-1">
          SKU: MTR-{product.id?.toUpperCase()}
        </p>
      </div>

      {/* Reviews & Star Rating */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-yellow-400/20 px-2.5 py-1 rounded-lg border border-yellow-400/40">
          <Star size={13} className="fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-bold text-yellow-300">
            {product.rating || 4.8}
          </span>
        </div>
        <span className="text-xs text-gray-200">
          Based on {product.reviews || 42} verified customer ratings
        </span>
      </div>

      {/* Price Block */}
      <div className="flex items-baseline gap-3 pt-1">
        <span className="text-3xl sm:text-4xl font-black text-white">
          ₹{product.price.toLocaleString()}
        </span>
        {product.originalPrice && product.originalPrice > product.price && (
          <span className="text-base sm:text-lg text-gray-400 line-through">
            ₹{product.originalPrice.toLocaleString()}
          </span>
        )}
        {discountPercent > 0 && (
          <span className="text-xs text-green-400 font-bold bg-green-400/20 border border-green-400/30 px-2 py-0.5 rounded">
            ₹{(product.originalPrice - product.price).toLocaleString()} Off
          </span>
        )}
      </div>
      <p className="text-xs text-gray-300 -mt-3">
        Inclusive of all GST taxes & free shipping on orders above ₹999
      </p>

      {/* Live Inventory & Urgency Indicator */}
      {isLowStock ? (
        <div className="p-3.5 bg-red-950/50 border border-red-500/50 rounded-2xl flex items-center justify-between gap-3 text-xs text-red-200 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-brand-red text-white shrink-0 shadow-lg">
              <Flame size={18} className="animate-pulse" />
            </span>
            <div>
              <span className="font-black text-white uppercase text-[11px] block tracking-wide">
                Hurry up! High Demand Piece
              </span>
              <span className="text-red-200 text-xs">
                Only <strong className="text-white font-black underline decoration-brand-red text-sm">{stockCount} {stockCount === 1 ? 'item' : 'items'} left</strong> in stock. Order now before it runs out!
              </span>
            </div>
          </div>
          <span className="shrink-0 flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </div>
      ) : isOutOfStock ? (
        <div className="p-3.5 bg-[#181818] border border-red-500/30 rounded-2xl flex items-center gap-3 text-xs text-gray-300">
          <AlertCircle size={18} className="text-red-400 shrink-0" />
          <div>
            <span className="font-bold text-white uppercase block text-xs">Currently Sold Out</span>
            <span className="text-gray-400">This atelier piece is out of stock. Next curation batch coming soon.</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-950/30 border border-emerald-800/30 px-3 py-1.5 rounded-xl w-fit">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>In Stock ({stockCount} Units) • Express Atelier Dispatch</span>
        </div>
      )}

      {/* Short Description */}
      <div className="p-4 bg-[#141414] border border-white/15 rounded-2xl">
        <p className="text-xs sm:text-sm text-gray-100 leading-relaxed">
          {product.description}
        </p>
        {(product.fabric || product.fit) && (
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10 text-xs">
            {product.fabric && (
              <div>
                <span className="text-gray-300 block text-[10px] uppercase font-bold">Fabric & GSM:</span>
                <span className="text-white font-medium">{product.fabric}</span>
              </div>
            )}
            {product.fit && (
              <div>
                <span className="text-gray-300 block text-[10px] uppercase font-bold">Fit / Cut:</span>
                <span className="text-white font-medium">{product.fit}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Color Selector */}
      {product.colors && product.colors.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white uppercase">
              Color — <span className="text-gray-200 font-semibold">{product.colorNames?.[selectedColorIndex] || 'Selected'}</span>
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            {product.colors.map((color, i) => (
              <button
                key={i}
                onClick={() => setSelectedColorIndex(i)}
                className={`w-9 h-9 rounded-full border-2 transition-all duration-200 ${
                  i === selectedColorIndex
                    ? 'border-white scale-110 shadow-lg ring-2 ring-white/30'
                    : 'border-white/30 hover:border-white'
                }`}
                style={{ backgroundColor: color }}
                title={product.colorNames?.[i] || color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Size Selector */}
      {product.sizes && product.sizes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white uppercase">
              Select Size — <span className="text-gray-200 font-semibold">{selectedSize}</span>
            </span>
            <button
              onClick={() => setSizeGuideOpen(true)}
              className="text-xs text-white hover:text-brand-red inline-flex items-center gap-1 underline underline-offset-4 transition-colors font-bold"
            >
              <Ruler size={13} />
              Size Guide
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`min-w-[48px] h-11 px-3 text-xs font-black rounded-xl border transition-all duration-200 ${
                  selectedSize === size
                    ? 'bg-white text-black border-white shadow-lg'
                    : 'bg-[#141414] text-white border-white/20 hover:border-white/50'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity Picker & Action Buttons */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-3">
          {/* Quantity Selector */}
          <div className="flex items-center bg-[#141414] border border-white/20 rounded-xl overflow-hidden shrink-0">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={isOutOfStock}
              className="px-3.5 py-3 text-white hover:bg-white/10 transition-colors text-sm font-bold disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="px-3 text-sm font-black text-white min-w-[28px] text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => Math.min(stockCount || 10, q + 1))}
              disabled={isOutOfStock || quantity >= stockCount}
              className="px-3.5 py-3 text-white hover:bg-white/10 transition-colors text-sm font-bold disabled:opacity-40"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex-1 py-3.5 px-4 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all shadow-lg ${
              isOutOfStock
                ? 'bg-white/10 text-gray-400 border border-white/10 cursor-not-allowed'
                : addedToCart
                ? 'bg-green-500 text-white font-bold'
                : 'bg-white text-black hover:bg-gray-200'
            }`}
          >
            {isOutOfStock ? (
              <>
                <AlertCircle size={16} />
                Out Of Stock
              </>
            ) : addedToCart ? (
              <>
                <Check size={16} />
                Added To Bag!
              </>
            ) : (
              <>
                <ShoppingBag size={16} />
                Add To Bag
              </>
            )}
          </button>

          {/* Wishlist Button */}
          <button
            onClick={() => toggleWishlist(product)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all shrink-0 ${
              wishlisted
                ? 'bg-brand-red/20 border-brand-red text-brand-red'
                : 'border-white/20 bg-[#141414] text-white hover:border-white/50'
            }`}
            title="Wishlist"
          >
            <Heart size={18} className={wishlisted ? 'fill-current' : ''} />
          </button>
        </div>

        {/* Buy Now (Direct Fast Checkout) */}
        <button
          onClick={handleBuyNow}
          disabled={isOutOfStock}
          className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2 shadow-xl ${
            isOutOfStock
              ? 'bg-white/10 text-gray-400 border border-white/10 cursor-not-allowed'
              : 'btn-red'
          }`}
        >
          {isOutOfStock ? (
            <>
              <AlertCircle size={16} />
              Piece Sold Out
            </>
          ) : (
            <>
              <Zap size={16} />
              Instant Buy Now
            </>
          )}
        </button>
      </div>

      {/* Pincode Estimator */}
      <div className="p-4 bg-[#121212] border border-white/15 rounded-2xl space-y-2.5">
        <span className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
          <MapPin size={14} className="text-brand-red" />
          Check Delivery Timeline & COD
        </span>
        <form onSubmit={handleCheckPincode} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter 6-digit PIN Code"
            value={pincode}
            maxLength={6}
            onChange={(e) => {
              setPincode(e.target.value);
              setPincodeStatus(null);
            }}
            className="flex-1 bg-[#1a1a1a] border border-white/20 text-white placeholder-gray-400 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-brand-red font-medium"
          />
          <button
            type="submit"
            disabled={pincodeLoading}
            className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold uppercase rounded-xl transition-colors shrink-0 disabled:opacity-50 flex items-center gap-1.5"
          >
            {pincodeLoading ? <Loader2 size={13} className="animate-spin" /> : null}
            <span>{pincodeLoading ? 'Checking...' : 'Check'}</span>
          </button>
        </form>
        {pincodeStatus && (
          <p
            className={`text-xs mt-1 font-semibold ${
              pincodeStatus.valid ? 'text-green-400' : 'text-brand-red'
            }`}
          >
            {pincodeStatus.message}
          </p>
        )}
      </div>

      {/* Brand Guarantees */}
      <div className="grid grid-cols-3 gap-2.5 pt-2">
        <div className="p-3 bg-[#121212] border border-white/10 rounded-xl text-center flex flex-col items-center gap-1">
          <Truck size={16} className="text-white" />
          <span className="text-[10px] font-bold text-white uppercase">Free Shipping</span>
          <span className="text-[10px] text-gray-300 font-medium">On prepaid orders</span>
        </div>
        <div className="p-3 bg-[#121212] border border-white/10 rounded-xl text-center flex flex-col items-center gap-1">
          <RotateCcw size={16} className="text-white" />
          <span className="text-[10px] font-bold text-white uppercase">7 Days Returns</span>
          <span className="text-[10px] text-gray-300 font-medium">Hassle-free pickups</span>
        </div>
        <div className="p-3 bg-[#121212] border border-white/10 rounded-xl text-center flex flex-col items-center gap-1">
          <Shield size={16} className="text-white" />
          <span className="text-[10px] font-bold text-white uppercase">100% Authentic</span>
          <span className="text-[10px] text-gray-300 font-medium">Single brand quality</span>
        </div>
      </div>

      {/* Size Guide Modal */}
      <AnimatePresence>
        {sizeGuideOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#141414] border border-white/20 rounded-2xl max-w-lg w-full p-6 relative overflow-hidden shadow-2xl"
            >
              <button
                onClick={() => setSizeGuideOpen(false)}
                className="absolute top-4 right-4 text-white hover:text-gray-300 p-1"
              >
                <X size={20} />
              </button>
              <h3 className="text-base font-bold text-white uppercase mb-1">
                Montaraw Size Chart (Inches)
              </h3>
              <p className="text-xs text-gray-300 mb-4">
                Tailored for relaxed streetwear & sculpted party silhouettes.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-white/15 text-gray-300 uppercase">
                      <th className="py-2.5 px-3">Size</th>
                      <th className="py-2.5 px-3">Chest / Bust</th>
                      <th className="py-2.5 px-3">Waist</th>
                      <th className="py-2.5 px-3">Length</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-white">
                    <tr>
                      <td className="py-2 px-3 font-bold text-white">XS</td>
                      <td className="py-2 px-3 font-medium">32 - 34"</td>
                      <td className="py-2 px-3 font-medium">24 - 26"</td>
                      <td className="py-2 px-3 font-medium">27"</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-white">S</td>
                      <td className="py-2 px-3 font-medium">36 - 38"</td>
                      <td className="py-2 px-3 font-medium">28 - 30"</td>
                      <td className="py-2 px-3 font-medium">28"</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-white">M</td>
                      <td className="py-2 px-3 font-medium">40 - 42"</td>
                      <td className="py-2 px-3 font-medium">32 - 34"</td>
                      <td className="py-2 px-3 font-medium">29"</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-white">L</td>
                      <td className="py-2 px-3 font-medium">44 - 46"</td>
                      <td className="py-2 px-3 font-medium">36 - 38"</td>
                      <td className="py-2 px-3 font-medium">30"</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-white">XL</td>
                      <td className="py-2 px-3 font-medium">48 - 50"</td>
                      <td className="py-2 px-3 font-medium">40 - 42"</td>
                      <td className="py-2 px-3 font-medium">31"</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-white">XXL</td>
                      <td className="py-2 px-3 font-medium">52 - 54"</td>
                      <td className="py-2 px-3 font-medium">44 - 46"</td>
                      <td className="py-2 px-3 font-medium">32"</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 pt-4 border-t border-white/15 flex justify-end">
                <button
                  onClick={() => setSizeGuideOpen(false)}
                  className="btn-primary py-2.5 px-6 text-xs uppercase rounded-xl font-bold"
                >
                  Got It
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
