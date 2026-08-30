import { useState } from 'react';
import { Tag, X, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { defaultCoupons } from '../../data/seedData';

export default function CouponSection() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { applyCoupon, removeCoupon, appliedCoupon, cartSubtotal } = useCart();

  const handleApply = () => {
    setError('');
    setSuccess('');
    const coupon = defaultCoupons.find(
      (c) => c.code.toLowerCase() === code.trim().toLowerCase()
    );
    if (!coupon) {
      setError('Invalid coupon code');
      return;
    }
    if (cartSubtotal < coupon.minOrder) {
      setError(`Minimum order ₹${coupon.minOrder} required`);
      return;
    }
    applyCoupon(coupon);
    setSuccess(`Coupon applied! ${coupon.type === 'percentage' ? `${coupon.discount}% off` : `₹${coupon.discount} off`}`);
    setCode('');
  };

  return (
    <div className="bg-[#121212] border border-white/15 rounded-2xl p-5 font-inter text-white shadow-xl">
      <div className="flex items-center gap-2 mb-3">
        <Tag size={15} className="text-brand-red" />
        <h4 className="text-xs font-bold text-white uppercase">
          Apply Coupon Code
        </h4>
      </div>

      {appliedCoupon ? (
        <div className="flex items-center justify-between bg-green-500/15 border border-green-500/30 p-3 rounded-xl">
          <div className="flex items-center gap-2">
            <Check size={16} className="text-green-400" />
            <span className="text-xs text-green-300 font-bold">
              {appliedCoupon.code} applied successfully
            </span>
          </div>
          <button
            onClick={() => {
              removeCoupon();
              setSuccess('');
            }}
            className="text-white hover:text-red-400 p-1 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError('');
              }}
              placeholder="Enter coupon code"
              className="flex-1 bg-[#181818] border border-white/20 text-white placeholder-gray-400 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-brand-red font-mono font-bold uppercase"
            />
            <button
              onClick={handleApply}
              className="px-5 py-2.5 bg-white text-black font-bold text-xs uppercase rounded-xl hover:bg-gray-200 transition-colors shrink-0 shadow-md"
            >
              Apply
            </button>
          </div>
          {error && <p className="text-xs text-red-400 mt-2 font-semibold">{error}</p>}
          {success && <p className="text-xs text-green-400 mt-2 font-semibold">{success}</p>}
        </>
      )}
    </div>
  );
}
