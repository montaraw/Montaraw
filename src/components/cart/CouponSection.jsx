import { useState } from 'react';
import { Tag, X, Check, Loader2, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { defaultCoupons } from '../../data/seedData';

export default function CouponSection() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validating, setValidating] = useState(false);
  const { applyCoupon, removeCoupon, appliedCoupon, cartSubtotal, cartDiscount } = useCart();
  const { customerUser } = useAuth();

  const handleApply = async (e) => {
    e?.preventDefault();
    if (!code.trim()) {
      setError('Please enter a coupon code.');
      return;
    }

    const cleanCode = code.trim().toUpperCase();
    setError('');
    setSuccess('');
    setValidating(true);

    try {
      const customerIdentity = customerUser?.email || customerUser?.phone || '';
      const res = await api.validateCoupon(cleanCode, cartSubtotal, customerIdentity);

      if (res?.success && res.coupon) {
        applyCoupon({
          code: res.coupon.code,
          discount: res.coupon.discount,
          type: res.coupon.type,
          discountAmount: res.coupon.discountAmount,
          minOrder: res.coupon.minOrder,
          maxDiscount: res.coupon.maxDiscount,
        });
        setSuccess(res.message || `Coupon ${res.coupon.code} applied successfully!`);
        setCode('');
      } else {
        throw new Error(res?.message || 'Invalid or expired coupon code.');
      }
    } catch (err) {
      // Local fallback in case backend is offline
      console.warn('[CouponSection] API validate failed, checking local seed coupons:', err.message);
      const fallbackCoupon = (defaultCoupons || []).find(
        (c) => c.code.toUpperCase() === cleanCode
      );

      if (fallbackCoupon) {
        if (cartSubtotal < (fallbackCoupon.minOrder || 0)) {
          setError(`Minimum order of ₹${fallbackCoupon.minOrder.toLocaleString()} required for ${fallbackCoupon.code}`);
        } else {
          applyCoupon(fallbackCoupon);
          setSuccess(`Coupon ${fallbackCoupon.code} applied! ${fallbackCoupon.type === 'percentage' ? `${fallbackCoupon.discount}% OFF` : `₹${fallbackCoupon.discount} FLAT OFF`}`);
          setCode('');
        }
      } else {
        setError(err.message || 'Invalid or expired coupon code.');
      }
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="bg-[#121212] border border-white/15 rounded-2xl p-5 font-inter text-white shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Tag size={15} className="text-brand-red" />
          <h4 className="text-xs font-bold text-white uppercase">
            Promotional Voucher
          </h4>
        </div>
        {appliedCoupon && (
          <span className="text-[10px] font-bold uppercase text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/30">
            Active
          </span>
        )}
      </div>

      {appliedCoupon ? (
        <div className="flex items-center justify-between bg-green-500/15 border border-green-500/30 p-3.5 rounded-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-green-500/30 flex items-center justify-center text-green-300">
              <Check size={14} />
            </div>
            <div>
              <span className="text-xs text-green-300 font-bold block">
                {appliedCoupon.code} applied
              </span>
              <span className="text-[11px] text-gray-300">
                {appliedCoupon.type === 'percentage'
                  ? `${appliedCoupon.discount}% discount applied`
                  : `₹${appliedCoupon.discount} flat voucher deducted`}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              removeCoupon();
              setSuccess('');
            }}
            className="text-gray-300 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            title="Remove Coupon"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <form onSubmit={handleApply} className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError('');
              }}
              placeholder="Enter coupon code (e.g. WELCOME10)"
              className="flex-1 bg-[#181818] border border-white/20 text-white placeholder-gray-500 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-brand-red font-mono font-bold uppercase"
            />
            <button
              type="submit"
              disabled={validating}
              className="px-5 py-2.5 btn-primary text-xs font-bold uppercase rounded-xl transition-all shrink-0 shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              {validating ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <span>Apply</span>
              )}
            </button>
          </div>
          {error && <p className="text-[11px] text-red-400 font-semibold leading-tight">{error}</p>}
          {success && <p className="text-[11px] text-green-400 font-semibold leading-tight">{success}</p>}
        </form>
      )}
    </div>
  );
}
