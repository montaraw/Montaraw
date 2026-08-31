import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Truck, ArrowRight } from 'lucide-react';

export default function OrderSuccessModal({ order, onClose }) {
  if (!order) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto font-inter">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-[#121212] border border-white/20 rounded-3xl max-w-lg w-full p-6 md:p-8 text-center relative overflow-hidden shadow-2xl my-8"
        >
          {/* Animated Success Badge */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-400">
            <CheckCircle2 size={32} />
          </div>

          <span className="text-[10px] font-bold text-green-400 uppercase block mb-1">
            ORDER CONFIRMED
          </span>
          <h2 className="text-2xl font-black text-white uppercase mb-2">
            Thank You for Your Order!
          </h2>
          <p className="text-xs text-white/60 max-w-sm mx-auto mb-6">
            Your order has been received and is being prepared with extreme precision at our atelier.
          </p>

          {/* Order Details Card */}
          <div className="p-4 bg-[#181818] border border-white/10 rounded-2xl text-left text-xs space-y-3 mb-6">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <span className="text-white/50 uppercase font-bold text-[10px]">
                Order ID
              </span>
              <span className="font-bold text-white text-sm bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 font-mono">
                {order.id}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-white/60">Estimated Delivery:</span>
              <span className="text-green-400 font-bold">2 - 3 Business Days</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-white/60">Payment Method:</span>
              <span className="text-white font-medium">{order.paymentMethod}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-white/60">Shipping Destination:</span>
              <span className="text-white truncate max-w-[200px]">{order.customer?.city || order.city || 'Mumbai'}, {order.customer?.pincode || order.pincode || ''}</span>
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-between items-center font-bold text-sm">
              <span className="text-white uppercase">Amount Paid:</span>
              <span className="text-white text-base">₹{order.total?.toLocaleString()}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2.5">
            <Link
              to={`/track-order?id=${order.id}`}
              onClick={onClose}
              className="w-full btn-primary py-3.5 rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-2 shadow-xl"
            >
              <Truck size={16} />
              <span>Track Live Delivery Status</span>
            </Link>

            <Link
              to="/shop"
              onClick={onClose}
              className="w-full py-3 rounded-xl border border-white/15 text-white/70 hover:text-white hover:border-white/30 text-xs font-bold uppercase flex items-center justify-center gap-1 transition-all"
            >
              <span>Continue Shopping</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
