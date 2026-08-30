import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogOut, Package, ArrowRight, CheckCircle2, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import MontarawLogo from '../components/ui/MontarawLogo';

export default function CustomerLoginPage() {
  const { customerUser, isCustomerLoggedIn, customerLogin, customerRegister, customerLogout, updateCustomerProfile } = useAuth();
  const { getOrdersByContact } = useOrders();
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
    state: 'Maharashtra',
    pincode: '',
  });

  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'profile'

  const userOrders = customerUser
    ? getOrdersByContact(customerUser.email).concat(getOrdersByContact(customerUser.phone || ''))
        .filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i)
    : [];

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
    const res = await customerRegister(regForm);
    if (res?.success) {
      if (redirectTarget === 'checkout') {
        navigate('/cart?checkout=true');
      }
    } else {
      setError(res?.message || 'Registration failed');
    }
  };

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
          <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-3 overflow-x-auto no-scrollbar">
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
              Saved Shipping Profile
            </button>
          </div>

          {activeTab === 'orders' ? (
            /* Orders Tab */
            <div className="space-y-4">
              {userOrders.length > 0 ? (
                userOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 sm:p-6 bg-[#121212] border border-white/15 rounded-3xl space-y-4 shadow-xl"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-white font-mono text-base">{order.id}</span>
                          <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-brand-red/20 text-brand-red border border-brand-red/30">
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0">
                        <span className="text-base font-black text-white">
                          ₹{order.total?.toLocaleString()}
                        </span>
                        <Link
                          to={`/track-order?id=${order.id}`}
                          className="btn-primary py-2 px-4 rounded-xl text-xs font-bold uppercase inline-flex items-center gap-1.5"
                        >
                          <Package size={13} />
                          <span>Track Live</span>
                        </Link>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-xs py-1">
                          <div className="flex items-center gap-3">
                            <img src={item.image} alt="" className="w-10 h-12 object-cover rounded-lg bg-black shrink-0" />
                            <div>
                              <span className="font-bold text-white block line-clamp-1">{item.name}</span>
                              <span className="text-gray-400 text-[11px]">Size: {item.size} • Qty: {item.quantity}</span>
                            </div>
                          </div>
                          <span className="font-bold text-white">₹{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
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
            /* Profile Tab */
            <div className="bg-[#121212] border border-white/15 rounded-3xl p-5 sm:p-8 max-w-xl shadow-xl space-y-4 text-xs">
              <h3 className="text-sm font-bold text-white uppercase mb-2">Saved Shipping Information</h3>
              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  value={customerUser.fullName || ''}
                  onChange={(e) => updateCustomerProfile({ fullName: e.target.value })}
                  className="w-full bg-[#181818] border border-white/20 text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-brand-red font-medium"
                />
              </div>
              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={customerUser.phone || ''}
                  onChange={(e) => updateCustomerProfile({ phone: e.target.value })}
                  className="w-full bg-[#181818] border border-white/20 text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-brand-red font-medium"
                />
              </div>
              <div>
                <label className="block text-gray-300 font-bold uppercase mb-1">Street Address</label>
                <input
                  type="text"
                  value={customerUser.address || ''}
                  onChange={(e) => updateCustomerProfile({ address: e.target.value })}
                  className="w-full bg-[#181818] border border-white/20 text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-brand-red font-medium"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold uppercase mb-1">City</label>
                  <input
                    type="text"
                    value={customerUser.city || ''}
                    onChange={(e) => updateCustomerProfile({ city: e.target.value })}
                    className="w-full bg-[#181818] border border-white/20 text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-brand-red font-medium"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-bold uppercase mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={customerUser.pincode || ''}
                    onChange={(e) => updateCustomerProfile({ pincode: e.target.value })}
                    className="w-full bg-[#181818] border border-white/20 text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-brand-red font-medium"
                  />
                </div>
              </div>
              <p className="text-[11px] text-green-400 pt-2 flex items-center gap-1.5 font-semibold">
                <CheckCircle2 size={13} />
                Information is automatically saved for faster 1-click checkout.
              </p>
            </div>
          )}
        </div>
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
                    placeholder="6206424372"
                    value={regForm.phone}
                    onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                    className="w-full bg-[#181818] border border-white/20 text-white placeholder-gray-400 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-brand-red"
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
