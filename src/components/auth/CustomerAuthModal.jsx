import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import MontarawLogo from '../ui/MontarawLogo';

export default function CustomerAuthModal({ isOpen, onClose, onAuthSuccess }) {
  const { customerLogin, customerRegister, isCustomerLoggedIn } = useAuth();
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

  if (!isOpen || isCustomerLoggedIn) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await customerLogin(loginForm.email, loginForm.password);
    if (result?.success) {
      onAuthSuccess?.(result.user);
      onClose();
    } else {
      setError(result?.message || 'Login failed');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!regForm.fullName || !regForm.email || !regForm.password) {
      setError('Please fill in required fields');
      return;
    }
    const result = await customerRegister(regForm);
    if (result?.success) {
      onAuthSuccess?.(result.user);
      onClose();
    } else {
      setError(result?.message || 'Registration failed');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto font-inter text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#121212] border border-white/20 rounded-3xl max-w-md w-full p-6 md:p-8 relative overflow-hidden shadow-2xl my-8"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white hover:text-gray-300 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Logo & Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <MontarawLogo iconSize="w-8 h-8" textSize="text-lg" />
            </div>
            <h2 className="text-xl font-black text-white uppercase">
              {isRegister ? 'Create Customer Account' : 'Sign In to Proceed'}
            </h2>
            <p className="text-xs text-gray-300 mt-1">
              {isRegister
                ? 'Sign up to complete your checkout and track orders'
                : 'Customer login required before checkout'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#181818] border border-white/15 rounded-xl mb-5">
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
            /* Login Form */
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
                <span>Sign In & Continue Checkout</span>
                <ArrowRight size={15} />
              </button>
            </form>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-bold text-white uppercase mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Sharma"
                    value={regForm.fullName}
                    onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                    className="w-full bg-[#181818] border border-white/20 text-white placeholder-gray-400 text-xs pl-10 pr-3.5 py-2.5 rounded-xl focus:outline-none focus:border-brand-red font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white uppercase mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. aarav@example.com"
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    className="w-full bg-[#181818] border border-white/20 text-white placeholder-gray-400 text-xs pl-10 pr-3.5 py-2.5 rounded-xl focus:outline-none focus:border-brand-red font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-white uppercase mb-1">
                    Phone (10 digits)
                  </label>
                  <input
                    type="tel"
                    placeholder="6206424372"
                    value={regForm.phone}
                    onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                    className="w-full bg-[#181818] border border-white/20 text-white placeholder-gray-400 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-brand-red"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white uppercase mb-1">
                    Password *
                  </label>
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

              <div>
                <label className="block text-xs font-bold text-white uppercase mb-1">
                  Delivery Address
                </label>
                <input
                  type="text"
                  placeholder="House/Street, Area"
                  value={regForm.address}
                  onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
                  className="w-full bg-[#181818] border border-white/20 text-white placeholder-gray-400 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-brand-red"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-white uppercase mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="Mumbai"
                    value={regForm.city}
                    onChange={(e) => setRegForm({ ...regForm, city: e.target.value })}
                    className="w-full bg-[#181818] border border-white/20 text-white placeholder-gray-400 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-brand-red"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white uppercase mb-1">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    placeholder="400050"
                    value={regForm.pincode}
                    onChange={(e) => setRegForm({ ...regForm, pincode: e.target.value })}
                    className="w-full bg-[#181818] border border-white/20 text-white placeholder-gray-400 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-brand-red"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full btn-primary py-3.5 rounded-xl text-xs font-bold uppercase shadow-xl flex items-center justify-center gap-2 mt-2"
              >
                <span>Register & Proceed to Checkout</span>
                <ArrowRight size={15} />
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
