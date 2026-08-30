import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import MontarawLogo from '../components/ui/MontarawLogo';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { adminLogin, isAdminLoggedIn } = useAdmin();
  const navigate = useNavigate();

  if (isAdminLoggedIn) {
    navigate('/admin/dashboard');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const success = await adminLogin(email.trim(), password.trim());
    if (success) {
      navigate('/admin/dashboard');
    } else {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center px-4 py-8 md:py-12 relative overflow-hidden font-inter text-white">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-red/10 blur-[120px] pointer-events-none" />

      {/* Top Floating Back Button */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-[#141414] border border-white/20 text-white hover:border-white text-xs font-bold uppercase transition-all shadow-lg"
        >
          <ArrowLeft size={15} />
          <span>Back to Store</span>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md z-10 my-4 sm:my-8"
      >
        <div className="bg-[#121212] border border-white/20 rounded-3xl p-5 sm:p-8 md:p-10 shadow-2xl">
          {/* Logo & Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex justify-center mb-3 sm:mb-4">
              <MontarawLogo iconSize="w-9 h-9 sm:w-10 sm:h-10" textSize="text-xl" />
            </div>
            <h1 className="text-base sm:text-lg font-black text-white uppercase">
              ADMIN PORTAL
            </h1>
            <p className="text-xs text-gray-300 mt-1">
              Store management, customer orders, and catalog curation
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-white uppercase mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="adminmontaraw@gmail.com"
                  className="w-full bg-[#181818] border border-white/20 text-white placeholder-gray-400 text-xs pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-brand-red font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-white uppercase mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#181818] border border-white/20 text-white placeholder-gray-400 text-xs pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-brand-red font-medium"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded-xl font-semibold">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full btn-primary py-3.5 rounded-xl text-xs font-bold uppercase shadow-xl flex items-center justify-center gap-2 mt-2"
            >
              <span>Access Dashboard</span>
              <ArrowRight size={15} />
            </button>
          </form>

          {/* Direct Return Link inside card footer */}
          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <Link
              to="/"
              className="text-xs text-gray-300 hover:text-white inline-flex items-center gap-1.5 transition-colors font-medium"
            >
              <ArrowLeft size={13} />
              <span>Return to Customer Store</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
