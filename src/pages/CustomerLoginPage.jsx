import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  LogOut,
  Package,
  ArrowRight,
  CheckCircle2,
  User,
  Loader2,
  Check,
  RefreshCw,
  Truck,
  Clock,
  RotateCcw,
  Ban,
  AlertCircle,
  X,
  CreditCard,
  MapPin,
  HelpCircle,
  Plus,
  Trash2,
  Edit3,
  Home,
  Briefcase,
  Star,
  CheckSquare,
  Repeat,
  ShieldCheck,
  Building2,
  Smartphone,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import MontarawLogo from '../components/ui/MontarawLogo';
import { lookupPincode, validateAddressLine, isValidIndianPhone } from '../utils/pincodeService';

const CANCELLATION_REASONS = [
  'Ordered by mistake / duplicate order',
  'Need to change size, color, or item',
  'Incorrect shipping address or pincode',
  'Expected delivery time is too long',
  'Found a lower price / changed my mind',
  'Payment or billing preference change',
  'Other reason',
];

const EXCHANGE_REASONS = [
  'Size is too small / tight (Need larger size)',
  'Size is too large / loose (Need smaller size)',
  'Fit or length alteration required',
  'Different color / tone desired',
  'Minor stitching or finishing defect',
];

const RETURN_REASONS = [
  'Fabric quality or color does not match expectation',
  'Garment style or silhouette does not suit me',
  'Received damaged, soiled, or defective piece',
  'Ordered multiple sizes to try at home',
  'Fit / length mismatch',
  'Changed my mind / no longer needed',
  'Other reason',
];

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Custom Size'];

