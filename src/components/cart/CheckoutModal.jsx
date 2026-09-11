import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, CreditCard, Banknote, QrCode, ArrowRight, UserCheck, ChevronDown } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';

export default function CheckoutModal({ isOpen, onClose, onOrderSuccess }) {
  const { cart, cartSubtotal, cartDiscount, shippingCost, cartTotal, appliedCoupon, clearCart } = useCart();
  const { createOrder } = useOrders();
  const { customerUser } = useAuth();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
  });

  // Pre-fill from logged in customer
  useEffect(() => {
    if (customerUser) {
      setFormData({
        fullName: customerUser.fullName || '',
        email: customerUser.email || '',
        phone: customerUser.phone || '',
        address: customerUser.address || '',
        city: customerUser.city || '',
        state: customerUser.state || 'Maharashtra',
        pincode: customerUser.pincode || '',
      });
    }
  }, [customerUser, isOpen]);

  const [paymentMethod, setPaymentMethod] = useState('UPI / Online');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  if (!isOpen) return null;

  const validateStep1 = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Valid email is required';
    if (!formData.phone.trim() || !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) errors.phone = '10-digit mobile number required';
    if (!formData.address.trim()) errors.address = 'Street address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.pincode.trim() || !/^\d{6}$/.test(formData.pincode.trim())) errors.pincode = '6-digit PIN code required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);

    try {
      const orderData = {
        customer: { ...formData },
        items: cart.map((item) => ({
          id: item.id || item.productId,
          productId: item.id || item.productId,
          name: item.name,
          size: item.selectedSize || item.size || 'M',
          color: item.selectedColor || item.color || '#000000',
          colorName: item.selectedColorName || item.colorName || item.colorNames?.[0] || 'Standard',
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        subtotal: cartSubtotal,
        discount: cartDiscount,
        couponCode: appliedCoupon?.code || null,
        shipping: shippingCost,
        total: cartTotal,
        paymentMethod,
      };

      const placedOrder = await createOrder(orderData);
      clearCart();
      setIsProcessing(false);
      onClose();
      if (placedOrder && onOrderSuccess) {
        onOrderSuccess(placedOrder);
      }
    } catch (err) {
      console.error('[CheckoutModal] Order creation error:', err);
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md overflow-y-auto font-inter text-white">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.96 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="bg-[#121212] border-t sm:border border-white/20 rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[92dvh] sm:max-h-[88vh] flex flex-col relative overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/15 bg-black/40 shrink-0">
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-brand-red uppercase tracking-wider block mb-0.5">
                MONTARAW ATELIER CHECKOUT
              </span>
              <h2 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight">
                {step === 1 ? 'Shipping & Details' : 'Select Payment'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white hover:text-gray-300 rounded-full bg-white/10 hover:bg-white/20 transition-colors shrink-0"
              aria-label="Close checkout"
            >
              <X size={18} />
            </button>
          </div>

          {/* Stepper Progress Indicator */}
          <div className="px-4 sm:px-6 pt-3 pb-1 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex-1 flex flex-col gap-1">
                <div className={`h-1.5 rounded-full transition-all ${step >= 1 ? 'bg-brand-red' : 'bg-white/20'}`} />
                <span className="text-[10px] font-bold uppercase text-gray-300">1. Address</span>
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <div className={`h-1.5 rounded-full transition-all ${step >= 2 ? 'bg-brand-red' : 'bg-white/20'}`} />
                <span className="text-[10px] font-bold uppercase text-gray-300">2. Payment</span>
              </div>
            </div>
          </div>

          {/* Modal Scrollable Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
            {customerUser && (
              <div className="p-3 bg-white/5 border border-white/15 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center shrink-0">
                    <UserCheck size={14} className="text-green-400" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate">{customerUser.fullName}</p>
                    <p className="text-[10px] text-gray-400 truncate">{customerUser.email}</p>
                  </div>
                </div>
                <span className="text-[10px] text-green-400 font-bold uppercase bg-green-500/10 px-2 py-0.5 rounded-full shrink-0 border border-green-500/30">
                  Verified
                </span>
              </div>
            )}

            {step === 1 ? (
              /* STEP 1: Shipping Address Form */
              <form id="shipping-form" onSubmit={handleNext} className="space-y-3.5 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
                  {/* Full Name */}
                  <div>
                    <label className="block font-bold text-white uppercase text-[11px] sm:text-xs mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aarav Sharma"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className={`w-full bg-[#181818] border text-white placeholder-gray-400 text-xs sm:text-[13px] px-3.5 py-2.5 sm:py-3 rounded-xl focus:outline-none font-medium transition-colors ${
                        formErrors.fullName ? 'border-red-500 bg-red-500/5' : 'border-white/20 focus:border-brand-red'
                      }`}
                    />
                    {formErrors.fullName && <p className="text-[10px] text-red-400 mt-1 font-semibold">{formErrors.fullName}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block font-bold text-white uppercase text-[11px] sm:text-xs mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. aarav@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full bg-[#181818] border text-white placeholder-gray-400 text-xs sm:text-[13px] px-3.5 py-2.5 sm:py-3 rounded-xl focus:outline-none font-medium transition-colors ${
                        formErrors.email ? 'border-red-500 bg-red-500/5' : 'border-white/20 focus:border-brand-red'
                      }`}
                    />
                    {formErrors.email && <p className="text-[10px] text-red-400 mt-1 font-semibold">{formErrors.email}</p>}
                  </div>

                  {/* Mobile Phone */}
                  <div>
                    <label className="block font-bold text-white uppercase text-[11px] sm:text-xs mb-1">
                      Mobile Phone (10 digits) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      maxLength={10}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                      className={`w-full bg-[#181818] border text-white placeholder-gray-400 text-xs sm:text-[13px] px-3.5 py-2.5 sm:py-3 rounded-xl focus:outline-none font-medium transition-colors ${
                        formErrors.phone ? 'border-red-500 bg-red-500/5' : 'border-white/20 focus:border-brand-red'
                      }`}
                    />
                    {formErrors.phone && <p className="text-[10px] text-red-400 mt-1 font-semibold">{formErrors.phone}</p>}
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className="block font-bold text-white uppercase text-[11px] sm:text-xs mb-1">
                      PIN Code (6 digits) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 400050"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                      className={`w-full bg-[#181818] border text-white placeholder-gray-400 text-xs sm:text-[13px] px-3.5 py-2.5 sm:py-3 rounded-xl focus:outline-none font-medium transition-colors ${
                        formErrors.pincode ? 'border-red-500 bg-red-500/5' : 'border-white/20 focus:border-brand-red'
                      }`}
                    />
                    {formErrors.pincode && <p className="text-[10px] text-red-400 mt-1 font-semibold">{formErrors.pincode}</p>}
                  </div>

                  {/* Delivery Address */}
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-white uppercase text-[11px] sm:text-xs mb-1">
                      Delivery Address *
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="House / Flat No., Building, Street, Landmark"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className={`w-full bg-[#181818] border text-white placeholder-gray-400 text-xs sm:text-[13px] px-3.5 py-2.5 rounded-xl focus:outline-none resize-none font-medium transition-colors ${
                        formErrors.address ? 'border-red-500 bg-red-500/5' : 'border-white/20 focus:border-brand-red'
                      }`}
                    />
                    {formErrors.address && <p className="text-[10px] text-red-400 mt-1 font-semibold">{formErrors.address}</p>}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block font-bold text-white uppercase text-[11px] sm:text-xs mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mumbai"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className={`w-full bg-[#181818] border text-white placeholder-gray-400 text-xs sm:text-[13px] px-3.5 py-2.5 sm:py-3 rounded-xl focus:outline-none font-medium transition-colors ${
                        formErrors.city ? 'border-red-500 bg-red-500/5' : 'border-white/20 focus:border-brand-red'
                      }`}
                    />
                    {formErrors.city && <p className="text-[10px] text-red-400 mt-1 font-semibold">{formErrors.city}</p>}
                  </div>

                  {/* State */}
                  <div>
                    <label className="block font-bold text-white uppercase text-[11px] sm:text-xs mb-1">
                      State *
                    </label>
                    <div className="relative">
                      <select
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full bg-[#181818] border border-white/20 text-white text-xs sm:text-[13px] px-3.5 py-2.5 sm:py-3 rounded-xl focus:outline-none focus:border-brand-red font-bold uppercase appearance-none pr-8 cursor-pointer"
                      >
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Delhi">Delhi / NCR</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="West Bengal">West Bengal</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Bihar">Bihar</option>
                        <option value="Punjab">Punjab</option>
                        <option value="Haryana">Haryana</option>
                        <option value="Madhya Pradesh">Madhya Pradesh</option>
                        <option value="Kerala">Kerala</option>
                        <option value="Other">Other State</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              /* STEP 2: Payment Method & Order Summary */
              <div className="space-y-4">
                {/* Delivery Address Summary Snippet */}
                <div className="p-3.5 bg-[#181818] border border-white/15 rounded-2xl flex items-start justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <span className="text-white font-bold block truncate">{formData.fullName} ({formData.phone})</span>
                    <span className="text-gray-300 text-[11px] sm:text-xs block mt-0.5 line-clamp-2">
                      {formData.address}, {formData.city}, {formData.state} - {formData.pincode}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-brand-red hover:underline text-xs font-bold uppercase shrink-0 pt-0.5"
                  >
                    Change
                  </button>
                </div>

                {/* Payment Methods */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-white uppercase">
                    Choose Payment Option
                  </label>

                  {[
                    {
                      id: 'UPI / Online',
                      title: 'Instant UPI (GPay, PhonePe, Paytm, QR)',
                      desc: 'Fastest dispatch with instant confirmation',
                      icon: QrCode,
                    },
                    {
                      id: 'Credit / Debit Card',
                      title: 'Credit / Debit Card (Visa, Mastercard)',
                      desc: 'Secure 256-bit encrypted gateway',
                      icon: CreditCard,
                    },
                    {
                      id: 'Cash on Delivery',
                      title: 'Cash on Delivery (COD)',
                      desc: 'Pay upon delivery at your doorstep',
                      icon: Banknote,
                    },
                  ].map((method) => {
                    const active = paymentMethod === method.id;
                    return (
                      <div
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-3 sm:p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                          active
                            ? 'bg-brand-red/15 border-brand-red text-white shadow-lg'
                            : 'bg-[#181818] border-white/15 text-white hover:border-white/30'
                        }`}
                      >
                        <div className={`p-2 rounded-xl border mt-0.5 shrink-0 ${active ? 'border-brand-red bg-brand-red/20 text-brand-red' : 'border-white/15 text-white'}`}>
                          <method.icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase text-white truncate pr-2">
                              {method.title}
                            </span>
                            <input
                              type="radio"
                              name="paymentMethod"
                              checked={active}
                              onChange={() => setPaymentMethod(method.id)}
                              className="accent-brand-red shrink-0"
                            />
                          </div>
                          <p className="text-[11px] text-gray-300 mt-0.5 truncate">
                            {method.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Order Summary Recap */}
                <div className="p-3.5 sm:p-4 bg-[#181818] border border-white/15 rounded-2xl space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-300">
                    <span>Cart Subtotal ({cart.length} items):</span>
                    <span className="text-white font-bold">₹{cartSubtotal.toLocaleString()}</span>
                  </div>
                  {cartDiscount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount ({appliedCoupon?.code}):</span>
                      <span className="font-bold">-₹{cartDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-300">
                    <span>Delivery Shipping:</span>
                    <span className={shippingCost === 0 ? 'text-green-400 font-bold' : 'text-white font-bold'}>
                      {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-white/15 flex justify-between items-center text-sm">
                    <span className="font-bold text-white uppercase">Grand Total:</span>
                    <span className="font-black text-base sm:text-lg text-white">₹{cartTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Bottom Actions Bar */}
          <div className="p-4 sm:p-5 border-t border-white/15 bg-black/60 shrink-0">
            {step === 1 ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center justify-between sm:block">
                  <span className="text-[11px] text-gray-400 uppercase font-semibold">Total Payable</span>
                  <div className="text-base sm:text-lg font-black text-white">₹{cartTotal.toLocaleString()}</div>
                </div>
                <button
                  type="submit"
                  form="shipping-form"
                  className="btn-primary py-3 sm:py-3.5 px-6 sm:px-8 text-xs font-bold uppercase rounded-xl inline-flex items-center justify-center gap-2 shadow-xl w-full sm:w-auto"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl border border-white/20 text-white hover:bg-white/10 text-xs font-bold uppercase transition-colors shrink-0"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handlePlaceOrder}
                  className="flex-1 btn-primary py-3 sm:py-3.5 px-4 rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-2 shadow-2xl disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span>Processing Order...</span>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      <span className="truncate">Confirm Order • ₹{cartTotal.toLocaleString()}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

