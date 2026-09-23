import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Search, CheckCircle2, Clock, Truck, RotateCcw, Ban, AlertCircle, X, Loader2, Repeat, ShieldCheck, Smartphone, CreditCard } from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { api } from '../api/client';
import OrderTrackingSkeleton from '../components/ui/loading/OrderTrackingSkeleton';

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

export default function TrackOrderPage() {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';
  const { getOrderById, getOrdersByContact, cancelOrder, requestReturnOrExchange } = useOrders();

  const [query, setQuery] = useState(initialId);
  const [searchedOrder, setSearchedOrder] = useState(null);
  const [searched, setSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Cancellation Modal State
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState(CANCELLATION_REASONS[0]);
  const [cancelRemarks, setCancelRemarks] = useState('');
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState('');

  // Return & Replacement Modal State
  const [returnOrder, setReturnOrder] = useState(null);
  const [returnType, setReturnType] = useState('EXCHANGE_REPLACEMENT');
  const [returnReason, setReturnReason] = useState(EXCHANGE_REASONS[0]);
  const [returnRemarks, setReturnRemarks] = useState('');
  const [replacementSize, setReplacementSize] = useState('M');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [codRefundMethod, setCodRefundMethod] = useState('UPI');
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

  useEffect(() => {
    async function initTrack() {
      if (!initialId) return;
      const found = getOrderById(initialId);
      if (found) {
        setSearchedOrder(found);
        setSearched(true);
      } else {
        try {
          setIsSearching(true);
          const res = await api.trackOrder(initialId);
          if (res && res.order) {
            setSearchedOrder(res.order);
          }
        } catch {
          // ignore
        } finally {
          setIsSearching(false);
          setSearched(true);
        }
      }
    }
    initTrack();
  }, [initialId, getOrderById]);

  const handleSearch = async (e) => {
    e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    setIsSearching(true);
    const byId = getOrderById(cleanQuery);
    if (byId) {
      setSearchedOrder(byId);
      setSearched(true);
      setIsSearching(false);
      return;
    }

    const byContact = getOrdersByContact(cleanQuery);
    if (byContact.length > 0) {
      setSearchedOrder(byContact[0]);
      setSearched(true);
      setIsSearching(false);
      return;
    }

    // Try backend live lookup
    try {
      const res = await api.trackOrder(cleanQuery);
      if (res && res.order) {
        setSearchedOrder(res.order);
      } else {
        setSearchedOrder(null);
      }
    } catch {
      setSearchedOrder(null);
    } finally {
      setSearched(true);
      setIsSearching(false);
    }
  };

  const handleConfirmCancellation = async () => {
    if (!cancellingOrder) return;
    setCancelSubmitting(true);
    setCancelError('');

    try {
      const res = await cancelOrder(cancellingOrder.id, {
        reason: cancelReason,
        remarks: cancelRemarks,
        customerEmail: cancellingOrder.customerEmail || cancellingOrder.customer?.email,
        customerPhone: cancellingOrder.customerPhone || cancellingOrder.customer?.phone,
      });

      if (res?.success) {
        setCancelSuccessMsg(res.message || `Order #${cancellingOrder.id} has been cancelled successfully.`);
        if (res.order) {
          setSearchedOrder(res.order);
        }
        setTimeout(() => {
          setCancellingOrder(null);
          setCancelSuccessMsg('');
          setCancelRemarks('');
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
      accountHolder: order.customerName || order.customer?.fullName || '',
      accountNumber: '',
      confirmAccountNumber: '',
      ifscCode: '',
      bankName: '',
    });
    setReturnError('');
    setReturnSuccessMsg('');
  };

  const handleConfirmReturnOrExchange = async () => {
    if (!returnOrder) return;
    setReturnSubmitting(true);
    setReturnError('');

    try {
      const isCod = returnOrder.paymentMethod?.includes('Cash on Delivery');
      let bankDetails = null;

      if (returnType === 'RETURN_REFUND' && isCod) {
        if (codRefundMethod === 'UPI') {
          if (!codUpiId || !codUpiId.includes('@')) {
            setReturnError('Please enter a valid UPI ID (e.g. 9876543210@upi or name@oksbi)');
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
        customerEmail: returnOrder.customerEmail || returnOrder.customer?.email,
        customerPhone: returnOrder.customerPhone || returnOrder.customer?.phone,
      });

      if (res?.success) {
        setReturnSuccessMsg(res.message || 'Return / Exchange request submitted successfully.');
        setTimeout(() => {
          setReturnOrder(null);
          setReturnSuccessMsg('');
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

  const isRefunded = searchedOrder?.paymentStatus === 'Refunded' || searchedOrder?.status === 'Refunded';
  const hasTracking = searchedOrder?.trackingNumber && searchedOrder.trackingNumber.trim().length > 0;
  const canCancel =
    searchedOrder &&
    ['Processing', 'Pending', 'Order Confirmed'].includes(searchedOrder.status) &&
    !hasTracking &&
    searchedOrder.status !== 'Cancelled' &&
    searchedOrder.status !== 'Refunded' &&
    searchedOrder.paymentStatus !== 'Refunded';
  const canReturnOrExchange = searchedOrder?.status === 'Delivered' && !isRefunded && searchedOrder?.status !== 'Cancelled';

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

  const getStepIndex = (status) => {
    switch (status?.toLowerCase()) {
      case 'processing':
        return 1;
      case 'shipped':
        return 2;
      case 'out for delivery':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 0;
    }
  };

  const currentStep = searchedOrder ? getStepIndex(searchedOrder.status) : 0;

  const timelineSteps = [
    { title: 'Order Confirmed', desc: 'Atelier received order details' },
    { title: 'Processing', desc: 'Garment inspected & packaged' },
    { title: 'Shipped', desc: 'In transit with courier' },
    { title: 'Out for Delivery', desc: 'Delivery partner on the way' },
    { title: 'Delivered', desc: 'Safely delivered to customer' },
  ];

  return (
    <div className="pt-8 md:pt-12 pb-20 min-h-screen bg-brand-black font-inter text-white">
      <div className="max-w-[1000px] mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-brand-red text-xs font-bold uppercase block mb-1">
            EXPRESS LOGISTICS
          </span>
          <h1 className="text-2xl md:text-4xl font-black text-white uppercase mb-2">
            TRACK YOUR ORDER
          </h1>
          <p className="text-sm text-gray-200">
            Enter your Order ID (e.g. <strong className="text-white font-mono">MTR-88421</strong>) or mobile number to track delivery.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-10">
          <form onSubmit={handleSearch} className="flex gap-2 bg-[#141414] p-2 rounded-2xl border border-white/20 shadow-xl">
            <div className="flex-1 flex items-center pl-3 gap-2">
              <Search size={18} className="text-white" />
              <input
                type="text"
                placeholder="Enter Order ID or Mobile Number"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder-gray-400 focus:outline-none font-medium"
              />
            </div>
            <button
              type="submit"
              className="btn-primary py-3 px-6 text-xs font-bold uppercase rounded-xl shrink-0"
            >
              Track Order
            </button>
          </form>
        </div>

        {/* Searching Loader State */}
        {isSearching && (
          <div className="mt-6">
            <OrderTrackingSkeleton />
          </div>
        )}

        {/* Results Card */}
        {!isSearching && searched && searchedOrder ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#121212] border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6"
          >
            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/15">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <span className="text-lg md:text-2xl font-black text-white font-mono">
                    {searchedOrder.id}
                  </span>
                  
                  {isRefunded ? (
                    <span className="text-xs font-bold uppercase px-3 py-1 rounded-full border bg-purple-500/20 text-purple-300 border-purple-500/40 flex items-center gap-1.5">
                      <RotateCcw size={12} /> Refunded
                    </span>
                  ) : searchedOrder.status === 'Delivered' ? (
                    <span className="text-xs font-bold uppercase px-3 py-1 rounded-full border bg-emerald-500/20 text-emerald-300 border-emerald-500/40 flex items-center gap-1.5">
                      <CheckCircle2 size={12} /> Delivered
                    </span>
                  ) : searchedOrder.status === 'Shipped' || searchedOrder.status === 'Out for Delivery' ? (
                    <span className="text-xs font-bold uppercase px-3 py-1 rounded-full border bg-blue-500/20 text-blue-300 border-blue-500/40 flex items-center gap-1.5">
                      <Truck size={12} /> {searchedOrder.status}
                    </span>
                  ) : searchedOrder.status === 'Cancelled' ? (
                    <span className="text-xs font-bold uppercase px-3 py-1 rounded-full border bg-red-500/20 text-red-300 border-red-500/40">
                      Cancelled
                    </span>
                  ) : (
                    <span className="text-xs font-bold uppercase px-3 py-1 rounded-full border bg-amber-500/20 text-amber-300 border-amber-500/40 flex items-center gap-1.5">
                      <Clock size={12} /> {searchedOrder.status || 'Processing'}
                    </span>
                  )}

                  <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md flex items-center gap-1 ${
                    searchedOrder.paymentStatus === 'Paid'
                      ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-700/50'
                      : searchedOrder.paymentStatus === 'Refunded'
                      ? 'bg-purple-950/70 text-purple-400 border border-purple-700/50'
                      : searchedOrder.paymentStatus === 'Cancelled'
                      ? 'bg-red-950/70 text-red-400 border border-red-700/50'
                      : (searchedOrder.paymentMethod?.toLowerCase().includes('cash') || searchedOrder.paymentMethod?.toLowerCase().includes('cod'))
                      ? 'bg-amber-950/70 text-amber-300 border border-amber-700/50'
                      : 'bg-yellow-950/70 text-yellow-300 border border-yellow-700/50'
                  }`}>
                    {searchedOrder.paymentStatus === 'Paid' ? (
                      <>
                        <CheckCircle2 size={11} className="shrink-0 text-emerald-400" />
                        <span>Payment Completed (Verified)</span>
                      </>
                    ) : searchedOrder.paymentStatus === 'Refunded' ? (
                      <>
                        <RotateCcw size={11} className="shrink-0" />
                        <span>Refunded</span>
                      </>
                    ) : searchedOrder.paymentStatus === 'Cancelled' ? (
                      <>
                        <Ban size={11} className="shrink-0" />
                        <span>Cancelled</span>
                      </>
                    ) : (searchedOrder.paymentMethod?.toLowerCase().includes('cash') || searchedOrder.paymentMethod?.toLowerCase().includes('cod')) ? (
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
                  <span>Placed: <strong className="text-white">{formatDateTime(searchedOrder.createdAt)}</strong></span>
                  <span>•</span>
                  <span className="text-gray-400">{searchedOrder.paymentMethod || 'Online Payment'}</span>
                  {searchedOrder.razorpayPaymentId && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-400/90 font-mono text-[11px] bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-800/30">
                        Ref: {searchedOrder.razorpayPaymentId}
                      </span>
                    </>
                  )}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {searchedOrder.trackingNumber && (
                  <div className="bg-blue-500/10 border border-blue-500/30 px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2.5 text-blue-300">
                    <Truck size={18} className="text-blue-400 shrink-0" />
                    <div>
                      <span className="text-white block text-[10px] uppercase font-bold tracking-wider">Courier AWB / Tracking ID</span>
                      <span className="text-blue-200 font-mono font-bold text-sm">{searchedOrder.trackingNumber}</span>
                      {searchedOrder.status !== 'Delivered' && !isRefunded && searchedOrder.status !== 'Cancelled' && (
                        <span className="block text-[10px] text-gray-300 mt-0.5">
                          In transit • Cancellation locked • Return/Exchange available upon delivery
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {canReturnOrExchange && (
                  <button
                    onClick={() => handleOpenReturn(searchedOrder)}
                    className="px-4 py-2 rounded-xl text-xs font-bold uppercase border border-amber-500/40 hover:border-amber-500/70 text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 transition-all inline-flex items-center gap-1.5 shadow-md"
                  >
                    <Repeat size={13} />
                    <span>Return / Replace</span>
                  </button>
                )}

                {canCancel && (
                  <button
                    onClick={() => {
                      setCancellingOrder(searchedOrder);
                      setCancelError('');
                      setCancelSuccessMsg('');
                      setCancelRemarks('');
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold uppercase border border-red-500/30 hover:border-red-500/60 text-red-300 hover:text-red-200 bg-red-500/10 hover:bg-red-500/20 transition-all inline-flex items-center gap-1.5"
                  >
                    <Ban size={13} />
                    <span>Cancel Order</span>
                  </button>
                )}
              </div>
            </div>

            {/* Refund Alert Banner */}
            {isRefunded && (
              <div className="flex items-center gap-3 p-4 bg-purple-500/15 border border-purple-500/30 rounded-2xl text-xs text-purple-200">
                <RotateCcw size={20} className="text-purple-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-white text-sm">Order Refund Completed</h4>
                  <p className="text-purple-300 mt-0.5">
                    A full refund of <strong className="text-white">₹{searchedOrder.total?.toLocaleString()}</strong> has been initiated and settled to your original payment account.
                  </p>
                </div>
              </div>
            )}

            {/* Awaiting Courier Dispatch Notice */}
            {!searchedOrder.trackingNumber && !isRefunded && searchedOrder.status !== 'Cancelled' && (
              <div className="flex items-center gap-3 p-3.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-gray-300">
                <Clock size={18} className="text-amber-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-white text-xs">Order Confirmed & In Preparation</h4>
                  <p className="text-gray-400 text-[11px] mt-0.5">
                    Courier Partner and AWB Tracking ID will appear here as soon as our atelier dispatches your package.
                  </p>
                </div>
              </div>
            )}

            {/* Visual Step Timeline */}
            <div>
              <h3 className="text-xs font-bold text-white uppercase mb-4">
                Shipment Timeline
              </h3>
              <div className="relative">
                <div className="hidden sm:block absolute top-5 left-6 right-6 h-0.5 bg-white/20 z-0" />
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
                  {timelineSteps.map((step, idx) => {
                    const isDone = idx <= currentStep;
                    return (
                      <div key={step.title} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all shrink-0 ${
                            isDone
                              ? 'bg-brand-red border-brand-red text-white shadow-lg'
                              : 'bg-[#181818] border-white/30 text-gray-400'
                          }`}
                        >
                          {isDone ? <CheckCircle2 size={16} /> : <Clock size={15} />}
                        </div>
                        <div>
                          <p
                            className={`text-xs font-bold uppercase ${
                              isDone ? 'text-white' : 'text-gray-400'
                            }`}
                          >
                            {step.title}
                          </p>
                          <p className="text-[11px] text-gray-300 mt-0.5">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Ordered Items Grid */}
            <div className="pt-4 border-t border-white/15">
              <h3 className="text-xs font-bold text-white uppercase mb-3">
                Items in This Order ({searchedOrder.items?.length})
              </h3>
              <div className="space-y-2.5">
                {searchedOrder.items?.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-[#181818] border border-white/10">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-12 h-14 object-cover rounded-xl bg-black" />
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">{item.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-300 mt-0.5">
                          <span>Size: <strong className="text-white">{item.size}</strong></span>
                          <span>•</span>
                          <span>Qty: <strong className="text-white">{item.quantity}</strong></span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm font-black text-white">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer & Payment Meta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-white/15 text-xs">
              <div className="p-3.5 bg-[#181818] border border-white/15 rounded-2xl">
                <span className="text-[10px] font-bold text-gray-300 uppercase block mb-1">
                  Delivery Destination
                </span>
                <p className="text-white font-bold">{searchedOrder.customer?.fullName || searchedOrder.customerName || 'Customer'}</p>
                <p className="text-gray-200 text-xs">{searchedOrder.customer?.address || searchedOrder.address}</p>
                <p className="text-gray-200 text-xs">
                  {[searchedOrder.customer?.city || searchedOrder.city, searchedOrder.customer?.state || searchedOrder.state]
                    .filter(Boolean)
                    .join(', ')}
                  {(searchedOrder.customer?.pincode || searchedOrder.pincode)
                    ? ` - ${searchedOrder.customer?.pincode || searchedOrder.pincode}`
                    : ''}
                </p>
              </div>

              <div className="p-3.5 bg-[#181818] border border-white/15 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-gray-300 uppercase block mb-1">
                  Payment Details
                </span>
                <div className="flex justify-between text-gray-200">
                  <span>Method:</span>
                  <span className="text-white font-bold">{searchedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-gray-200">
                  <span>Total Amount:</span>
                  <span className="text-white font-black text-sm">₹{searchedOrder.total?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : searched ? (
          <div className="text-center py-12 bg-[#121212] border border-white/15 rounded-3xl p-6 max-w-lg mx-auto">
            <Package size={36} className="text-white mx-auto mb-2" />
            <h3 className="text-base font-bold text-white uppercase mb-1">
              Order Not Found
            </h3>
            <p className="text-xs text-gray-300 mb-5">
              We couldn't find an order matching "{query}". Please check the ID and try again.
            </p>
            <Link to="/shop" className="btn-primary py-2.5 px-5 text-xs uppercase rounded-xl inline-block font-bold">
              Continue Shopping
            </Link>
          </div>
        ) : null}

        {/* Cancellation Modal for Track Order Page */}
        <AnimatePresence>
          {cancellingOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-[#141414] border border-white/20 rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl space-y-4 my-auto relative overflow-hidden"
              >
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
                        Refund Amount: <strong className="text-white">₹{cancellingOrder.total?.toLocaleString()}</strong>
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
                              name="cancelReasonTrack"
                              checked={cancelReason === r}
                              onChange={() => setCancelReason(r)}
                              className="accent-brand-red"
                            />
                            <span>{r}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-white uppercase mb-1">
                        Additional Remarks (Optional)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Any additional feedback for cancellation..."
                        value={cancelRemarks}
                        onChange={(e) => setCancelRemarks(e.target.value)}
                        className="w-full bg-[#1a1a1a] border border-white/15 text-white placeholder-gray-500 text-xs p-3 rounded-xl focus:outline-none focus:border-brand-red font-medium resize-none"
                      />
                    </div>

                    <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-[11px] text-gray-300 space-y-1">
                      <div className="flex items-center gap-1.5 text-white font-bold">
                        <RotateCcw size={13} className="text-purple-400" />
                        <span>Refund Policy Note</span>
                      </div>
                      {cancellingOrder.paymentStatus === 'Paid' ? (
                        <p className="text-gray-300">
                          Since this order is paid online, a full refund of <strong className="text-white">₹{cancellingOrder.total?.toLocaleString()}</strong> will be initiated automatically to your original payment method.
                        </p>
                      ) : (
                        <p className="text-gray-300">
                          Cash on Delivery order will be immediately cancelled with no dues.
                        </p>
                      )}
                    </div>

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
                        Please keep the garment unused with original tags attached. Our courier partner will arrange pickup from your registered address.
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
                                  name="selectedReturnItemTrack"
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
                              name="returnReasonOptionTrack"
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
                        placeholder="Any notes for atelier concierge or courier..."
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
                            ₹{returnOrder.total?.toLocaleString()} will be automatically credited back to your original payment method within 3-5 banking days after reverse pickup inspection.
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
    </div>
  );
}
