import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Search, CheckCircle2, Clock } from 'lucide-react';
import { useOrders } from '../context/OrderContext';

export default function TrackOrderPage() {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';
  const { getOrderById, getOrdersByContact } = useOrders();

  const [query, setQuery] = useState(initialId);
  const [searchedOrder, setSearchedOrder] = useState(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialId) {
      const found = getOrderById(initialId);
      setSearchedOrder(found);
      setSearched(true);
    }
  }, [initialId, getOrderById]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const byId = getOrderById(query);
    if (byId) {
      setSearchedOrder(byId);
    } else {
      const byContact = getOrdersByContact(query);
      setSearchedOrder(byContact.length > 0 ? byContact[0] : null);
    }
    setSearched(true);
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

          {/* Quick Demo Hint */}
          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-300">
            <span>Sample orders:</span>
            <button
              onClick={() => {
                setQuery('MTR-88421');
                const found = getOrderById('MTR-88421');
                setSearchedOrder(found);
                setSearched(true);
              }}
              className="text-white font-mono font-bold underline"
            >
              MTR-88421
            </button>
            <span>or</span>
            <button
              onClick={() => {
                setQuery('MTR-88410');
                const found = getOrderById('MTR-88410');
                setSearchedOrder(found);
                setSearched(true);
              }}
              className="text-white font-mono font-bold underline"
            >
              MTR-88410
            </button>
          </div>
        </div>

        {/* Results Card */}
        {searched && searchedOrder ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#121212] border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6"
          >
            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/15">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-lg md:text-2xl font-black text-white font-mono">
                    {searchedOrder.id}
                  </span>
                  <span
                    className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${
                      searchedOrder.status === 'Delivered'
                        ? 'bg-green-500/20 text-green-300 border-green-500/40'
                        : searchedOrder.status === 'Shipped'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                    }`}
                  >
                    {searchedOrder.status}
                  </span>
                </div>
                <p className="text-xs text-gray-300">
                  Placed on {new Date(searchedOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>

              {searchedOrder.trackingNumber && (
                <div className="bg-[#181818] px-4 py-2 rounded-xl border border-white/15 text-xs">
                  <span className="text-gray-300 block text-[10px] uppercase font-bold">Tracking AWB:</span>
                  <span className="text-white font-mono font-bold">{searchedOrder.trackingNumber}</span>
                </div>
              )}
            </div>

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
                <p className="text-white font-bold">{searchedOrder.customer?.fullName}</p>
                <p className="text-gray-200 text-xs">{searchedOrder.customer?.address}</p>
                <p className="text-gray-200 text-xs">{searchedOrder.customer?.city}, {searchedOrder.customer?.state} - {searchedOrder.customer?.pincode}</p>
              </div>

              <div className="p-3.5 bg-[#181818] border border-white/15 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-gray-300 uppercase block mb-1">
                  Payment
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
      </div>
    </div>
  );
}
