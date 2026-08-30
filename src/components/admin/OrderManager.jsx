import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Eye, X, Package, CheckCircle2 } from 'lucide-react';
import { useOrders } from '../../context/OrderContext';

export default function OrderManager() {
  const { orders, updateOrderStatus } = useOrders();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status?.toLowerCase() === statusFilter.toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      order.id.toLowerCase().includes(q) ||
      order.customer?.fullName?.toLowerCase().includes(q) ||
      order.customer?.phone?.includes(q) ||
      order.customer?.city?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-500/20 text-green-300 border-green-500/40';
      case 'shipped':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'processing':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      case 'cancelled':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      default:
        return 'bg-white/10 text-gray-200 border-white/20';
    }
  };

  return (
    <div className="space-y-6 font-inter text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <span className="text-brand-red text-xs font-bold uppercase block mb-0.5">
            FULFILLMENT CENTER
          </span>
          <h2 className="text-xl md:text-3xl font-black text-white uppercase">
            Customer Orders ({filteredOrders.length})
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Track, update shipping status, and generate invoice slips.
          </p>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#141414] p-3 rounded-2xl border border-white/15 shadow-xl">
        <div className="flex items-center gap-2 bg-[#1c1c1c] px-3.5 py-2.5 rounded-xl border border-white/20 w-full sm:w-80">
          <Search size={16} className="text-gray-300 shrink-0" />
          <input
            type="text"
            placeholder="Search Order ID, Customer, Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-white placeholder-gray-400 focus:outline-none w-full font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar py-1">
          {['all', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase transition-all shrink-0 ${
                statusFilter === st
                  ? 'bg-white text-black shadow-md'
                  : 'bg-[#1c1c1c] text-gray-300 hover:text-white border border-white/15'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Orders View: Mobile Cards & Desktop Table */}
      {filteredOrders.length > 0 ? (
        <div className="bg-[#121212] border border-white/15 rounded-3xl overflow-hidden shadow-2xl">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#181818] border-b border-white/15 text-gray-300 font-bold uppercase">
                <tr>
                  <th className="py-4 px-5">Order ID</th>
                  <th className="py-4 px-5">Customer Info</th>
                  <th className="py-4 px-5">Garment Items</th>
                  <th className="py-4 px-5">Total</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-5 font-mono font-bold text-white text-sm">
                      {order.id}
                      <span className="block text-[11px] text-gray-400 font-sans font-medium mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <p className="font-bold text-white text-sm">{order.customer?.fullName}</p>
                      <p className="text-gray-300 text-xs mt-0.5">{order.customer?.phone}</p>
                      <p className="text-gray-400 text-[11px]">{order.customer?.city}, {order.customer?.state}</p>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{order.items?.length} items</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-300 line-clamp-1 max-w-[180px]">
                          {order.items?.[0]?.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="font-black text-white text-sm block">₹{order.total?.toLocaleString()}</span>
                      <span className="text-[11px] text-gray-400 font-medium">{order.paymentMethod}</span>
                    </td>
                    <td className="py-4 px-5">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className={`text-xs font-bold uppercase px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        <option value="Processing" className="bg-black text-white">Processing</option>
                        <option value="Shipped" className="bg-black text-white">Shipped</option>
                        <option value="Delivered" className="bg-black text-white">Delivered</option>
                        <option value="Cancelled" className="bg-black text-white">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 text-xs font-bold uppercase transition-all shadow-md"
                      >
                        <Eye size={13} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="block md:hidden divide-y divide-white/10">
            {filteredOrders.map((order) => (
              <div key={order.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-white text-sm">{order.id}</span>
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-lg border focus:outline-none ${getStatusBadge(
                      order.status
                    )}`}
                  >
                    <option value="Processing" className="bg-black text-white">Processing</option>
                    <option value="Shipped" className="bg-black text-white">Shipped</option>
                    <option value="Delivered" className="bg-black text-white">Delivered</option>
                    <option value="Cancelled" className="bg-black text-white">Cancelled</option>
                  </select>
                </div>

                <div>
                  <p className="font-bold text-white text-sm">{order.customer?.fullName}</p>
                  <p className="text-gray-300 text-xs">{order.customer?.phone} • {order.customer?.city}</p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/10 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase">Grand Total:</span>
                    <span className="font-black text-white text-sm">₹{order.total?.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-black text-xs font-bold uppercase transition-all shadow-md"
                  >
                    <Eye size={13} />
                    <span>View Slip</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-[#121212] border border-white/15 rounded-3xl p-6">
          <Package size={36} className="text-white/40 mx-auto mb-2" />
          <h3 className="text-base font-bold text-white uppercase mb-1">No Orders Found</h3>
          <p className="text-xs text-gray-300">No orders match your filter criteria.</p>
        </div>
      )}

      {/* Inspect Order Slip Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto font-inter text-white">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#121212] border border-white/20 rounded-3xl max-w-xl w-full p-6 md:p-8 relative shadow-2xl my-8 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/15">
                <div>
                  <span className="text-brand-red text-xs font-bold uppercase block mb-0.5">
                    ORDER DISPATCH SLIP
                  </span>
                  <h3 className="text-lg font-black text-white font-mono">{selectedOrder.id}</h3>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-white hover:text-gray-300 rounded-full bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Customer Delivery Card */}
              <div className="p-4 bg-[#181818] border border-white/15 rounded-2xl text-xs space-y-1">
                <span className="text-[10px] font-bold text-gray-300 uppercase block mb-1">
                  Recipient Information:
                </span>
                <p className="text-white font-bold text-sm">{selectedOrder.customer?.fullName}</p>
                <p className="text-gray-200">{selectedOrder.customer?.address}</p>
                <p className="text-gray-200">{selectedOrder.customer?.city}, {selectedOrder.customer?.state} - {selectedOrder.customer?.pincode}</p>
                <p className="text-gray-300 pt-1">Phone: <strong className="text-white">{selectedOrder.customer?.phone}</strong></p>
                <p className="text-gray-300">Email: <strong className="text-white">{selectedOrder.customer?.email}</strong></p>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-gray-300 uppercase block">
                  Garment Breakdown ({selectedOrder.items?.length}):
                </span>
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#181818] border border-white/10 text-xs">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt="" className="w-10 h-12 object-cover rounded-lg bg-black shrink-0" />
                      <div>
                        <span className="font-bold text-white block">{item.name}</span>
                        <span className="text-gray-300 text-[11px]">Size: {item.size} • Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-bold text-white">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Order Totals */}
              <div className="p-4 bg-[#181818] border border-white/15 rounded-2xl space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-200">
                  <span>Subtotal:</span>
                  <span className="text-white font-bold">₹{selectedOrder.subtotal?.toLocaleString()}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount ({selectedOrder.couponCode}):</span>
                    <span className="font-bold">-₹{selectedOrder.discount?.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-200">
                  <span>Shipping:</span>
                  <span className="text-white font-bold">{selectedOrder.shipping === 0 ? 'FREE' : `₹${selectedOrder.shipping}`}</span>
                </div>
                <div className="pt-2 border-t border-white/15 flex justify-between items-center text-sm">
                  <span className="font-bold text-white uppercase">Grand Total:</span>
                  <span className="font-black text-lg text-white">₹{selectedOrder.total?.toLocaleString()}</span>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full btn-primary py-3 rounded-xl text-xs font-bold uppercase shadow-xl"
              >
                Close Slip
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
