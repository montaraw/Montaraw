import { useCart } from '../../context/CartContext';
import { ShieldCheck, Truck, ArrowRight, Lock } from 'lucide-react';

export default function CartSummary({ onCheckoutClick }) {
  const { cartSubtotal, cartDiscount, shippingCost, cartTotal, appliedCoupon, cartCount } = useCart();
  const threshold = 999;
  const remainingForFreeShipping = Math.max(0, threshold - cartSubtotal);

  return (
    <div className="bg-[#121212] border border-white/15 rounded-2xl p-5 space-y-4 shadow-xl font-inter text-white">
      <h3 className="text-sm font-bold text-white uppercase">
        Order Summary
      </h3>

      {/* Free Shipping Progress Indicator */}
      <div className="p-3 bg-[#181818] border border-white/15 rounded-xl space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-white font-medium">
            <Truck size={14} className="text-brand-red" />
            {remainingForFreeShipping === 0 ? 'Free Shipping Unlocked!' : `Add ₹${remainingForFreeShipping.toLocaleString()} for Free Shipping`}
          </span>
          <span className="text-[10px] font-bold text-white">
            {remainingForFreeShipping === 0 ? '100%' : `${Math.min(100, Math.round((cartSubtotal / threshold) * 100))}%`}
          </span>
        </div>
        <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-red transition-all duration-500 rounded-full"
            style={{ width: `${Math.min(100, (cartSubtotal / threshold) * 100)}%` }}
          />
        </div>
      </div>

      {/* Price Lines */}
      <div className="space-y-2.5 text-xs">
        <div className="flex justify-between text-gray-200">
          <span>Subtotal ({cartCount} item{cartCount !== 1 ? 's' : ''})</span>
          <span className="text-white font-bold">₹{cartSubtotal.toLocaleString()}</span>
        </div>

        {cartDiscount > 0 && (
          <div className="flex justify-between text-green-400">
            <span>
              Coupon Discount
              {appliedCoupon && (
                <span className="text-gray-300 ml-1">({appliedCoupon.code})</span>
              )}
            </span>
            <span className="font-bold">-₹{cartDiscount.toLocaleString()}</span>
          </div>
        )}

        <div className="flex justify-between text-gray-200">
          <span>Standard Delivery</span>
          <span className={shippingCost === 0 ? 'text-green-400 font-bold' : 'text-white font-bold'}>
            {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
          </span>
        </div>
      </div>

      <hr className="border-white/15" />

      {/* Grand Total */}
      <div className="flex justify-between items-baseline">
        <span className="text-xs font-bold text-white uppercase">
          Total Payable
        </span>
        <span className="text-xl font-black text-white">
          ₹{cartTotal.toLocaleString()}
        </span>
      </div>

      {/* Proceed to Checkout Button */}
      <button
        onClick={onCheckoutClick}
        className="w-full btn-primary py-3.5 rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-2 shadow-2xl"
      >
        <Lock size={14} />
        <span>Proceed to Checkout</span>
        <ArrowRight size={14} />
      </button>

      <div className="flex items-center justify-center gap-2 text-[11px] text-gray-300 pt-1">
        <ShieldCheck size={14} className="text-green-400" />
        <span>256-Bit SSL Encrypted Secure Checkout</span>
      </div>
    </div>
  );
}
