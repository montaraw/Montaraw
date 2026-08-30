import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Heart, Store, Search } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import SearchOverlay from '../ui/SearchOverlay';

export default function MobileBottomNav() {
  const location = useLocation();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [searchOpen, setSearchOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <div className="bottom-nav safe-bottom bg-[#0d0d0d]/98 backdrop-blur-2xl border-t border-white/15 text-white font-inter z-50">
        <div className="flex items-center justify-around py-2 px-2">
          {/* 1. Home */}
          <Link
            to="/"
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all relative ${
              isActive('/') ? 'text-white font-bold' : 'text-gray-300 hover:text-white'
            }`}
          >
            <Home size={20} strokeWidth={isActive('/') ? 2.5 : 1.75} className={isActive('/') ? 'text-white' : 'text-gray-300'} />
            <span className={`text-[10px] font-inter ${isActive('/') ? 'font-bold text-white' : 'text-gray-300'}`}>
              Home
            </span>
            {isActive('/') && (
              <span className="absolute -top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-brand-red rounded-full shadow-sm" />
            )}
          </Link>

          {/* 2. Shop */}
          <Link
            to="/shop"
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all relative ${
              isActive('/shop') ? 'text-white font-bold' : 'text-gray-300 hover:text-white'
            }`}
          >
            <Store size={20} strokeWidth={isActive('/shop') ? 2.5 : 1.75} className={isActive('/shop') ? 'text-white' : 'text-gray-300'} />
            <span className={`text-[10px] font-inter ${isActive('/shop') ? 'font-bold text-white' : 'text-gray-300'}`}>
              Shop
            </span>
            {isActive('/shop') && (
              <span className="absolute -top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-brand-red rounded-full shadow-sm" />
            )}
          </Link>

          {/* 3. Middle Search Button (Prominent Center CTA) */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex flex-col items-center justify-center -mt-3.5 group relative"
            aria-label="Search garments"
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-brand-red to-red-600 border-2 border-[#0d0d0d] shadow-lg shadow-brand-red/30 flex items-center justify-center group-hover:scale-105 group-active:scale-95 transition-all text-white">
              <Search size={19} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-bold text-white font-inter mt-0.5">
              Search
            </span>
          </button>

          {/* 4. Wishlist */}
          <Link
            to="/wishlist"
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all relative ${
              isActive('/wishlist') ? 'text-white font-bold' : 'text-gray-300 hover:text-white'
            }`}
          >
            <div className="relative">
              <Heart size={20} strokeWidth={isActive('/wishlist') ? 2.5 : 1.75} className={isActive('/wishlist') ? 'text-white' : 'text-gray-300'} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-brand-red text-white text-[9px] font-black rounded-full min-w-[16px] h-[16px] flex items-center justify-center shadow-md">
                  {wishlistCount}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-inter ${isActive('/wishlist') ? 'font-bold text-white' : 'text-gray-300'}`}>
              Wishlist
            </span>
            {isActive('/wishlist') && (
              <span className="absolute -top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-brand-red rounded-full shadow-sm" />
            )}
          </Link>

          {/* 5. Cart */}
          <Link
            to="/cart"
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all relative ${
              isActive('/cart') ? 'text-white font-bold' : 'text-gray-300 hover:text-white'
            }`}
          >
            <div className="relative">
              <ShoppingBag size={20} strokeWidth={isActive('/cart') ? 2.5 : 1.75} className={isActive('/cart') ? 'text-white' : 'text-gray-300'} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-brand-red text-white text-[9px] font-black rounded-full min-w-[16px] h-[16px] flex items-center justify-center shadow-md">
                  {cartCount}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-inter ${isActive('/cart') ? 'font-bold text-white' : 'text-gray-300'}`}>
              Cart
            </span>
            {isActive('/cart') && (
              <span className="absolute -top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-brand-red rounded-full shadow-sm" />
            )}
          </Link>
        </div>
      </div>

      {/* Embedded Search Overlay */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
