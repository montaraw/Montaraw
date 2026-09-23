import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, CreditCard, Banknote, QrCode, ArrowRight, UserCheck, ChevronDown, Receipt, Truck, MapPin, Loader2, Check, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { STATE_ZONES } from '../../utils/taxAndShippingHelper';
import { lookupPincode, validateAddressLine, isValidIndianPhone } from '../../utils/pincodeService';
import { openRazorpayModal } from '../../services/razorpayService';

export default function CheckoutModal({ isOpen, onClose, onOrderSuccess }) {
  const {
    cart,
    cartSubtotal,
    cartDiscount,
    clothingGst,
    gstInfo,
    shippingCost,
    deliveryInfo,
    shippingState,
    setShippingState,
    deliveryType,
    cartTotal,
    appliedCoupon,
    clearCart,
  } = useCart();
  const { createOrder, initiateRazorpayOrder, confirmRazorpayPayment } = useOrders();
  const { customerUser } = useAuth();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: shippingState || 'Uttar Pradesh',
    pincode: '',
  });

  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeVerifiedMsg, setPincodeVerifiedMsg] = useState('');
  const [paymentError, setPaymentError] = useState('');

  // Function to handle pincode lookup and city/state auto-fill
  const handlePincodeLookup = useCallback(async (pin) => {
    if (!pin || pin.length !== 6) {
      setPincodeVerifiedMsg('');
      return;
    }

    setPincodeLoading(true);
    setPincodeVerifiedMsg('');
    try {
      const result = await lookupPincode(pin);
      if (result.success) {
        setFormData((prev) => ({
          ...prev,
          city: result.city || prev.city,
          state: result.state || prev.state,
        }));
        if (result.state) {
          setShippingState(result.state);
        }
        setFormErrors((prev) => {
          const next = { ...prev };
          delete next.pincode;
          delete next.city;
          delete next.state;
          return next;
        });
        setPincodeVerifiedMsg(`${result.city}, ${result.state}`);
      } else {
        setPincodeVerifiedMsg('');
        setFormErrors((prev) => ({
          ...prev,
          pincode: result.error || 'Invalid Indian PIN code',
        }));
      }
    } catch {
      // ignore
    } finally {
      setPincodeLoading(false);
    }
  }, [setShippingState]);

  // Pre-fill from logged in customer
  useEffect(() => {
    if (customerUser) {
      const userPin = customerUser.pincode || '';
      setFormData((prev) => ({
        ...prev,
        fullName: customerUser.fullName || prev.fullName,
        email: customerUser.email || prev.email,
        phone: customerUser.phone || prev.phone,
        address: customerUser.address || prev.address,
        city: customerUser.city || prev.city,
        state: customerUser.state || shippingState || 'Uttar Pradesh',
        pincode: userPin || prev.pincode,
      }));
      if (customerUser.state) {
        setShippingState(customerUser.state);
      }
      if (userPin && userPin.length === 6 && (!customerUser.city || !customerUser.state)) {
        handlePincodeLookup(userPin);
      }
    }
  }, [customerUser, isOpen, setShippingState, handlePincodeLookup]);

  const [paymentMethod, setPaymentMethod] = useState('UPI / Online');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  if (!isOpen) return null;

  const validateStep1 = () => {
    const errors = {};
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      errors.fullName = 'Please enter your full name';
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email.trim())) {
      errors.email = 'Valid email address is required';
    }
    if (!isValidIndianPhone(formData.phone)) {
      errors.phone = 'Valid 10-digit mobile number required (e.g. 9876543210)';
    }

    const addrValidation = validateAddressLine(formData.address);
    if (!addrValidation.valid) {
      errors.address = addrValidation.error;
    }

    if (!formData.pincode.trim() || !/^\d{6}$/.test(formData.pincode.trim())) {
      errors.pincode = '6-digit PIN code required';
    }
    if (!formData.city.trim() || formData.city.trim().length < 2) {
      errors.city = 'City / District is required';
    }
    if (!formData.state.trim()) {
      errors.state = 'State is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep1()) {
      setShippingState(formData.state);
      setStep(2);
    }
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    setPaymentError('');

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
      tax: clothingGst,
      gstBreakdown: gstInfo,
      shipping: shippingCost,
      deliveryZone: deliveryInfo.zoneName,
      deliveryType: deliveryType || 'standard',
      couponCode: appliedCoupon?.code || null,
      total: cartTotal,
      paymentMethod,
    };

    // Case 1: Cash on Delivery
    if (paymentMethod === 'Cash on Delivery') {
      try {
        const placedOrder = await createOrder({
          ...orderData,
          paymentMethod: 'Cash on Delivery (COD)',
        });
        clearCart();
        setIsProcessing(false);
        onClose();
        if (placedOrder && onOrderSuccess) {
          onOrderSuccess(placedOrder);
        }
      } catch (err) {
        console.error('[CheckoutModal] COD Order creation error:', err);
        setPaymentError(err.message || 'Failed to place COD order.');
        setIsProcessing(false);
      }
      return;
    }

    // Case 2: Razorpay Online Payment (UPI, Cards, NetBanking)
    try {
      const rzpInit = await initiateRazorpayOrder(orderData);

      if (!rzpInit || !rzpInit.razorpayOrderId) {
        throw new Error('Failed to initialize Razorpay payment session.');
      }

      await openRazorpayModal({
        orderId: rzpInit.orderId,
        razorpayOrderId: rzpInit.razorpayOrderId,
        amountInPaise: rzpInit.amountInPaise,
        keyId: rzpInit.keyId,
        currency: rzpInit.currency || 'INR',
        customer: formData,
        orderDescription: `Montaraw Atelier #${rzpInit.orderId}`,
        onSuccess: async (rzpResponse) => {
          try {
            const confirmedOrder = await confirmRazorpayPayment({
              orderId: rzpInit.orderId,
              razorpay_order_id: rzpResponse.razorpay_order_id,
              razorpay_payment_id: rzpResponse.razorpay_payment_id,
              razorpay_signature: rzpResponse.razorpay_signature,
            });
            clearCart();
            setIsProcessing(false);
            onClose();
            if (onOrderSuccess) {
              onOrderSuccess(confirmedOrder);
            }
          } catch (verifyErr) {
            console.error('[CheckoutModal] Payment verification error:', verifyErr);
            setIsProcessing(false);
            setPaymentError(verifyErr.message || 'Payment verification failed. If your account was charged, a full refund will be processed automatically.');
          }
        },
        onFailure: (err) => {
          console.warn('[CheckoutModal] Razorpay transaction declined:', err);
          setIsProcessing(false);
          setPaymentError(err?.description || err?.message || 'Payment transaction failed or was declined. You can retry or choose Cash on Delivery.');
        },
        onDismiss: () => {
          setIsProcessing(false);
          setPaymentError('Payment window was closed. You can retry or select another payment option.');
        },
      });
    } catch (err) {
      console.error('[CheckoutModal] Razorpay Order error:', err);
      setIsProcessing(false);
      setPaymentError(err.message || 'Could not connect to payment gateway. Please try again or use Cash on Delivery.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3.5 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md overflow-y-auto font-inter text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-[#121212] border border-white/20 rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[90vh] sm:max-h-[88vh] flex flex-col relative overflow-hidden shadow-2xl my-auto"
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
                {/* Saved Addresses Quick Selector */}
                {customerUser?.addresses && customerUser.addresses.length > 1 && (
                  <div className="space-y-1.5 pb-2 border-b border-white/10">
                    <label className="block text-[11px] font-bold text-gray-300 uppercase">
                      Select From Saved Addresses ({customerUser.addresses.length})
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {customerUser.addresses.map((addr) => {
                        const isSelected =
                          formData.address === addr.address && formData.pincode === addr.pincode;
                        return (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                fullName: addr.fullName || prev.fullName,
                                phone: addr.phone || prev.phone,
                                address: addr.address,
                                city: addr.city,
                                state: addr.state,
                                pincode: addr.pincode,
                              }));
                              if (addr.state) {
                                setShippingState(addr.state);
                              }
                              setPincodeVerifiedMsg(`${addr.city}, ${addr.state}`);
                              setFormErrors({});
                            }}
                            className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                              isSelected
                                ? 'bg-brand-red/15 border-brand-red/60 text-white shadow-md'
                                : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/10 text-white">
                                {addr.tag || 'Home'}
                              </span>
                              {addr.isDefault && (
                                <span className="text-[9px] font-bold uppercase text-green-400">Default</span>
                              )}
                            </div>
                            <p className="text-xs font-bold text-white truncate">{addr.fullName || customerUser.fullName}</p>
                            <p className="text-[11px] text-gray-300 line-clamp-1">{addr.address}</p>
                            <p className="text-[10px] text-gray-400">
                              {[addr.city, addr.state].filter(Boolean).join(', ')} - {addr.pincode}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

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
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-white uppercase text-[11px] sm:text-xs">
                        PIN Code (6 digits) *
                      </label>
                      {pincodeLoading && (
                        <span className="text-[10px] text-brand-red flex items-center gap-1 font-semibold">
                          <Loader2 size={11} className="animate-spin" /> Fetching...
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="e.g. 400050"
                        maxLength={6}
                        value={formData.pincode}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setFormData((prev) => ({ ...prev, pincode: val }));
                          if (formErrors.pincode) {
                            setFormErrors((prev) => {
                              const next = { ...prev };
                              delete next.pincode;
                              return next;
                            });
                          }
                          if (val.length === 6) {
                            handlePincodeLookup(val);
                          } else {
                            setPincodeVerifiedMsg('');
                          }
                        }}
                        className={`w-full bg-[#181818] border text-white placeholder-gray-400 text-xs sm:text-[13px] px-3.5 py-2.5 sm:py-3 rounded-xl focus:outline-none font-medium transition-colors ${
                          formErrors.pincode
                            ? 'border-red-500 bg-red-500/5'
                            : pincodeVerifiedMsg
                            ? 'border-green-500/60 focus:border-green-400'
                            : 'border-white/20 focus:border-brand-red'
                        }`}
                      />
                      {pincodeVerifiedMsg && !pincodeLoading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 pointer-events-none">
                          <Check size={16} />
                        </div>
                      )}
                    </div>
                    {formErrors.pincode && <p className="text-[10px] text-red-400 mt-1 font-semibold">{formErrors.pincode}</p>}
                    {pincodeVerifiedMsg && !formErrors.pincode && (
                      <p className="text-[10px] text-green-400 mt-1 font-semibold flex items-center gap-1 truncate">
                        <Check size={11} /> Auto-filled: {pincodeVerifiedMsg}
                      </p>
                    )}
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
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, address: e.target.value }));
                        if (formErrors.address) {
                          setFormErrors((prev) => {
                            const next = { ...prev };
                            delete next.address;
                            return next;
                          });
                        }
                      }}
                      className={`w-full bg-[#181818] border text-white placeholder-gray-400 text-xs sm:text-[13px] px-3.5 py-2.5 rounded-xl focus:outline-none resize-none font-medium transition-colors ${
                        formErrors.address ? 'border-red-500 bg-red-500/5' : 'border-white/20 focus:border-brand-red'
                      }`}
                    />
                    {formErrors.address && <p className="text-[10px] text-red-400 mt-1 font-semibold">{formErrors.address}</p>}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block font-bold text-white uppercase text-[11px] sm:text-xs mb-1">
                      City / District *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="City / District"
                      value={formData.city}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, city: e.target.value }));
                        if (formErrors.city) {
                          setFormErrors((prev) => {
                            const next = { ...prev };
                            delete next.city;
                            return next;
                          });
                        }
                      }}
                      className={`w-full bg-[#181818] border text-white placeholder-gray-400 text-xs sm:text-[13px] px-3.5 py-2.5 sm:py-3 rounded-xl focus:outline-none font-medium transition-colors ${
                        formErrors.city ? 'border-red-500 bg-red-500/5' : 'border-white/20 focus:border-brand-red'
                      }`}
                    />
                    {formErrors.city && <p className="text-[10px] text-red-400 mt-1 font-semibold">{formErrors.city}</p>}
                  </div>

                  {/* State */}
                  <div>
                    <label className="block font-bold text-white uppercase text-[11px] sm:text-xs mb-1">
                      State / Destination Region *
                    </label>
                    <div className="relative">
                      <select
                        value={formData.state}
                        onChange={(e) => {
                          const newState = e.target.value;
                          setFormData((prev) => ({ ...prev, state: newState }));
                          setShippingState(newState);
                          if (formErrors.state) {
                            setFormErrors((prev) => {
                              const next = { ...prev };
                              delete next.state;
                              return next;
                            });
                          }
                        }}
                        className="w-full bg-[#181818] border border-white/20 text-white text-xs sm:text-[13px] px-3.5 py-2.5 sm:py-3 rounded-xl focus:outline-none focus:border-brand-red font-bold uppercase appearance-none pr-8 cursor-pointer"
                      >
                        {Object.keys(STATE_ZONES).filter((s) => s !== 'Other').map((st) => (
                          <option key={st} value={st} className="bg-[#181818] text-white">
                            {st}
                          </option>
                        ))}
                        <option value="Other" className="bg-[#181818] text-white">Other Indian Territory</option>
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
                    <span className="text-brand-red font-bold text-[10px] uppercase block mt-1">
                      {deliveryInfo.zoneName} • {deliveryInfo.estimatedDays}
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
                      desc: 'Fastest dispatch with instant order confirmation',
                      icon: QrCode,
                    },
                    {
                      id: 'Credit / Debit Card',
                      title: 'Credit / Debit Card (Visa, Mastercard, RuPay)',
                      desc: 'Secure encrypted banking payment gateway',
                      icon: CreditCard,
                    },
                    {
                      id: 'Cash on Delivery',
                      title: 'Cash on Delivery (COD)',
                      desc: 'Pay in cash upon doorstep delivery',
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

                {/* Order Summary Detailed Breakdown */}
                <div className="p-3.5 sm:p-4 bg-[#181818] border border-white/15 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between text-gray-300">
                    <span>Items Subtotal ({cart.length} items):</span>
                    <span className="text-white font-bold">₹{cartSubtotal.toLocaleString()}</span>
                  </div>

                  {cartDiscount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Voucher Discount ({appliedCoupon?.code}):</span>
                      <span className="font-bold">-₹{cartDiscount.toLocaleString()}</span>
                    </div>
                  )}

                  {/* Apparel GST */}
                  <div className="flex justify-between text-gray-300">
                    <div className="flex items-center gap-1">
                      <Receipt size={12} className="text-gray-400" />
                      <span>Apparel GST ({gstInfo.breakdownText}):</span>
                    </div>
                    <span className="text-white font-bold">₹{clothingGst.toLocaleString()}</span>
                  </div>

                  {/* Distance Delivery */}
                  <div className="flex justify-between text-gray-300">
                    <div className="flex items-center gap-1">
                      <Truck size={12} className="text-brand-red" />
                      <span>Courier Shipping:</span>
                    </div>
                    <span className="text-white font-bold">₹{shippingCost.toLocaleString()}</span>
                  </div>

                  <div className="pt-2.5 border-t border-white/15 flex justify-between items-center text-sm">
                    <div>
                      <span className="font-bold text-white uppercase block">Total Payable:</span>
                      <span className="text-[10px] text-gray-400">Includes all taxes & destination shipping</span>
                    </div>
                    <span className="font-black text-lg sm:text-xl text-white">₹{cartTotal.toLocaleString()}</span>
                  </div>
                </div>

                {paymentError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2 font-medium">
                    <AlertCircle size={15} className="shrink-0" />
                    <span className="flex-1">{paymentError}</span>
                  </div>
                )}
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
                    <span className="flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      <span>{paymentMethod === 'Cash on Delivery' ? 'Placing Order...' : 'Opening Secure Gateway...'}</span>
                    </span>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      <span className="truncate">
                        {paymentMethod === 'Cash on Delivery' ? 'Confirm COD Order' : 'Pay with Razorpay'} • ₹{cartTotal.toLocaleString()}
                      </span>
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

