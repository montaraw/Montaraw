import { useCart } from '../../context/CartContext';
import { Truck, ArrowRight, Lock, MapPin, Receipt, ChevronDown } from 'lucide-react';
import { STATE_ZONES } from '../../utils/taxAndShippingHelper';

export default function CartSummary({ onCheckoutClick }) {
  const {
    cartSubtotal,
    cartDiscount,
    clothingGst,
    gstInfo,
    shippingCost,
    deliveryInfo,
    shippingState,
    setShippingState,
    cartTotal,
    appliedCoupon,
    cartCount,
  } = useCart();

  const stateOptions = Object.keys(STATE_ZONES).filter((s) => s !== 'Other');

  return (
    <div className="bg-[#121212] border border-white/15 rounded-2xl p-5 space-y-4 shadow-xl font-inter text-white">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white uppercase">
          Order Summary
        </h3>
        <span className="text-[11px] text-gray-400 font-medium">
          {cartCount} item{cartCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Destination Delivery Zone Selector */}
      <div className="p-3 bg-[#181818] border border-white/15 rounded-xl space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-white font-medium text-[11px]">
            <MapPin size={13} className="text-brand-red" />
            <span>Delivery State / Region:</span>
          </span>
          <span className="text-[10px] font-bold text-gray-300">
            {deliveryInfo.estimatedDays}
          </span>
        </div>

        <div className="relative">
          <select
            value={shippingState}
            onChange={(e) => setShippingState(e.target.value)}
            className="w-full bg-[#121212] border border-white/20 text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-brand-red font-medium appearance-none pr-8 cursor-pointer"
          >
            {stateOptions.map((st) => (
              <option key={st} value={st} className="bg-[#181818] text-white">
                {st}
              </option>
            ))}
            <option value="Other" className="bg-[#181818] text-white">Other Indian Territory</option>
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="flex items-center justify-between text-[10px] text-gray-400 pt-0.5">
          <span>{deliveryInfo.zoneName}</span>
          <span className="font-bold text-white">₹{shippingCost} Standard Courier</span>
        </div>
      </div>

      {/* Price Lines */}
      <div className="space-y-2.5 text-xs">
        <div className="flex justify-between text-gray-200">
          <span>Items Subtotal</span>
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

        {/* Real Apparel GST on Clothes */}
        <div className="flex justify-between text-gray-200">
          <div className="flex items-center gap-1">
            <Receipt size={12} className="text-gray-400" />
            <span>Apparel GST ({gstInfo.effectiveRate})</span>
          </div>
          <div className="text-right">
            <span className="text-white font-bold">₹{clothingGst.toLocaleString()}</span>
            <span className="text-[10px] text-gray-400 block">
              {gstInfo.isInterState ? 'IGST' : 'CGST + SGST'}
            </span>
          </div>
        </div>

        {/* Real Distance-Wise Courier Shipping */}
        <div className="flex justify-between text-gray-200">
          <div className="flex items-center gap-1">
            <Truck size={12} className="text-brand-red" />
            <span>Courier Delivery ({shippingState})</span>
          </div>
          <span className="text-white font-bold">
            ₹{shippingCost.toLocaleString()}
          </span>
        </div>
      </div>

      <hr className="border-white/15" />

      {/* Grand Total */}
      <div className="flex justify-between items-baseline">
        <div>
          <span className="text-xs font-bold text-white uppercase block">
            Total Payable
          </span>
          <span className="text-[10px] text-gray-400">
            (Includes Garment Tax & Courier Delivery)
          </span>
        </div>
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
    </div>
  );
}

