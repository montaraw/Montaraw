import { Link } from 'react-router-dom';
import { Package, FolderOpen, Image, ShoppingCart, IndianRupee, Truck, ArrowRight, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProducts } from '../../context/ProductContext';
import { useOrders } from '../../context/OrderContext';

export default function DashboardStats() {
  const { products, categories, banners, resetToDefaults } = useProducts();
  const { orders } = useOrders();

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === 'Processing').length;

  const stats = [
    {
      label: 'Gross Sales / Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: IndianRupee,
      color: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30',
      iconColor: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/30',
    },
    {
      label: 'Total Orders',
      value: `${orders.length} orders`,
      icon: Truck,
      color: 'from-blue-500/20 to-blue-600/5 border-blue-500/30',
      iconColor: 'text-blue-300 bg-blue-500/20 border-blue-500/30',
    },
    {
      label: 'Pending Dispatches',
      value: `${pendingOrders} awaiting`,
      icon: ShoppingCart,
      color: 'from-amber-500/20 to-amber-600/5 border-amber-500/30',
      iconColor: 'text-amber-300 bg-amber-500/20 border-amber-500/30',
    },
    {
      label: 'Active Products',
      value: `${products.length} items`,
      icon: Package,
      color: 'from-purple-500/20 to-purple-600/5 border-purple-500/30',
      iconColor: 'text-purple-300 bg-purple-500/20 border-purple-500/30',
    },
    {
      label: 'Active Categories',
      value: `${categories.length} sections`,
      icon: FolderOpen,
      color: 'from-indigo-500/20 to-indigo-600/5 border-indigo-500/30',
      iconColor: 'text-indigo-300 bg-indigo-500/20 border-indigo-500/30',
    },
    {
      label: 'Hero Banners',
      value: `${banners.length} slides`,
      icon: Image,
      color: 'from-rose-500/20 to-rose-600/5 border-rose-500/30',
      iconColor: 'text-rose-300 bg-rose-500/20 border-rose-500/30',
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8 font-inter text-white">
      {/* Header with Quick Reset Seed Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <span className="text-brand-red text-xs font-bold uppercase block mb-0.5">
            ATELIER ANALYTICS
          </span>
          <h2 className="text-xl md:text-3xl font-black text-white uppercase">
            Dashboard Overview
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Real-time sales, order fulfillment volume, and catalog state.
          </p>
        </div>

        <button
          onClick={() => {
            if (window.confirm('Reset all catalog, categories, banners to factory defaults?')) {
              resetToDefaults();
            }
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#181818] hover:bg-white/15 text-gray-200 hover:text-white border border-white/20 text-xs font-bold uppercase transition-all shadow-md self-start sm:self-auto"
          title="Reset to fresh demo catalog"
        >
          <RotateCcw size={14} />
          <span>Reload Sample Catalog</span>
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`bg-[#121212] border rounded-3xl p-5 md:p-6 bg-gradient-to-br ${stat.color} shadow-xl`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-300 uppercase">{stat.label}</p>
                <p className="text-2xl sm:text-3xl font-black text-white mt-1.5">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 flex items-center justify-center rounded-2xl border shadow-inner ${stat.iconColor}`}>
                <stat.icon size={22} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Two Column Layout: Recent Orders & Recent Catalog Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-[#121212] border border-white/15 rounded-3xl p-5 md:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase">
              Recent Customer Orders
            </h3>
            <Link
              to="/admin/orders"
              className="text-xs text-brand-red hover:underline font-bold uppercase inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="divide-y divide-white/10">
            {orders.slice(0, 4).map((order) => (
              <div key={order.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono text-sm">{order.id}</span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        order.status === 'Delivered'
                          ? 'bg-green-500/20 text-green-300 border-green-500/40'
                          : order.status === 'Shipped'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-gray-300 text-xs mt-1">
                    {order.customer?.fullName} • {order.items?.length} piece(s)
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-black text-white text-sm block">₹{order.total?.toLocaleString()}</span>
                  <span className="text-[11px] text-gray-400 font-medium">{order.paymentMethod}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-[#121212] border border-white/15 rounded-3xl p-5 md:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase">
              Catalog Pieces
            </h3>
            <Link
              to="/admin/products"
              className="text-xs text-brand-red hover:underline font-bold uppercase inline-flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="divide-y divide-white/10">
            {products.slice(0, 4).map((product) => (
              <div key={product.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img src={product.image} alt="" className="w-10 h-12 object-cover rounded-xl bg-black border border-white/15" />
                  <div>
                    <span className="font-bold text-white text-xs sm:text-sm line-clamp-1 block">{product.name}</span>
                    <span className="text-xs text-gray-300 capitalize font-medium">
                      {product.gender} • {typeof product.category === 'object' && product.category?.name ? product.category.name : (typeof product.category === 'string' ? product.category.replace(/-/g, ' ') : (product.categorySlug?.replace(/-/g, ' ') || 'Collection'))}
                    </span>
                  </div>
                </div>
                <span className="font-black text-white text-xs sm:text-sm">
                  ₹{product.price.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
