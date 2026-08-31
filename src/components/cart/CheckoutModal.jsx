import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, CreditCard, Banknote, QrCode, ArrowRight } from 'lucide-react';
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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto font-inter text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#121212] border border-white/20 rounded-3xl max-w-2xl w-full p-6 md:p-8 relative overflow-hidden shadow-2xl my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/15 mb-6">
            <div>
              <span className="text-xs font-bold text-brand-red uppercase block mb-0.5">
                MONTARAW CHECKOUT
              </span>
              <h2 className="text-xl md:text-2xl font-black text-white uppercase">
                {step === 1 ? 'Shipping & Details' : 'Select Payment'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white hover:text-gray-300 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Stepper Indicator */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`flex-1 h-1.5 rounded-full transition-all ${
                step >= 1 ? 'bg-brand-red' : 'bg-white/20'
              }`}
            />
            <div
              className={`flex-1 h-1.5 rounded-full transition-all ${
                step >= 2 ? 'bg-brand-red' : 'bg-white/20'
              }`}
            />
          </div>

          {step === 1 ? (
            /* STEP 1: Shipping Form */
            <form onSubmit={handleNext} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-white uppercase mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Sharma"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-[#181818] border border-white/20 text-white placeholder-gray-400 text-xs px-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-medium"
                  />
                  {formErrors.fullName && <p className="text-xs text-red-400 mt-1 font-semibold">{formErrors.fullName}</p>}
                </div>

                <div>
                  <label className="block font-bold text-white uppercase mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. aarav@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#181818] border border-white/20 text-white placeholder-gray-400 text-xs px-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-medium"
                  />
                  {formErrors.email && <p className="text-xs text-red-400 mt-1 font-semibold">{formErrors.email}</p>}
                </div>

                <div>
                  <label className="block font-bold text-white uppercase mb-1.5">
                    Mobile Phone (10 digits) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 6206424372"
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#181818] border border-white/20 text-white placeholder-gray-400 text-xs px-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-medium"
                  />
                  {formErrors.phone && <p className="text-xs text-red-400 mt-1 font-semibold">{formErrors.phone}</p>}
                </div>

                <div>
                  <label className="block font-bold text-white uppercase mb-1.5">
                    PIN Code (6 digits) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 400050"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full bg-[#181818] border border-white/20 text-white placeholder-gray-400 text-xs px-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-medium"
                  />
                  {formErrors.pincode && <p className="text-xs text-red-400 mt-1 font-semibold">{formErrors.pincode}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-white uppercase mb-1.5">
                    Delivery Address *
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="House / Flat No., Street, Landmark"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-[#181818] border border-white/20 text-white placeholder-gray-400 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-brand-red resize-none font-medium"
                  />
                  {formErrors.address && <p className="text-xs text-red-400 mt-1 font-semibold">{formErrors.address}</p>}
                </div>

                <div>
                  <label className="block font-bold text-white uppercase mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mumbai"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-[#181818] border border-white/20 text-white placeholder-gray-400 text-xs px-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-medium"
                  />
                  {formErrors.city && <p className="text-xs text-red-400 mt-1 font-semibold">{formErrors.city}</p>}
                </div>

                <div>
                  <label className="block font-bold text-white uppercase mb-1.5">
                    State *
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full bg-[#181818] border border-white/20 text-white text-xs px-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-bold uppercase"
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
                    <option value="Other">Other State</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-white/15 flex items-center justify-between">
                <span className="text-xs text-gray-200">
                  Total Payable: <strong className="text-white text-sm font-black">₹{cartTotal.toLocaleString()}</strong>
                </span>
                <button
                  type="submit"
                  className="btn-primary py-3.5 px-8 text-xs font-bold uppercase rounded-xl inline-flex items-center gap-2 shadow-xl"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: Payment Method & Review */
            <div className="space-y-6">
              {/* Delivery Destination Snippet */}
              <div className="p-3.5 bg-[#181818] border border-white/15 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-white font-bold block">{formData.fullName} ({formData.phone})</span>
                  <span className="text-gray-300 text-xs">{formData.address}, {formData.city}, {formData.pincode}</span>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-brand-red hover:underline text-xs font-bold uppercase"
                >
                  Change
                </button>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-white uppercase">
                  Choose Payment Option
                </label>

                {[
                  {
                    id: 'UPI / Online',
                    title: 'Instant UPI (Google Pay, PhonePe, Paytm, QR)',
                    desc: 'Fastest dispatch with instant payment confirmation',
                    icon: QrCode,
                  },
                  {
                    id: 'Credit / Debit Card',
                    title: 'Credit / Debit Card (Visa, Mastercard, RuPay)',
                    desc: 'Secure 256-bit encrypted card gateway',
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
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                        active
                          ? 'bg-brand-red/15 border-brand-red text-white shadow-lg'
                          : 'bg-[#181818] border-white/15 text-white hover:border-white/30'
                      }`}
                    >
                      <div className={`p-2 rounded-xl border mt-0.5 ${active ? 'border-brand-red bg-brand-red/20 text-brand-red' : 'border-white/15 text-white'}`}>
                        <method.icon size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase text-white">
                            {method.title}
                          </span>
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={active}
                            onChange={() => setPaymentMethod(method.id)}
                            className="accent-brand-red"
                          />
                        </div>
                        <p className="text-xs text-gray-300 mt-0.5">
                          {method.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Summary Recap */}
              <div className="p-4 bg-[#181818] border border-white/15 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between text-gray-200">
                  <span>Cart Subtotal ({cart.length} pieces):</span>
                  <span className="text-white font-bold">₹{cartSubtotal.toLocaleString()}</span>
                </div>
                {cartDiscount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount ({appliedCoupon?.code}):</span>
                    <span className="font-bold">-₹{cartDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-200">
                  <span>Shipping:</span>
                  <span className={shippingCost === 0 ? 'text-green-400 font-bold' : 'text-white font-bold'}>
                    {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
                  </span>
                </div>
                <div className="pt-2 border-t border-white/15 flex justify-between items-center text-sm">
                  <span className="font-bold text-white uppercase">Grand Total:</span>
                  <span className="font-black text-lg text-white">₹{cartTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Place Order CTA */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3.5 rounded-xl border border-white/20 text-white hover:bg-white/10 text-xs font-bold uppercase"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handlePlaceOrder}
                  className="flex-1 btn-primary py-4 rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-2 shadow-2xl disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span>Processing Order...</span>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      <span>Confirm & Place Order (₹{cartTotal.toLocaleString()})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
