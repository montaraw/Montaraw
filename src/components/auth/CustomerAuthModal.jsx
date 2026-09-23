import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, ArrowRight, Loader2, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import MontarawLogo from '../ui/MontarawLogo';
import { lookupPincode, validateAddressLine, isValidIndianPhone } from '../../utils/pincodeService';

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
    state: '',
    pincode: '',
  });

  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeMsg, setPincodeMsg] = useState('');
  const [error, setError] = useState('');

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
        setError('');
      } else {
        setPincodeMsg('');
      }
    } catch {
      // ignore
    } finally {
      setPincodeLoading(false);
    }
  }, []);

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
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-3.5 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md overflow-y-auto font-inter text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-[#121212] border border-white/20 rounded-2xl sm:rounded-3xl max-w-md w-full max-h-[90vh] sm:max-h-[88vh] flex flex-col p-5 sm:p-7 md:p-8 relative overflow-hidden shadow-2xl my-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white hover:text-gray-300 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          {/* Logo & Header */}
          <div className="text-center mb-5 shrink-0">
            <div className="flex justify-center mb-2.5">
              <MontarawLogo iconSize="w-8 h-8" textSize="text-lg" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
              {isRegister ? 'Create Customer Account' : 'Sign In to Proceed'}
            </h2>
            <p className="text-[11px] sm:text-xs text-gray-300 mt-1">
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
                    placeholder="e.g. 9876543210"
                    maxLength={10}
                    value={regForm.phone}
                    onChange={(e) => setRegForm({ ...regForm, phone: e.target.value.replace(/\D/g, '') })}
                    className="w-full bg-[#181818] border border-white/20 text-white placeholder-gray-400 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-brand-red font-medium"
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
                    className="w-full bg-[#181818] border border-white/20 text-white placeholder-gray-400 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-brand-red font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white uppercase mb-1">
                  Delivery Address
                </label>
                <input
                  type="text"
                  placeholder="House / Flat No., Street, Area"
                  value={regForm.address}
                  onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
                  className="w-full bg-[#181818] border border-white/20 text-white placeholder-gray-400 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-brand-red font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-white uppercase mb-1">
                    PIN Code (6 digits)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="6-digit PIN"
                      maxLength={6}
                      value={regForm.pincode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setRegForm((prev) => ({ ...prev, pincode: val }));
                        if (val.length === 6) {
                          handlePincodeLookup(val);
                        } else {
                          setPincodeMsg('');
                        }
                      }}
                      className="w-full bg-[#181818] border border-white/20 text-white placeholder-gray-400 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-brand-red font-medium"
                    />
                    {pincodeLoading && (
                      <Loader2 size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-red animate-spin" />
                    )}
                    {pincodeMsg && !pincodeLoading && (
                      <Check size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-green-400" />
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white uppercase mb-1">
                    City / District
                  </label>
                  <input
                    type="text"
                    placeholder="City / District"
                    value={regForm.city}
                    onChange={(e) => setRegForm((prev) => ({ ...prev, city: e.target.value }))}
                    className="w-full bg-[#181818] border border-white/20 text-white placeholder-gray-400 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-brand-red font-medium"
                  />
                </div>
              </div>

              {pincodeMsg && (
                <p className="text-[10px] text-green-400 font-semibold flex items-center gap-1">
                  <Check size={11} /> Auto-detected: {pincodeMsg}
                </p>
              )}

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