export default function CustomerLoginPage() {
  const {
    customerUser,
    isCustomerLoggedIn,
    customerLogin,
    customerRegister,
    customerLogout,
    updateCustomerProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAuth();
  const { orders, refreshOrders, cancelOrder, requestReturnOrExchange, loading: ordersLoading } = useOrders();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const redirectTarget = searchParams.get('redirect') || '';
  const [isRegister, setIsRegister] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeMsg, setPincodeMsg] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'profile'

  // Cancellation Modal State (Flipkart / Amazon style)
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState(CANCELLATION_REASONS[0]);
  const [cancelRemarks, setCancelRemarks] = useState('');
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState('');

  // Return & Replacement Modal State (Fashion eCommerce standard)
  const [returnOrder, setReturnOrder] = useState(null);
  const [returnType, setReturnType] = useState('EXCHANGE_REPLACEMENT'); // 'EXCHANGE_REPLACEMENT' | 'RETURN_REFUND'
  const [returnReason, setReturnReason] = useState(EXCHANGE_REASONS[0]);
  const [returnRemarks, setReturnRemarks] = useState('');
  const [replacementSize, setReplacementSize] = useState('M');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [codRefundMethod, setCodRefundMethod] = useState('UPI'); // 'UPI' | 'BANK'
  const [codUpiId, setCodUpiId] = useState('');
  const [codBank, setCodBank] = useState({
    accountHolder: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    bankName: '',
  });
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [returnError, setReturnError] = useState('');
  const [returnSuccessMsg, setReturnSuccessMsg] = useState('');

  // Address Book Management State (Add / Edit / Delete / Default)
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    tag: 'Home',
    isDefault: false,
  });
  const [addrPincodeLoading, setAddrPincodeLoading] = useState(false);
  const [addrPincodeMsg, setAddrPincodeMsg] = useState('');
  const [addrFormError, setAddrFormError] = useState('');

  // Fetch customer orders from backend whenever customer is logged in or page mounts
  useEffect(() => {
    if (isCustomerLoggedIn) {
      refreshOrders?.();
    }
  }, [isCustomerLoggedIn, refreshOrders]);

  const handlePincodeLookup = useCallback(async (pin) => {
    if (!pin || pin.length !== 6) {
      setPincodeMsg('');
      return;
    }
    setPincodeLoading(true);
    setPincodeMsg('');
    try {
      const result = await lookupPincode(pin);
      if (result.success) {
        setRegForm((prev) => ({
          ...prev,
          city: result.city || prev.city,
          state: result.state || prev.state,
        }));
        setPincodeMsg(`${result.city}, ${result.state}`);
      }
    } catch {
      // ignore
    } finally {
      setPincodeLoading(false);
    }
  }, []);

  const handleAddrModalPincodeLookup = useCallback(async (pin) => {
    if (!pin || pin.length !== 6) {
      setAddrPincodeMsg('');
      return;
    }
    setAddrPincodeLoading(true);
    setAddrPincodeMsg('');
    try {
      const result = await lookupPincode(pin);
      if (result.success) {
        setAddressForm((prev) => ({
          ...prev,
          city: result.city || prev.city,
          state: result.state || prev.state,
        }));
        setAddrPincodeMsg(`${result.city}, ${result.state}`);
      }
    } catch {
      // ignore
    } finally {
      setAddrPincodeLoading(false);
    }
  }, []);

  // Compute customer's orders across local & live backend records
  const userOrders = useMemo(() => {
    if (!customerUser) return [];
    const email = (customerUser.email || '').trim().toLowerCase();
    const phone = (customerUser.phone || '').replace(/\D/g, '');
    const userId = customerUser.id || '';

    const matched = (orders || []).filter((o) => {
      const matchUserId = userId && o.userId === userId;
      const matchEmail = email && (
        (o.customerEmail && o.customerEmail.toLowerCase() === email) ||
        (o.customer?.email && o.customer.email.toLowerCase() === email)
      );
      const oPhone = (o.customerPhone || o.customer?.phone || '').replace(/\D/g, '');
      const matchPhone = phone && phone.length >= 7 && oPhone.length >= 7 && (oPhone.includes(phone) || phone.includes(oPhone));

      return matchUserId || matchEmail || matchPhone;
    });

    return matched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders, customerUser]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await customerLogin(loginForm.email, loginForm.password);
    if (res?.success) {
      if (redirectTarget === 'checkout') {
        navigate('/cart?checkout=true');
      }
    } else {
      setError(res?.message || 'Login failed');
    }
  };

  const handleRegSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!regForm.fullName || regForm.fullName.trim().length < 2) {
      setError('Please enter your full name');
      return;
    }
    if (!regForm.email || !/\S+@\S+\.\S+/.test(regForm.email.trim())) {
      setError('Please enter a valid email address');
      return;
    }
    if (regForm.phone && !isValidIndianPhone(regForm.phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (regForm.address) {
      const addrCheck = validateAddressLine(regForm.address);
      if (!addrCheck.valid) {
        setError(addrCheck.error);
        return;
      }
    }
    if (regForm.pincode && !/^\d{6}$/.test(regForm.pincode.trim())) {
      setError('PIN code must be 6 digits');
      return;
    }
    if (!regForm.password || regForm.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    const res = await customerRegister(regForm);
    if (res?.success) {
      if (redirectTarget === 'checkout') {
        navigate('/cart?checkout=true');
      }
    } else {
      setError(res?.message || 'Registration failed');
    }
  };

  // Open Add Address Modal
  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      fullName: customerUser?.fullName || '',
      phone: customerUser?.phone || '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      tag: 'Home',
      isDefault: (customerUser?.addresses?.length || 0) === 0,
    });
    setAddrPincodeMsg('');
    setAddrFormError('');
    setAddressModalOpen(true);
  };

  // Open Edit Address Modal
  const handleOpenEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      fullName: addr.fullName || '',
      phone: addr.phone || '',
      address: addr.address || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || '',
      tag: addr.tag || 'Home',
      isDefault: !!addr.isDefault,
    });
    setAddrPincodeMsg(addr.city && addr.state ? `${addr.city}, ${addr.state}` : '');
    setAddrFormError('');
    setAddressModalOpen(true);
  };

  // Save Address (Create / Update)
  const handleSaveAddress = (e) => {
    e.preventDefault();
    setAddrFormError('');

    if (!addressForm.fullName.trim() || addressForm.fullName.trim().length < 2) {
      setAddrFormError('Please enter a valid recipient name');
      return;
    }
    if (!addressForm.phone || !isValidIndianPhone(addressForm.phone)) {
      setAddrFormError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!addressForm.address.trim() || addressForm.address.trim().length < 5) {
      setAddrFormError('Please enter a detailed street address');
      return;
    }
    if (!addressForm.pincode || !/^\d{6}$/.test(addressForm.pincode.trim())) {
      setAddrFormError('PIN code must be exactly 6 digits');
      return;
    }
    if (!addressForm.city.trim()) {
      setAddrFormError('Please enter the City / District');
      return;
    }

    if (editingAddressId) {
      updateAddress(editingAddressId, addressForm);
    } else {
      addAddress(addressForm);
    }

    setAddressModalOpen(false);
  };

  // Handle Order Cancellation Submit (Customer)
  const handleConfirmCancellation = async () => {
    if (!cancellingOrder) return;
    setCancelSubmitting(true);
    setCancelError('');

    try {
      const res = await cancelOrder(cancellingOrder.id, {
        reason: cancelReason,
        remarks: cancelRemarks,
        customerEmail: customerUser?.email,
        customerPhone: customerUser?.phone,
      });

      if (res?.success) {
        setCancelSuccessMsg(res.message || `Order #${cancellingOrder.id} has been cancelled successfully.`);
        setTimeout(() => {
          setCancellingOrder(null);
          setCancelSuccessMsg('');
          setCancelRemarks('');
          refreshOrders?.();
        }, 2200);
      } else {
        setCancelError(res?.message || 'Unable to cancel order. Please contact support.');
      }
    } catch (err) {
      setCancelError(err.message || 'Cancellation request failed.');
    } finally {
      setCancelSubmitting(false);
    }
  };

  // Open Return / Replacement Modal
  const handleOpenReturn = (order) => {
    setReturnOrder(order);
    setReturnType('EXCHANGE_REPLACEMENT');
    setReturnReason(EXCHANGE_REASONS[0]);
    setReturnRemarks('');
    setReplacementSize('M');
    setSelectedItemId(order.items?.[0]?.id || '');
    setCodRefundMethod('UPI');
    setCodUpiId('');
    setCodBank({
      accountHolder: customerUser?.fullName || '',
      accountNumber: '',
      confirmAccountNumber: '',
      ifscCode: '',
      bankName: '',
    });
    setReturnError('');
    setReturnSuccessMsg('');
  };

  // Submit Return or Replacement Request
  const handleConfirmReturnOrExchange = async () => {
    if (!returnOrder) return;
    setReturnSubmitting(true);
    setReturnError('');

    try {
      // Validate COD Bank / UPI details if returning for refund
      const isCod = returnOrder.paymentMethod?.includes('Cash on Delivery');
      let bankDetails = null;

      if (returnType === 'RETURN_REFUND' && isCod) {
        if (!codUpiId && codRefundMethod === 'UPI') {
          setReturnError('Please enter your UPI ID (e.g. 9876543210@upi or name@oksbi)');
          setReturnSubmitting(false);
          return;
        }
        if (codRefundMethod === 'UPI') {
          if (!codUpiId.includes('@')) {
            setReturnError('Please enter a valid UPI ID with @ bank handle');
            setReturnSubmitting(false);
            return;
          }
          bankDetails = { type: 'UPI', upiId: codUpiId.trim() };
        } else {
          if (!codBank.accountHolder.trim()) {
            setReturnError('Please enter the Account Holder Name');
            setReturnSubmitting(false);
            return;
          }
          if (!codBank.accountNumber || codBank.accountNumber.length < 8) {
            setReturnError('Please enter a valid Bank Account Number');
            setReturnSubmitting(false);
            return;
          }
          if (codBank.accountNumber !== codBank.confirmAccountNumber) {
            setReturnError('Account numbers do not match');
            setReturnSubmitting(false);
            return;
          }
          if (!codBank.ifscCode || codBank.ifscCode.length < 5) {
            setReturnError('Please enter a valid IFSC Code');
            setReturnSubmitting(false);
            return;
          }
          bankDetails = {
            type: 'BANK_TRANSFER',
            accountHolder: codBank.accountHolder.trim(),
            accountNumber: codBank.accountNumber.trim(),
            ifscCode: codBank.ifscCode.trim().toUpperCase(),
            bankName: codBank.bankName.trim() || 'Indian Scheduled Bank',
          };
        }
      }

      const res = await requestReturnOrExchange(returnOrder.id, {
        type: returnType,
        reason: returnReason,
        remarks: returnRemarks,
        selectedItemIds: selectedItemId ? [selectedItemId] : returnOrder.items?.map((it) => it.id),
        replacementSize: returnType === 'EXCHANGE_REPLACEMENT' ? replacementSize : null,
        bankDetails,
        customerEmail: customerUser?.email,
        customerPhone: customerUser?.phone,
      });

      if (res?.success) {
        setReturnSuccessMsg(res.message || 'Return / Exchange request submitted successfully.');
        setTimeout(() => {
          setReturnOrder(null);
          setReturnSuccessMsg('');
          refreshOrders?.();
        }, 3200);
      } else {
        setReturnError(res?.message || 'Failed to submit request. Please contact support.');
      }
    } catch (err) {
      setReturnError(err.message || 'Request failed. Please try again.');
    } finally {
      setReturnSubmitting(false);
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  const savedAddresses = customerUser?.addresses || [];

  if (isCustomerLoggedIn) {
    return (
      <div className="pt-6 md:pt-12 pb-24 md:pb-20 min-h-screen bg-brand-black font-inter text-white">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/15 mb-6 md:mb-8">
            <div>
              <span className="text-xs font-bold text-brand-red uppercase block mb-1">
                CUSTOMER CONCIERGE
              </span>
              <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-white uppercase">
                Welcome, {customerUser.fullName}
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 mt-1">
                {customerUser.email} • {customerUser.phone}
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <button
                onClick={customerLogout}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/20 hover:border-red-500/50 text-gray-300 hover:text-red-400 text-xs font-bold uppercase transition-all bg-white/5 shadow-md"
              >
                <LogOut size={15} />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center justify-between gap-2 mb-6 border-b border-white/10 pb-3 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition-all shrink-0 ${
                  activeTab === 'orders'
                    ? 'bg-white text-black shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                My Orders ({userOrders.length})
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition-all shrink-0 ${
                  activeTab === 'profile'
                    ? 'bg-white text-black shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Saved Addresses ({savedAddresses.length})
              </button>
            </div>

            {activeTab === 'orders' && (
              <button
                onClick={() => refreshOrders?.()}
                disabled={ordersLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/15 text-xs text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 transition-all font-semibold"
                title="Refresh live orders"
              >
                <RefreshCw size={13} className={ordersLoading ? 'animate-spin text-brand-red' : ''} />
                <span className="hidden sm:inline">Sync Orders</span>
              </button>
            )}
          </div>

          {activeTab === 'orders' ? (
            /* Orders Tab */
            <div className="space-y-5">
              {userOrders.length > 0 ? (
                userOrders.map((order) => {
                  const isRefunded = order.paymentStatus === 'Refunded' || order.status === 'Refunded';
                  const isDelivered = order.status === 'Delivered';
                  const isShipped = order.status === 'Shipped' || order.status === 'Out for Delivery';
                  const isCancelled = order.status === 'Cancelled' && !isRefunded;
                  const hasTracking = order.trackingNumber && order.trackingNumber.trim().length > 0;
                  const canCancel =
                    ['Processing', 'Pending', 'Order Confirmed'].includes(order.status) &&
                    !hasTracking &&
                    order.status !== 'Cancelled' &&
                    order.status !== 'Refunded' &&
                    order.paymentStatus !== 'Refunded';
                  const canReturnOrExchange = isDelivered && !isRefunded && order.status !== 'Cancelled';

                  return (
                    <div
                      key={order.id}
                      className="p-4 sm:p-6 bg-[#121212] border border-white/15 rounded-3xl space-y-4 shadow-xl relative overflow-hidden"
                    >
                      {/* Top Header Row */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-white/10">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="font-bold text-white font-mono text-base sm:text-lg">{order.id}</span>
                            
                            {/* Order Status Badge */}
                            {isRefunded ? (
                              <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                                <RotateCcw size={11} /> Refunded
                              </span>
                            ) : isDelivered ? (
                              <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                <CheckCircle2 size={11} /> Delivered
                              </span>
                            ) : isShipped ? (
                              <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                                <Truck size={11} /> {order.status}
                              </span>
                            ) : isCancelled ? (
                              <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
                                <Ban size={11} /> Cancelled
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                <Clock size={11} /> {order.status || 'Processing'}
                              </span>
                            )}

                            {/* Payment Status Badge */}
                            <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md flex items-center gap-1 ${
                              order.paymentStatus === 'Paid'
                                ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-700/50'
                                : order.paymentStatus === 'Refunded'
                                ? 'bg-purple-950/70 text-purple-400 border border-purple-700/50'
                                : order.paymentStatus === 'Cancelled'
                                ? 'bg-red-950/70 text-red-400 border border-red-700/50'
                                : (order.paymentMethod?.toLowerCase().includes('cash') || order.paymentMethod?.toLowerCase().includes('cod'))
                                ? 'bg-amber-950/70 text-amber-300 border border-amber-700/50'
                                : 'bg-yellow-950/70 text-yellow-300 border border-yellow-700/50'
                            }`}>
                              {order.paymentStatus === 'Paid' ? (
                                <>
                                  <CheckCircle2 size={11} className="shrink-0 text-emerald-400" />
                                  <span>Payment Completed (Verified)</span>
                                </>
                              ) : order.paymentStatus === 'Refunded' ? (
                                <>
                                  <RotateCcw size={11} className="shrink-0" />
                                  <span>Refunded</span>
                                </>
                              ) : order.paymentStatus === 'Cancelled' ? (
                                <>
                                  <Ban size={11} className="shrink-0" />
                                  <span>Cancelled</span>
                                </>
                              ) : (order.paymentMethod?.toLowerCase().includes('cash') || order.paymentMethod?.toLowerCase().includes('cod')) ? (
                                <>
                                  <Clock size={11} className="shrink-0" />
                                  <span>COD (Pay on Delivery)</span>
                                </>
                              ) : (
                                <span>Payment: Pending</span>
                              )}
                            </span>
                          </div>

                          <p className="text-xs text-gray-300 flex flex-wrap items-center gap-2">
                            <span>Placed: <strong>{formatDateTime(order.createdAt)}</strong></span>
                            <span>•</span>
                            <span className="text-gray-400">{order.paymentMethod || 'Razorpay / Online'}</span>
                            {order.razorpayPaymentId && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-400/90 font-mono text-[11px] bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-800/30">
                                  Ref: {order.razorpayPaymentId}
                                </span>
                              </>
                            )}
                          </p>
                        </div>

                        {/* Top Actions: Total, Track Button, Return/Exchange Button, Cancel Button */}
                        <div className="flex flex-wrap items-center justify-between md:justify-end gap-2.5 pt-2 md:pt-0">
                          <span className="text-base sm:text-lg font-black text-white mr-1">
                            ₹{order.total?.toLocaleString()}
                          </span>

                          <Link
                            to={`/track-order?id=${order.id}`}
                            className="btn-primary py-2 px-3.5 rounded-xl text-xs font-bold uppercase inline-flex items-center gap-1.5"
                          >
                            <Package size={13} />
                            <span>Track Live</span>
                          </Link>

                          {/* Customer Return & Replacement (Available on Delivered Orders) */}
                          {canReturnOrExchange && (
                            <button
                              onClick={() => handleOpenReturn(order)}
                              className="px-3.5 py-2 rounded-xl text-xs font-bold uppercase border border-amber-500/40 hover:border-amber-500/70 text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 transition-all inline-flex items-center gap-1.5 shadow-md"
                            >
                              <Repeat size={13} />
                              <span>Return / Replace</span>
                            </button>
                          )}

                          {/* Customer Cancel Button (Active only before Dispatch / AWB Assignment) */}
                          {canCancel && (
                            <button
                              onClick={() => {
                                setCancellingOrder(order);
                                setCancelError('');
                                setCancelSuccessMsg('');
                                setCancelRemarks('');
                              }}
                              className="px-3.5 py-2 rounded-xl text-xs font-bold uppercase border border-red-500/30 hover:border-red-500/60 text-red-300 hover:text-red-200 bg-red-500/10 hover:bg-red-500/20 transition-all inline-flex items-center gap-1.5"
                            >
                              <Ban size={13} />
                              <span>Cancel Order</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Refund Completed Alert Banner */}
                      {isRefunded && (
                        <div className="flex items-center gap-3 p-3.5 bg-purple-500/10 border border-purple-500/25 rounded-2xl text-xs text-purple-200">
                          <RotateCcw size={18} className="text-purple-400 shrink-0" />
                          <div>
                            <span className="font-bold text-white block text-xs sm:text-sm">Refund Completed</span>
                            <span className="text-purple-300 text-[11px]">
                              Full amount of ₹{order.total?.toLocaleString()} has been processed back to your original payment account.
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Cancelled without refund alert banner */}
                      {isCancelled && (
                        <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/25 rounded-2xl text-xs text-red-200">
                          <Ban size={16} className="text-red-400 shrink-0" />
                          <div>
                            <span className="font-bold text-white block">Order Cancelled</span>
                            <span className="text-red-300 text-[11px]">
                              This order was cancelled. No payment or delivery is pending.
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Courier Tracking Partner AWB Banner */}
                      {order.trackingNumber ? (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 bg-blue-500/10 border border-blue-500/25 rounded-2xl text-xs">
                          <div className="flex items-center gap-2.5 text-blue-300">
                            <Truck size={18} className="shrink-0 text-blue-400" />
                            <div>
                              <span className="font-bold text-white uppercase text-[10px] tracking-wider block">Courier Tracking AWB</span>
                              <span className="font-mono text-blue-200 font-bold text-xs sm:text-sm">{order.trackingNumber}</span>
                              {!isDelivered && !isRefunded && !isCancelled && (
                                <span className="block text-[10px] text-gray-300 mt-0.5">
                                  Package in transit • Cancellation is locked • Eligible for Return/Replace after delivery
                                </span>
                              )}
                            </div>
                          </div>
                          <Link
                            to={`/track-order?id=${order.id}`}
                            className="text-[11px] font-bold text-blue-300 hover:text-white uppercase inline-flex items-center gap-1 bg-blue-500/20 hover:bg-blue-500/30 px-3 py-1.5 rounded-xl border border-blue-500/30 transition-all self-start sm:self-auto"
                          >
                            <span>Track Package</span>
                            <ArrowRight size={12} />
                          </Link>
                        </div>
                      ) : !isRefunded && !isCancelled ? (
                        <div className="flex items-center gap-2.5 p-3 bg-white/5 border border-white/10 rounded-2xl text-[11px] text-gray-300">
                          <Clock size={15} className="text-amber-400 shrink-0" />
                          <span>
                            <strong className="text-white">Order Confirmed:</strong> Courier Tracking ID will be generated and updated here once your parcel is dispatched from atelier.
                          </span>
                        </div>
                      ) : null}

                      {/* Items List */}
                      <div className="space-y-2 pt-1">
                        {order.items?.map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-white/5 last:border-0">
                            <div className="flex items-center gap-3">
                              <img src={item.image} alt="" className="w-12 h-14 object-cover rounded-xl bg-black shrink-0 border border-white/10" />
                              <div>
                                <span className="font-bold text-white block line-clamp-1">{item.name}</span>
                                <div className="text-gray-400 text-[11px] flex items-center gap-2 mt-0.5">
                                  <span>Size: <strong className="text-white">{item.size}</strong></span>
                                  <span>•</span>
                                  <span>Qty: <strong className="text-white">{item.quantity}</strong></span>
                                </div>
                              </div>
                            </div>
                            <span className="font-bold text-white text-xs sm:text-sm">
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Destination & Payment Summary Box */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-[11px] text-gray-300">
                        <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                          <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1 flex items-center gap-1">
                            <MapPin size={11} className="text-brand-red" /> Delivery Address
                          </span>
                          <p className="text-white font-semibold">{order.customerName || order.customer?.fullName || customerUser.fullName}</p>
                          <p className="line-clamp-2 text-gray-300">{order.address || order.customer?.address}</p>
                          <p className="text-gray-300">
                            {[order.city || order.customer?.city, order.state || order.customer?.state].filter(Boolean).join(', ')}
                            {(order.pincode || order.customer?.pincode) ? ` - ${order.pincode || order.customer?.pincode}` : ''}
                          </p>
                        </div>

                        <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1 flex items-center gap-1">
                              <CreditCard size={11} className="text-green-400" /> Payment & Billing
                            </span>
                            <div className="flex justify-between text-gray-300">
                              <span>Method:</span>
                              <span className="text-white font-semibold">{order.paymentMethod || 'Razorpay Online'}</span>
                            </div>
                            <div className="flex justify-between text-gray-300">
                              <span>Items Subtotal:</span>
                              <span className="text-white">₹{(order.subtotal || order.total)?.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="flex justify-between border-t border-white/10 pt-1.5 mt-1 font-bold text-white text-xs">
                            <span>Total Paid:</span>
                            <span className="text-brand-red">₹{order.total?.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 bg-[#121212] border border-white/15 rounded-3xl p-6">
                  <Package size={36} className="text-white/40 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-white uppercase mb-1">No Orders Yet</h3>
                  <p className="text-xs text-gray-400 mb-5">Explore our lookbook and place your first order.</p>
                  <Link to="/shop" className="btn-primary py-2.5 px-6 rounded-xl text-xs font-bold uppercase inline-block">
                    Explore Atelier Collection
                  </Link>
                </div>
              )}
            </div>
          ) : (
            /* Saved Shipping Addresses Tab */
            <div className="space-y-6">
              {/* Header & Add Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 sm:p-6 bg-[#121212] border border-white/15 rounded-3xl">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white uppercase">
                    Saved Shipping Addresses ({savedAddresses.length})
                  </h3>
                  <p className="text-xs text-gray-300 mt-0.5">
                    Manage your delivery addresses for seamless 1-click checkout.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddAddress}
                  className="btn-primary py-2.5 px-4 rounded-xl text-xs font-bold uppercase inline-flex items-center gap-2 self-start sm:self-auto shadow-lg"
                >
                  <Plus size={14} />
                  <span>Add New Address</span>
                </button>
              </div>

              {/* Address Cards Grid */}
              {savedAddresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-5 rounded-3xl border transition-all relative flex flex-col justify-between space-y-4 ${
                        addr.isDefault
                          ? 'bg-[#161616] border-brand-red/50 shadow-xl shadow-brand-red/5'
                          : 'bg-[#121212] border-white/15 hover:border-white/30'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/15 flex items-center gap-1">
                              {addr.tag === 'Work' ? <Briefcase size={10} /> : <Home size={10} />}
                              <span>{addr.tag || 'Home'}</span>
                            </span>
                            {addr.isDefault && (
                              <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-green-500/20 text-green-300 border border-green-500/30 flex items-center gap-1">
                                <Star size={10} /> Default
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditAddress(addr)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-colors"
                              title="Edit address"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => deleteAddress(addr.id)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                              title="Delete address"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        <h4 className="text-sm font-bold text-white mb-0.5">
                          {addr.fullName || customerUser.fullName}
                        </h4>
                        <p className="text-xs text-gray-400 mb-2">{addr.phone || customerUser.phone}</p>

                        <p className="text-xs text-gray-300 line-clamp-2">{addr.address}</p>
                        <p className="text-xs text-gray-300 font-medium">
                          {[addr.city, addr.state].filter(Boolean).join(', ')}
                          {addr.pincode ? ` - ${addr.pincode}` : ''}
                        </p>
                      </div>

                      {/* Set Default Action */}
                      {!addr.isDefault && (
                        <div className="pt-3 border-t border-white/10 flex justify-end">
                          <button
                            onClick={() => setDefaultAddress(addr.id)}
                            className="text-[11px] font-bold uppercase text-gray-400 hover:text-white inline-flex items-center gap-1 transition-colors"
                          >
                            <Star size={12} />
                            <span>Set as Default</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-[#121212] border border-white/15 rounded-3xl p-6">
                  <MapPin size={36} className="text-white/40 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-white uppercase mb-1">No Saved Addresses</h3>
                  <p className="text-xs text-gray-400 mb-5">
                    Add your shipping address for fast and effortless 1-click checkout.
                  </p>
                  <button
                    onClick={handleOpenAddAddress}
                    className="btn-primary py-2.5 px-6 rounded-xl text-xs font-bold uppercase inline-flex items-center gap-2 shadow-xl"
                  >
                    <Plus size={14} />
                    <span>Add Shipping Address</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add / Edit Shipping Address Modal */}
        <AnimatePresence>
          {addressModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto font-inter text-white">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-[#141414] border border-white/20 rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl space-y-4 my-auto relative overflow-hidden"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-brand-red/15 border border-brand-red/30 flex items-center justify-center text-brand-red shrink-0">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-white uppercase">
                        {editingAddressId ? 'Edit Shipping Address' : 'Add New Address'}
                      </h3>
                      <p className="text-[11px] text-gray-400">
                        {editingAddressId ? 'Update your delivery destination details' : 'Save address for faster atelier checkout'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAddressModalOpen(false)}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {addrFormError && (
                  <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded-2xl font-semibold flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{addrFormError}</span>
                  </div>
                )}

                {/* Form Body */}
                <form onSubmit={handleSaveAddress} className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-300 font-bold uppercase text-[11px] mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Aarav Sharma"
                        value={addressForm.fullName}
                        onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                        className="w-full bg-[#1c1c1c] border border-white/20 text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-brand-red font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 font-bold uppercase text-[11px] mb-1">Phone Number (10 digits) *</label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="e.g. 9876543210"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value.replace(/\D/g, '') })}
                        className="w-full bg-[#1c1c1c] border border-white/20 text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-brand-red font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-bold uppercase text-[11px] mb-1">Street Address *</label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Flat, House No., Building, Apartment, Landmark"
                      value={addressForm.address}
                      onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                      className="w-full bg-[#1c1c1c] border border-white/20 text-white text-xs p-3 rounded-xl focus:outline-none focus:border-brand-red font-medium resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-gray-300 font-bold uppercase text-[11px]">PIN Code (6 digits) *</label>
                        {addrPincodeLoading && (
                          <span className="text-[10px] text-brand-red flex items-center gap-1 font-semibold">
                            <Loader2 size={10} className="animate-spin" /> Lookup...
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="e.g. 400050"
                          value={addressForm.pincode}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                            setAddressForm((prev) => ({ ...prev, pincode: val }));
                            if (val.length === 6) {
                              handleAddrModalPincodeLookup(val);
                            } else {
                              setAddrPincodeMsg('');
                            }
                          }}
                          className="w-full bg-[#1c1c1c] border border-white/20 text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-brand-red font-medium"
                        />
                        {addrPincodeMsg && !addrPincodeLoading && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400">
                            <Check size={14} />
                          </div>
                        )}
                      </div>
                      {addrPincodeMsg && (
                        <p className="text-[10px] text-green-400 mt-1 font-semibold truncate">
                          Detected: {addrPincodeMsg}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-300 font-bold uppercase text-[11px] mb-1">City / District *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Mumbai"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="w-full bg-[#1c1c1c] border border-white/20 text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-brand-red font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-bold uppercase text-[11px] mb-1">State *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maharashtra"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      className="w-full bg-[#1c1c1c] border border-white/20 text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-brand-red font-medium"
                    />
                  </div>

                  {/* Address Tag Selector */}
                  <div>
                    <label className="block text-gray-300 font-bold uppercase text-[11px] mb-1.5">Address Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Home', 'Work', 'Other'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setAddressForm({ ...addressForm, tag: t })}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 ${
                            addressForm.tag === t
                              ? 'bg-brand-red text-white border-brand-red shadow-md'
                              : 'bg-[#1c1c1c] border-white/15 text-gray-300 hover:text-white'
                          }`}
                        >
                          {t === 'Work' ? <Briefcase size={12} /> : <Home size={12} />}
                          <span>{t}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Default Checkbox */}
                  <div className="pt-1">
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs text-gray-300 font-medium select-none">
                      <input
                        type="checkbox"
                        checked={addressForm.isDefault}
                        onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                        className="accent-brand-red w-4 h-4 rounded"
                      />
                      <span>Make this my default shipping address</span>
                    </label>
                  </div>

                  {/* Modal Action Buttons */}
                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setAddressModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-white/20 hover:border-white/40 text-gray-300 hover:text-white text-xs font-bold uppercase transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary py-2.5 px-6 rounded-xl text-xs font-bold uppercase shadow-xl"
                    >
                      {editingAddressId ? 'Update Address' : 'Save Address'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Flipkart / Amazon / Shein Style Order Cancellation Modal */}
        <AnimatePresence>
          {cancellingOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-[#141414] border border-white/20 rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl space-y-4 my-auto relative overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                      <Ban size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-white uppercase">
                        Cancel Order #{cancellingOrder.id}
                      </h3>
                      <p className="text-[11px] text-gray-300">
                        Atelier Order Value: <strong className="text-white">₹{cancellingOrder.total?.toLocaleString()}</strong>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCancellingOrder(null)}
                    disabled={cancelSubmitting}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {cancelSuccessMsg ? (
                  <div className="py-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 flex items-center justify-center mx-auto">
                      <CheckCircle2 size={24} />
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-white uppercase">
                      Cancellation Confirmed
                    </h4>
                    <p className="text-xs text-green-300 px-2 font-medium">
                      {cancelSuccessMsg}
                    </p>
                  </div>
                ) : (
                  <>
                    {cancelError && (
                      <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded-2xl font-semibold flex items-center gap-2">
                        <AlertCircle size={15} className="shrink-0" />
                        <span>{cancelError}</span>
                      </div>
                    )}

                    {/* Step 1: Reason Selector */}
                    <div>
                      <label className="block text-xs font-bold text-white uppercase mb-2">
                        Please Select Cancellation Reason *
                      </label>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {CANCELLATION_REASONS.map((r) => (
                          <label
                            key={r}
                            onClick={() => setCancelReason(r)}
                            className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                              cancelReason === r
                                ? 'bg-brand-red/15 border-brand-red/60 text-white font-semibold'
                                : 'bg-[#1a1a1a] border-white/10 text-gray-300 hover:border-white/20'
                            }`}
                          >
                            <input
                              type="radio"
                              name="cancelReason"
                              checked={cancelReason === r}
                              onChange={() => setCancelReason(r)}
                              className="accent-brand-red"
                            />
                            <span>{r}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Step 2: Remarks (Optional) */}
                    <div>
                      <label className="block text-xs font-bold text-white uppercase mb-1">
                        Additional Remarks (Optional)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Any additional feedback or instructions for atelier concierge..."
                        value={cancelRemarks}
                        onChange={(e) => setCancelRemarks(e.target.value)}
                        className="w-full bg-[#1a1a1a] border border-white/15 text-white placeholder-gray-500 text-xs p-3 rounded-xl focus:outline-none focus:border-brand-red font-medium resize-none"
                      />
                    </div>

                    {/* Step 3: Refund Policy Note */}
                    <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-[11px] text-gray-300 space-y-1">
                      <div className="flex items-center gap-1.5 text-white font-bold">
                        <RotateCcw size={13} className="text-purple-400" />
                        <span>Refund & Settlement Policy</span>
                      </div>
                      {cancellingOrder.paymentStatus === 'Paid' ? (
                        <p className="text-gray-300">
                          Since this order is paid online, a full refund of <strong className="text-white">₹{cancellingOrder.total?.toLocaleString()}</strong> will be initiated automatically to your original payment method within 3-5 banking days.
                        </p>
                      ) : (
                        <p className="text-gray-300">
                          This is a Cash on Delivery order. It will be cancelled immediately and no payment is required.
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => setCancellingOrder(null)}
                        disabled={cancelSubmitting}
                        className="px-4 py-2.5 rounded-xl border border-white/20 hover:border-white/40 text-gray-300 hover:text-white text-xs font-bold uppercase transition-all"
                      >
                        Keep Order
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmCancellation}
                        disabled={cancelSubmitting}
                        className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase transition-all shadow-xl flex items-center gap-2"
                      >
                        {cancelSubmitting ? (
                          <>
                            <Loader2 size={13} className="animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <Ban size={13} />
                            <span>Confirm Cancellation</span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Fashion eCommerce Style Return & Replacement Modal */}
        <AnimatePresence>
          {returnOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-[#141414] border border-white/20 rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl space-y-4 my-auto relative overflow-hidden text-white font-inter"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      <Repeat size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-white uppercase">
                        Return / Replace #{returnOrder.id}
                      </h3>
                      <p className="text-[11px] text-gray-300">
                        7-Day Atelier Quality & Fit Guarantee
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setReturnOrder(null)}
                    disabled={returnSubmitting}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {returnSuccessMsg ? (
                  <div className="py-6 text-center space-y-3">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
                      <CheckCircle2 size={28} />
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-white uppercase">
                      Request Registered
                    </h4>
                    <p className="text-xs text-emerald-300 px-3 font-medium leading-relaxed">
                      {returnSuccessMsg}
                    </p>
                    <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-[11px] text-gray-300 mx-2 text-left space-y-1">
                      <p className="text-white font-semibold flex items-center gap-1.5">
                        <Truck size={13} className="text-blue-400" /> Reverse Logistics Step:
                      </p>
                      <p className="text-gray-300">
                        Please keep the garment unused with original tags attached. Our courier executive will contact you prior to pickup.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {returnError && (
                      <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded-2xl font-semibold flex items-center gap-2">
                        <AlertCircle size={15} className="shrink-0" />
                        <span>{returnError}</span>
                      </div>
                    )}

                    {/* Step 1: Mode Switcher (Exchange vs Return) */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-[#1c1c1c] border border-white/15 rounded-2xl">
                      <button
                        type="button"
                        onClick={() => {
                          setReturnType('EXCHANGE_REPLACEMENT');
                          setReturnReason(EXCHANGE_REASONS[0]);
                          setReturnError('');
                        }}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                          returnType === 'EXCHANGE_REPLACEMENT'
                            ? 'bg-amber-500 text-black shadow-lg font-black'
                            : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        <Repeat size={14} />
                        <span>Size Exchange</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReturnType('RETURN_REFUND');
                          setReturnReason(RETURN_REASONS[0]);
                          setReturnError('');
                        }}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                          returnType === 'RETURN_REFUND'
                            ? 'bg-brand-red text-white shadow-lg font-black'
                            : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        <RotateCcw size={14} />
                        <span>Return & Refund</span>
                      </button>
                    </div>

                    {/* Step 2: Item Selection (if multiple items) */}
                    {returnOrder.items && returnOrder.items.length > 1 && (
                      <div>
                        <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1.5">
                          Select Item to {returnType === 'EXCHANGE_REPLACEMENT' ? 'Exchange' : 'Return'} *
                        </label>
                        <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                          {returnOrder.items.map((it) => (
                            <label
                              key={it.id}
                              onClick={() => setSelectedItemId(it.id)}
                              className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                                selectedItemId === it.id
                                  ? 'bg-white/10 border-white/40 text-white font-semibold'
                                  : 'bg-[#1a1a1a] border-white/10 text-gray-400'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="selectedReturnItem"
                                  checked={selectedItemId === it.id}
                                  onChange={() => setSelectedItemId(it.id)}
                                  className="accent-brand-red"
                                />
                                <span>{it.name} ({it.size})</span>
                              </div>
                              <span className="font-bold text-white">₹{it.price?.toLocaleString()}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 3: Size Selection for Replacement */}
                    {returnType === 'EXCHANGE_REPLACEMENT' && (
                      <div>
                        <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1.5">
                          Select Replacement Size *
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {AVAILABLE_SIZES.map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => setReplacementSize(sz)}
                              className={`py-2 px-2 text-xs font-bold uppercase rounded-xl border transition-all text-center ${
                                replacementSize === sz
                                  ? 'bg-white text-black border-white shadow-md font-black'
                                  : 'bg-[#1c1c1c] border-white/15 text-gray-300 hover:text-white'
                              }`}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 4: Reason Selector */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1.5">
                        Reason for {returnType === 'EXCHANGE_REPLACEMENT' ? 'Replacement' : 'Return'} *
                      </label>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {(returnType === 'EXCHANGE_REPLACEMENT' ? EXCHANGE_REASONS : RETURN_REASONS).map((r) => (
                          <label
                            key={r}
                            onClick={() => setReturnReason(r)}
                            className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                              returnReason === r
                                ? 'bg-white/10 border-white/40 text-white font-semibold'
                                : 'bg-[#1a1a1a] border-white/10 text-gray-400 hover:border-white/20'
                            }`}
                          >
                            <input
                              type="radio"
                              name="returnReasonOption"
                              checked={returnReason === r}
                              onChange={() => setReturnReason(r)}
                              className="accent-brand-red"
                            />
                            <span>{r}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Step 5: Remarks */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">
                        Fitting / Atelier Feedback (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Any notes for atelier master tailor or courier..."
                        value={returnRemarks}
                        onChange={(e) => setReturnRemarks(e.target.value)}
                        className="w-full bg-[#1c1c1c] border border-white/15 text-white placeholder-gray-500 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-brand-red font-medium"
                      />
                    </div>

                    {/* Step 6: Refund Destination Details for Cash on Delivery (COD) */}
                    {returnType === 'RETURN_REFUND' && returnOrder.paymentMethod?.includes('Cash on Delivery') ? (
                      <div className="p-3.5 bg-brand-red/10 border border-brand-red/30 rounded-2xl space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-white uppercase flex items-center gap-1.5">
                            <ShieldCheck size={14} className="text-brand-red" />
                            <span>COD Refund Transfer Details:</span>
                          </span>
                          <div className="flex gap-1 bg-[#1a1a1a] p-0.5 rounded-lg border border-white/10">
                            <button
                              type="button"
                              onClick={() => setCodRefundMethod('UPI')}
                              className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                                codRefundMethod === 'UPI' ? 'bg-white text-black' : 'text-gray-400'
                              }`}
                            >
                              UPI ID
                            </button>
                            <button
                              type="button"
                              onClick={() => setCodRefundMethod('BANK')}
                              className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                                codRefundMethod === 'BANK' ? 'bg-white text-black' : 'text-gray-400'
                              }`}
                            >
                              Bank A/C
                            </button>
                          </div>
                        </div>

                        {codRefundMethod === 'UPI' ? (
                          <div>
                            <label className="block text-[10px] font-bold text-gray-300 uppercase mb-1">
                              Enter UPI ID (e.g. 9876543210@upi or name@oksbi) *
                            </label>
                            <div className="relative">
                              <Smartphone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input
                                type="text"
                                placeholder="name@upi / phone@okhdfcbank"
                                value={codUpiId}
                                onChange={(e) => setCodUpiId(e.target.value)}
                                className="w-full bg-[#181818] border border-white/20 text-white placeholder-gray-500 text-xs pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-brand-red font-medium"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-300 uppercase mb-1">
                                Account Holder Name *
                              </label>
                              <input
                                type="text"
                                placeholder="As per bank passbook"
                                value={codBank.accountHolder}
                                onChange={(e) => setCodBank({ ...codBank, accountHolder: e.target.value })}
                                className="w-full bg-[#181818] border border-white/20 text-white text-xs px-3 py-1.5 rounded-xl focus:outline-none focus:border-brand-red"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-gray-300 uppercase mb-1">
                                  Account Number *
                                </label>
                                <input
                                  type="password"
                                  placeholder="Bank Account Number"
                                  value={codBank.accountNumber}
                                  onChange={(e) => setCodBank({ ...codBank, accountNumber: e.target.value })}
                                  className="w-full bg-[#181818] border border-white/20 text-white text-xs px-3 py-1.5 rounded-xl focus:outline-none focus:border-brand-red"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-gray-300 uppercase mb-1">
                                  Re-enter Account No. *
                                </label>
                                <input
                                  type="text"
                                  placeholder="Confirm Account Number"
                                  value={codBank.confirmAccountNumber}
                                  onChange={(e) => setCodBank({ ...codBank, confirmAccountNumber: e.target.value })}
                                  className="w-full bg-[#181818] border border-white/20 text-white text-xs px-3 py-1.5 rounded-xl focus:outline-none focus:border-brand-red"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-gray-300 uppercase mb-1">
                                  IFSC Code *
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. HDFC0001234"
                                  value={codBank.ifscCode}
                                  onChange={(e) => setCodBank({ ...codBank, ifscCode: e.target.value.toUpperCase() })}
                                  className="w-full bg-[#181818] border border-white/20 text-white text-xs px-3 py-1.5 rounded-xl focus:outline-none focus:border-brand-red uppercase font-mono"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-gray-300 uppercase mb-1">
                                  Bank Name
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. HDFC Bank"
                                  value={codBank.bankName}
                                  onChange={(e) => setCodBank({ ...codBank, bankName: e.target.value })}
                                  className="w-full bg-[#181818] border border-white/20 text-white text-xs px-3 py-1.5 rounded-xl focus:outline-none focus:border-brand-red"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : returnType === 'RETURN_REFUND' ? (
                      <div className="p-3 bg-purple-500/10 border border-purple-500/25 rounded-2xl text-[11px] text-purple-200 flex items-center gap-2.5">
                        <CreditCard size={16} className="text-purple-400 shrink-0" />
                        <div>
                          <strong className="text-white block">Online Payment Source Refund:</strong>
                          <span>
                            ₹{returnOrder.total?.toLocaleString()} will be automatically refunded back to your original payment method (UPI / Card / NetBanking) within 3-5 banking days after reverse pickup inspection.
                          </span>
                        </div>
                      </div>
                    ) : null}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setReturnOrder(null)}
                        disabled={returnSubmitting}
                        className="px-4 py-2.5 rounded-xl border border-white/20 hover:border-white/40 text-gray-300 hover:text-white text-xs font-bold uppercase transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmReturnOrExchange}
                        disabled={returnSubmitting}
                        className="btn-primary py-2.5 px-6 rounded-xl text-xs font-bold uppercase shadow-xl flex items-center gap-2"
                      >
                        {returnSubmitting ? (
                          <>
                            <Loader2 size={13} className="animate-spin" />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <>
                            <Repeat size={13} />
                            <span>{returnType === 'EXCHANGE_REPLACEMENT' ? 'Submit Exchange Request' : 'Submit Return Request'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-brand-black flex flex-col items-center justify-center px-4 py-8 md:py-12 pb-24 md:pb-16 relative overflow-hidden font-inter text-white">
      {/* Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-red/10 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md z-10 my-2 sm:my-6"
      >
        <div className="bg-[#121212] border border-white/20 rounded-3xl p-5 sm:p-8 md:p-10 shadow-2xl">
          {/* Logo & Header */}
          <div className="text-center mb-5 sm:mb-6">
            <div className="flex justify-center mb-3">
              <MontarawLogo iconSize="w-9 h-9" textSize="text-xl" />
            </div>
            <h1 className="text-base sm:text-lg font-black text-white uppercase">
              {isRegister ? 'Create Account' : 'Customer Sign In'}
            </h1>
            <p className="text-xs text-gray-300 mt-1">
              Access your order timeline, saved address, and fast checkout
            </p>
          </div>

          {/* Switcher */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#181818] border border-white/15 rounded-xl mb-4 sm:mb-5">
            <button
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`py-2 text-xs font-bold uppercase rounded-lg transition-all ${
                !isRegister ? 'bg-white text-black shadow-md' : 'text-gray-300 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsRegister(true); setError(''); }}
              className={`py-2 text-xs font-bold uppercase rounded-lg transition-all ${
                isRegister ? 'bg-white text-black shadow-md' : 'text-gray-300 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-4 text-xs text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded-xl font-semibold">
              {error}
            </div>
          )}

          {!isRegister ? (
            /* Sign In */
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-white uppercase mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. customer@example.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="w-full bg-[#181818] border border-white/20 text-white placeholder-gray-400 text-xs pl-10 pr-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white uppercase mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full bg-[#181818] border border-white/20 text-white placeholder-gray-400 text-xs pl-10 pr-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full btn-primary py-3.5 rounded-xl text-xs font-bold uppercase shadow-xl flex items-center justify-center gap-2 mt-2"
              >
                <span>Sign In to Account</span>
                <ArrowRight size={15} />
              </button>
            </form>
          ) : (
            /* Registration */
            <form onSubmit={handleRegSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-white uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={regForm.fullName}
                  onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                  className="w-full bg-[#181818] border border-white/20 text-white placeholder-gray-400 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-brand-red font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white uppercase mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. aarav@example.com"
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  className="w-full bg-[#181818] border border-white/20 text-white placeholder-gray-400 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-brand-red font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-white uppercase mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    maxLength={10}
                    value={regForm.phone}
                    onChange={(e) => setRegForm({ ...regForm, phone: e.target.value.replace(/\D/g, '') })}
                    className="w-full bg-[#181818] border border-white/20 text-white placeholder-gray-400 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-brand-red font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white uppercase mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    className="w-full bg-[#181818] border border-white/20 text-white placeholder-gray-400 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-brand-red"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full btn-primary py-3.5 rounded-xl text-xs font-bold uppercase shadow-xl flex items-center justify-center gap-2 mt-2"
              >
                <span>Register Account</span>
                <ArrowRight size={15} />
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
