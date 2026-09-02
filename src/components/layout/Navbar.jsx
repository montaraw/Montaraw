import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, User, Heart, ShoppingBag, Menu, X, ChevronRight, Package, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import SearchOverlay from '../ui/SearchOverlay';
import MontarawLogo from '../ui/MontarawLogo';

const womenSubcategories = [
  { label: 'Pakistani Suits', path: '/shop/pakistani-suits', desc: 'Embroidered Velvet & Lawn Sets' },
  { label: 'Suits', path: '/shop/suits', desc: 'Anarkalis & Straight Kurta Sets' },
  { label: 'Cord Set', path: '/shop/cord-set', desc: 'Velvet & Cotton Ribbed Co-Ords' },
];

export default function Navbar({ isScrolled = false }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileWomenOpen, setMobileWomenOpen] = useState(false); // Collapsed by default
  const [desktopWomenOpen, setDesktopWomenOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { customerUser, isCustomerLoggedIn } = useAuth();
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileWomenOpen(false);
    setDesktopWomenOpen(false);
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

  const isWomenActive =
    location.pathname.includes('/shop/pakistani-suits') ||
    location.pathname.includes('/shop/suits') ||
    location.pathname.includes('/shop/cord-set') ||
    location.search.includes('gender=women');

  const isMenActive = location.search.includes('gender=men');
  const isNewArrivalsActive = location.search.includes('new=true');
  const isSaleActive = location.search.includes('sale=true');
  const isCollectionsActive = location.pathname === '/shop' && !location.search;

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
          {/* Left: Brand Logo */}
          <Link to="/" className="shrink-0 flex items-center gap-2">
            <MontarawLogo iconSize="w-9 h-9 md:w-12 md:h-12" textSize="text-xl md:text-2xl" />
          </Link>

          {/* Center Navigation (Desktop Only) */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8 absolute left-1/2 -translate-x-1/2">
            {/* WOMEN with Luxury Dropdown */}
            <div
              className="relative group py-2"
              onMouseEnter={() => setDesktopWomenOpen(true)}
              onMouseLeave={() => setDesktopWomenOpen(false)}
            >
              <Link
                to="/shop?gender=women"
                className={`text-[12px] xl:text-[13px] font-inter transition-all duration-200 relative py-1 flex items-center gap-1 font-medium ${
                  isWomenActive ? 'text-white font-bold' : 'text-gray-200 hover:text-white'
                }`}
              >
                <span>WOMEN</span>
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${
                    desktopWomenOpen ? 'rotate-180 text-brand-red' : ''
                  }`}
                />
                <span
                  className={`absolute -bottom-0.5 left-0 h-[2px] transition-all duration-200 bg-white ${
                    isWomenActive ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </Link>

              {/* Desktop Subcategory Dropdown Panel */}
              <AnimatePresence>
                {desktopWomenOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-72 z-50"
                  >
                    <div className="bg-[#101010]/98 backdrop-blur-2xl border border-white/20 rounded-2xl p-3 shadow-2xl space-y-1">
                      <div className="px-3 py-1.5 border-b border-white/10 mb-1 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-brand-red uppercase tracking-wider">
                          Women Atelier
                        </span>
                        <Link
                          to="/shop?gender=women"
                          className="text-[10px] text-gray-300 hover:text-white font-semibold underline"
                        >
                          View All
                        </Link>
                      </div>

                      {womenSubcategories.map((sub) => (
                        <Link
                          key={sub.label}
                          to={sub.path}
                          className="block p-2.5 rounded-xl hover:bg-white/10 transition-colors group/item"
                        >
                          <p className="text-xs font-bold text-white group-hover/item:text-brand-red transition-colors uppercase">
                            {sub.label}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5 font-medium">
                            {sub.desc}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* MEN Category */}
            <Link
              to="/shop?gender=men"
              className={`text-[12px] xl:text-[13px] font-inter transition-all duration-200 relative py-1 group font-medium ${
                isMenActive ? 'text-white font-bold' : 'text-gray-200 hover:text-white'
              }`}
            >
              MEN
              <span
                className={`absolute -bottom-0.5 left-0 h-[2px] transition-all duration-200 bg-white ${
                  isMenActive ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
              />
            </Link>

            {/* NEW ARRIVALS */}
            <Link
              to="/shop?new=true"
              className={`text-[12px] xl:text-[13px] font-inter transition-all duration-200 relative py-1 group font-medium ${
                isNewArrivalsActive ? 'text-white font-bold' : 'text-gray-200 hover:text-white'
              }`}
            >
              NEW ARRIVALS
              <span
                className={`absolute -bottom-0.5 left-0 h-[2px] transition-all duration-200 bg-white ${
                  isNewArrivalsActive ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
              />
            </Link>

            {/* COLLECTIONS */}
            <Link
              to="/shop"
              className={`text-[12px] xl:text-[13px] font-inter transition-all duration-200 relative py-1 group font-medium ${
                isCollectionsActive
                  ? 'text-white font-bold'
                  : 'text-gray-200 hover:text-white'
              }`}
            >
              COLLECTIONS
              <span
                className={`absolute -bottom-0.5 left-0 h-[2px] transition-all duration-200 bg-white ${
                  isCollectionsActive ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
              />
            </Link>

            {/* SALE */}
            <Link
              to="/shop?sale=true"
              className={`text-[12px] xl:text-[13px] font-inter transition-all duration-200 relative py-1 group font-medium ${
                isSaleActive
                  ? 'text-red-400 font-bold'
                  : 'text-brand-red hover:text-red-400 font-semibold'
              }`}
            >
              SALE
              <span
                className={`absolute -bottom-0.5 left-0 h-[2px] transition-all duration-200 bg-brand-red ${
                  isSaleActive ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
              />
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 md:gap-3">
            {/* Quick Track Order Link */}
            <Link
              to="/track-order"
              className="hidden xl:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/25 text-white hover:border-white text-xs font-inter transition-all bg-white/5"
              title="Track Order"
            >
              <Package size={14} className="text-white" />
              <span className="font-semibold text-white">Track Order</span>
            </Link>

            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Wishlist Icon */}
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

            {/* Cart Icon */}
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

            {/* Customer Account Icon */}
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

            {/* Mobile Menu Button */}
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
                  {/* WOMEN Accordion Header - Click to open subcategories */}
                  <div className="border-b border-white/10">
                    <button
                      onClick={() => setMobileWomenOpen(!mobileWomenOpen)}
                      className={`w-full flex items-center justify-between px-6 py-3.5 text-xs font-inter font-bold transition-all text-left ${
                        mobileWomenOpen || isWomenActive ? 'text-white bg-white/10' : 'text-gray-200 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>WOMEN</span>
                        <span className="text-[10px] text-brand-red bg-brand-red/20 px-1.5 py-0.5 rounded font-bold">
                          Atelier
                        </span>
                      </div>
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${
                          mobileWomenOpen ? 'rotate-180 text-brand-red' : 'text-gray-400'
                        }`}
                      />
                    </button>

                    {/* Subcategories list - ONLY visible when clicked */}
                    <AnimatePresence>
                      {mobileWomenOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden bg-black/60 border-t border-white/5"
                        >
                          <div className="py-2 pl-8 pr-6 space-y-1">
                            <Link
                              to="/shop?gender=women"
                              className="flex items-center justify-between py-2 text-xs text-gray-300 hover:text-white font-medium"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <span>• All Women Collection</span>
                              <ChevronRight size={13} className="text-gray-500" />
                            </Link>
                            {womenSubcategories.map((sub) => (
                              <Link
                                key={sub.label}
                                to={sub.path}
                                className="flex items-center justify-between py-2 text-xs text-white hover:text-brand-red font-semibold"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                <span>• {sub.label}</span>
                                <ChevronRight size={13} className="text-gray-400" />
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* MEN */}
                  <Link
                    to="/shop?gender=men"
                    className={`flex items-center justify-between px-6 py-3.5 text-xs font-inter font-medium transition-all ${
                      isMenActive
                        ? 'text-white bg-white/15 font-bold border-l-2 border-brand-red'
                        : 'text-gray-200 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>MEN</span>
                    <ChevronRight size={16} className="text-gray-400" />
                  </Link>

                  {/* NEW ARRIVALS */}
                  <Link
                    to="/shop?new=true"
                    className={`flex items-center justify-between px-6 py-3.5 text-xs font-inter font-medium transition-all ${
                      isNewArrivalsActive
                        ? 'text-white bg-white/15 font-bold border-l-2 border-brand-red'
                        : 'text-gray-200 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>NEW ARRIVALS</span>
                    <ChevronRight size={16} className="text-gray-400" />
                  </Link>

                  {/* COLLECTIONS */}
                  <Link
                    to="/shop"
                    className={`flex items-center justify-between px-6 py-3.5 text-xs font-inter font-medium transition-all ${
                      isCollectionsActive
                        ? 'text-white bg-white/15 font-bold border-l-2 border-brand-red'
                        : 'text-gray-200 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>COLLECTIONS</span>
                    <ChevronRight size={16} className="text-gray-400" />
                  </Link>

                  {/* SALE */}
                  <Link
                    to="/shop?sale=true"
                    className={`flex items-center justify-between px-6 py-3.5 text-xs font-inter font-bold transition-all ${
                      isSaleActive
                        ? 'text-brand-red bg-brand-red/15 border-l-2 border-brand-red'
                        : 'text-brand-red hover:bg-brand-red/10'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>SALE</span>
                    <ChevronRight size={16} className="text-brand-red" />
                  </Link>
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

                {/* Social Channels in Mobile Menu */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-gray-300">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Connect:</span>
                  <div className="flex items-center gap-3">
                    <a
                      href="https://www.instagram.com/montarawsupport?igsi=MjJ2NWdrMGRtYzM1"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-brand-red font-medium transition-colors"
                    >
                      Instagram
                    </a>
                    <span>•</span>
                    <a
                      href="https://www.facebook.com/share/17Vh8emhBD/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-brand-red font-medium transition-colors"
                    >
                      Facebook
                    </a>
                  </div>
                </div>
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
