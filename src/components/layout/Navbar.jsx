import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, User, Heart, ShoppingBag, Menu, X, ChevronRight, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import SearchOverlay from '../ui/SearchOverlay';
import MontarawLogo from '../ui/MontarawLogo';

const navLinks = [
  { label: 'WOMEN', path: '/shop?gender=women' },
  { label: 'MEN', path: '/shop?gender=men' },
  { label: 'DRESSES', path: '/shop/dresses' },
  { label: 'OVERSIZED', path: '/shop/oversized-tshirts' },
  { label: 'NEW ARRIVALS', path: '/shop?new=true' },
  { label: 'COLLECTIONS', path: '/shop' },
  { label: 'SALE', path: '/shop?sale=true', highlight: true },
];

export default function Navbar({ isScrolled = false }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { customerUser, isCustomerLoggedIn } = useAuth();
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const isLinkActive = (path) => {
    const currentUrl = location.pathname + location.search;
    if (path === '/shop' && currentUrl === '/shop') return true;
    if (path !== '/shop' && currentUrl === path) return true;
    if (path.startsWith('/shop/') && location.pathname === path) return true;
    return false;
  };

  return (
    <>
      <nav
        className={`w-full transition-all duration-300 px-4 md:px-8 border-b ${
          isScrolled
            ? 'bg-brand-black/98 backdrop-blur-2xl border-white/20 py-3 shadow-2xl'
            : 'bg-brand-black/95 backdrop-blur-xl border-white/15 py-3.5'
        }`}
      >
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          {/* Left: Brand Logo (Aligned cleanly on left for all devices) */}
          <Link to="/" className="shrink-0 flex items-center gap-2">
            <MontarawLogo iconSize="w-9 h-9 md:w-12 md:h-12" textSize="text-xl md:text-2xl" />
          </Link>

          {/* Center Navigation (Desktop Only) */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => {
              const active = isLinkActive(link.path);
              return (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`text-[12px] xl:text-[13px] font-inter transition-all duration-200 relative py-1 group font-medium ${
                    link.highlight
                      ? active
                        ? 'text-red-400 font-bold'
                        : 'text-brand-red hover:text-red-400 font-semibold'
                      : active
                      ? 'text-white font-bold'
                      : 'text-gray-200 hover:text-white'
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-[2px] transition-all duration-200 ${
                      link.highlight ? 'bg-brand-red' : 'bg-white'
                    } ${active ? 'w-full' : 'w-0 group-hover:w-full'}`}
                  />
                </Link>
              );
            })}
          </div>

          {/* Right Actions: Desktop Full Bar & Mobile Menu Button on Right */}
          <div className="flex items-center gap-1 md:gap-3">
            {/* Quick Track Order Link (Desktop Only) */}
            <Link
              to="/track-order"
              className="hidden xl:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/25 text-white hover:border-white text-xs font-inter transition-all bg-white/5"
              title="Track Order"
            >
              <Package size={14} className="text-white" />
              <span className="font-semibold text-white">Track Order</span>
            </Link>

            {/* Search Button (Desktop Only) */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Wishlist Icon (Desktop Only) */}
            <Link
              to="/wishlist"
              className="hidden md:flex p-2 text-white hover:bg-white/10 rounded-full transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart size={19} />
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-brand-red text-white text-[9px] font-bold rounded-full flex items-center justify-center min-w-[16px] h-[16px]">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon (Desktop Only) */}
            <Link
              to="/cart"
              className="hidden md:flex p-2 text-white hover:bg-white/10 rounded-full transition-colors relative"
              aria-label="Cart"
            >
              <ShoppingBag size={19} />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-brand-red text-white text-[9px] font-bold rounded-full flex items-center justify-center min-w-[16px] h-[16px]">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Customer Account Icon (Desktop Only) */}
            <Link
              to={isCustomerLoggedIn ? '/account' : '/login'}
              className="hidden md:flex items-center gap-1.5 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              aria-label="Customer Account"
              title={isCustomerLoggedIn ? `Account: ${customerUser?.fullName}` : 'Sign In'}
            >
              <User size={19} className={isCustomerLoggedIn ? 'text-green-400' : 'text-white'} />
              {isCustomerLoggedIn && (
                <span className="text-xs font-bold text-white max-w-[80px] truncate">
                  {customerUser?.fullName?.split(' ')[0]}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button (Placed on Right on Phone) */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden text-white p-2 hover:bg-white/10 rounded-xl transition-colors shrink-0 bg-white/5 border border-white/15"
              aria-label="Open navigation menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer (Slides smoothly in from the RIGHT) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] lg:hidden"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setMobileMenuOpen(false)} />
            
            {/* Right Slide Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.28 }}
              className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-[#0d0d0d] border-l border-white/20 overflow-y-auto flex flex-col justify-between shadow-2xl"
            >
              <div>
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between p-5 border-b border-white/15 bg-black/40">
                  <Link to="/" className="shrink-0" onClick={() => setMobileMenuOpen(false)}>
                    <MontarawLogo iconSize="w-8 h-8" textSize="text-lg" />
                  </Link>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-white p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                    aria-label="Close menu"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Mobile Search Button inside Drawer */}
                <div className="px-5 pt-4 pb-1">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setSearchOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs text-gray-200 transition-all shadow-md text-left"
                  >
                    <Search size={16} className="text-gray-300 shrink-0" />
                    <span className="font-medium text-gray-300">Search atelier garments...</span>
                  </button>
                </div>

                {/* Mobile Customer Status */}
                <div className="px-5 pt-3 pb-2">
                  <Link
                    to={isCustomerLoggedIn ? '/account' : '/login'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 bg-white/10 border border-white/20 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <User size={16} className={isCustomerLoggedIn ? 'text-green-400' : 'text-white'} />
                      <span className="text-xs text-white font-bold">
                        {isCustomerLoggedIn ? `Hello, ${customerUser?.fullName}` : 'Sign In / Register'}
                      </span>
                    </div>
                    <ChevronRight size={14} className="text-gray-300" />
                  </Link>
                </div>

                {/* Mobile Nav Links */}
                <div className="py-2">
                  {navLinks.map((link) => {
                    const active = isLinkActive(link.path);
                    return (
                      <Link
                        key={link.label}
                        to={link.path}
                        className={`flex items-center justify-between px-6 py-3.5 text-xs font-inter font-medium transition-all ${
                          link.highlight
                            ? 'text-brand-red font-bold hover:bg-brand-red/10'
                            : active
                            ? 'text-white bg-white/15 font-bold border-l-2 border-brand-red'
                            : 'text-gray-200 hover:text-white hover:bg-white/10'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span>{link.label}</span>
                        <ChevronRight size={16} className="text-gray-400" />
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Menu Footer */}
              <div className="border-t border-white/15 p-5 space-y-3 bg-black/60">
                <Link
                  to="/track-order"
                  className="flex items-center gap-3 text-white hover:text-brand-red transition-colors py-2 text-xs font-inter font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Package size={17} />
                  <span>Track Your Order</span>
                </Link>
                <Link
                  to={isCustomerLoggedIn ? '/account' : '/login'}
                  className="flex items-center gap-3 text-white hover:text-brand-red transition-colors py-2 text-xs font-inter font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User size={17} />
                  <span>{isCustomerLoggedIn ? 'My Account & Orders' : 'Customer Login'}</span>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
