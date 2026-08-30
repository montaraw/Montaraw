import { Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import MontarawLogo from '../ui/MontarawLogo';

const socialLinks = [
  {
    name: 'Instagram',
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    name: 'YouTube',
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    name: 'Facebook',
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.592 9 4.833V8z" />
      </svg>
    ),
  },
];

export default function Footer() {
  const { settings } = useProducts();

  return (
    <footer className="bg-[#0a0a0a] border-t border-white/15 text-white pb-16 md:pb-0 font-inter">
      {/* Newsletter VIP Banner */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-10 md:py-12">
        <div className="bg-gradient-to-r from-[#141414] via-[#1c1c1c] to-[#141414] rounded-3xl p-6 md:p-10 border border-white/20 text-center relative overflow-hidden shadow-2xl">
          <span className="text-xs font-bold text-brand-red uppercase block mb-1">
            EXCLUSIVE ATELIER ACCESS
          </span>
          <h3 className="text-2xl md:text-4xl font-black text-white uppercase">
            JOIN THE MONTARAW MOVEMENT
          </h3>
          <p className="text-sm text-gray-200 mt-1 mb-6 max-w-md mx-auto">
            Get 10% off on your first order with coupon code <strong className="text-white font-bold">MONTARAW10</strong> & exclusive private drops.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert('Thank you for subscribing to Montaraw VIP drops!');
            }}
            className="flex items-center max-w-md mx-auto border border-white/30 rounded-2xl overflow-hidden bg-black/80 shadow-xl"
          >
            <input
              type="email"
              required
              placeholder="Enter your email address"
              className="flex-1 bg-transparent px-4 md:px-5 py-3.5 text-xs sm:text-sm text-white placeholder-gray-400 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-brand-red hover:bg-red-700 text-white font-bold text-xs uppercase px-6 py-3.5 transition-colors shrink-0"
            >
              SUBSCRIBE
            </button>
          </form>
        </div>
      </div>

      {/* Footer Content Grid */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 md:py-12 border-t border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <MontarawLogo iconSize="w-9 h-9 md:w-11 md:h-11" textSize="text-xl md:text-2xl" />
            </Link>
            <p className="text-xs text-gray-200 leading-relaxed max-w-sm">
              {settings.tagline || 'Born Raw. Stay Raw.'} Premium single-brand streetwear, sculpted partywear dresses, and heavyweight essentials.
            </p>
            <div className="flex items-center gap-2.5 pt-1">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href="#"
                  aria-label={social.name}
                  className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/20 bg-white/10 text-white hover:border-white transition-all"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Desktop Only: Collections (Pure Clean Text, No Emojis) */}
          <div className="hidden md:block">
            <h4 className="text-xs font-bold text-white mb-4 uppercase">
              Explore Collections
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-200">
              <li>
                <Link to="/shop?gender=women" className="hover:text-white transition-colors">
                  Women's Collection
                </Link>
              </li>
              <li>
                <Link to="/shop/dresses" className="hover:text-white transition-colors text-white font-semibold">
                  Women Dresses & Gowns
                </Link>
              </li>
              <li>
                <Link to="/shop?gender=men" className="hover:text-white transition-colors">
                  Men's Streetwear
                </Link>
              </li>
              <li>
                <Link to="/shop/oversized-tshirts" className="hover:text-white transition-colors">
                  240 GSM Oversized T-Shirts
                </Link>
              </li>
              <li>
                <Link to="/shop/hoodies" className="hover:text-white transition-colors">
                  380 GSM Heavy Fleece Hoodies
                </Link>
              </li>
              <li>
                <Link to="/shop?sale=true" className="hover:text-white transition-colors text-brand-red font-semibold">
                  Archive Sale & Drops
                </Link>
              </li>
            </ul>
          </div>

          {/* Desktop Only: Customer Care */}
          <div className="hidden md:block">
            <h4 className="text-xs font-bold text-white mb-4 uppercase">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-200">
              <li>
                <Link to="/track-order" className="hover:text-white transition-colors text-white font-semibold">
                  Track Live Shipment
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-white transition-colors">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">
                  Shopping Bag & Checkout
                </Link>
              </li>
              <li>
                <Link to="/account" className="hover:text-white transition-colors">
                  My Customer Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details (Clean text without random icons) */}
          <div>
            <h4 className="text-xs font-bold text-white mb-4 uppercase">
              Direct Concierge
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-200">
              <li>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Email Support:</span>
                <a
                  href={`mailto:${settings.contactEmail || 'montarawsupport@gmail.com'}`}
                  className="text-white hover:text-brand-red font-medium transition-colors inline-block"
                >
                  {settings.contactEmail || 'montarawsupport@gmail.com'}
                </a>
              </li>
              <li>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Helpline:</span>
                <a
                  href={`tel:${(settings.contactPhone || '+916206424372').replace(/[^+\d]/g, '')}`}
                  className="text-white hover:text-brand-red font-medium transition-colors inline-block"
                >
                  {settings.contactPhone || '+91 62064 24372'}
                </a>
              </li>
              <li>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Flagship Atelier:</span>
                <span className="text-white font-medium">Flat No. 102, GAZAWALI, SARWAT, Muzzafarnagar, Uttar Pradesh 251002</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div className="border-t border-white/10 py-6 bg-black">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-300">
          <p>© 2025 {settings.brandName || 'MONTARAW'}. Crafted for the bold. All rights reserved.</p>
          <div className="flex items-center gap-6 text-[11px] text-gray-300">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Atelier</Link>
            <Link to="/shipping-returns" className="hover:text-white transition-colors">Shipping & Returns</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
