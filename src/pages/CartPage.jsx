import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import CouponSection from '../components/cart/CouponSection';
import CheckoutModal from '../components/cart/CheckoutModal';
import OrderSuccessModal from '../components/cart/OrderSuccessModal';
import CustomerAuthModal from '../components/auth/CustomerAuthModal';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartPage() {
  const { cart, clearCart } = useCart();
  const { isCustomerLoggedIn } = useAuth();
  const [searchParams] = useSearchParams();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  // Handle checkout trigger with compulsory customer login check
  const handleProceedToCheckout = () => {
    if (!isCustomerLoggedIn) {
      setAuthModalOpen(true);
    } else {
      setCheckoutOpen(true);
    }
  };

  // Auto-open checkout if navigated with ?checkout=true (Buy Now action)
  useEffect(() => {
    if (searchParams.get('checkout') === 'true' && cart.length > 0) {
      if (!isCustomerLoggedIn) {
        setAuthModalOpen(true);
      } else {
        setCheckoutOpen(true);
      }
    }
  }, [searchParams, cart.length, isCustomerLoggedIn]);

  return (
    <div className="pt-8 md:pt-12 pb-20 min-h-screen bg-brand-black font-inter text-white">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 md:mb-10 pb-4 border-b border-white/15">
          <div>
            <span className="text-brand-red text-xs font-bold uppercase block mb-1">
              SHOPPING BAG
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white uppercase leading-tight">
              YOUR BAG ({cart.length})
            </h1>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-brand-red transition-colors px-3 py-1.5 rounded-lg border border-white/20 hover:border-brand-red/40 font-semibold"
            >
              <Trash2 size={14} />
              Clear Bag
            </button>
          )}
        </div>

        {cart.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-3">
              {cart.map((item) => (
                <motion.div
                  key={item.cartItemId}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  layout
                >
                  <CartItem item={item} />
                </motion.div>
              ))}

              <div className="pt-4 flex items-center justify-between">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase text-gray-200 hover:text-white transition-colors"
                >
                  <ArrowLeft size={14} />
                  Continue Browsing Atelier
                </Link>
              </div>
            </div>

            {/* Sidebar Summary & Coupons */}
            <div className="space-y-4 lg:sticky lg:top-24">
              <CouponSection />
              <CartSummary onCheckoutClick={handleProceedToCheckout} />
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 px-4 max-w-md mx-auto bg-[#121212] border border-white/15 rounded-3xl"
          >
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-white/20 rounded-full bg-white/10 text-white">
              <ShoppingBag size={30} />
            </div>
            <h2 className="text-lg font-bold text-white mb-1 uppercase">
              Your Bag is Empty
            </h2>
            <p className="text-xs text-gray-300 mb-6">
              Explore our latest lookbook of sculpted dresses, oversized tees, and heavyweight hoodies.
            </p>
            <Link
              to="/shop"
              className="btn-primary py-3 px-6 text-xs font-bold uppercase rounded-xl inline-flex items-center gap-2 shadow-xl"
            >
              <span>Explore Collection</span>
              <ArrowRight size={15} />
            </Link>
          </motion.div>
        )}
      </div>

      {/* Customer Compulsory Login Modal */}
      <CustomerAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={() => {
          setAuthModalOpen(false);
          setCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onOrderSuccess={(order) => setPlacedOrder(order)}
      />

      {/* Order Confirmation Success Modal */}
      <OrderSuccessModal
        order={placedOrder}
        onClose={() => setPlacedOrder(null)}
      />
    </div>
  );
}
