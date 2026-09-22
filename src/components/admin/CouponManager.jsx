import { useState, useEffect } from 'react';
import { Tag, Plus, Pencil, Trash2, X, Check, Copy, Sparkles, Users, Globe, Percent, IndianRupee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../api/client';
import { defaultCoupons } from '../../data/seedData';

const emptyCoupon = {
  code: '',
  discount: '',
  type: 'percentage', // 'percentage' | 'fixed'
  minOrder: '',
  maxDiscount: '',
  audienceType: 'all', // 'all' | 'specific'
  targetCustomers: '',
  description: '',
  active: true,
};

export default function CouponManager() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyCoupon);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedCode, setCopiedCode] = useState('');

  const fetchCouponsList = async () => {
    try {
      setLoading(true);
      const res = await api.getCoupons();
      if (res?.coupons) {
        setCoupons(res.coupons);
      } else {
        setCoupons(defaultCoupons || []);
      }
    } catch (err) {
      console.warn('[CouponManager] Live fetch fallback:', err.message);
      setCoupons(defaultCoupons || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCouponsList();
  }, []);

  const resetForm = () => {
    setForm(emptyCoupon);
    setEditingId(null);
    setErrorMsg('');
    setShowModal(false);
  };

  const handleEdit = (coupon) => {
    setEditingId(coupon.id);
    const isSpecific = coupon.targetCustomers && coupon.targetCustomers.toLowerCase() !== 'all';
    setForm({
      code: coupon.code,
      discount: coupon.discount,
      type: coupon.type || 'percentage',
      minOrder: coupon.minOrder || '',
      maxDiscount: coupon.maxDiscount || '',
      audienceType: isSpecific ? 'specific' : 'all',
      targetCustomers: isSpecific ? coupon.targetCustomers : '',
      description: coupon.description || '',
      active: coupon.active ?? true,
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!form.code.trim()) {
      setErrorMsg('Coupon code is required.');
      return;
    }
    if (!form.discount || Number(form.discount) <= 0) {
      setErrorMsg('Valid discount value is required.');
      return;
    }
    if (form.audienceType === 'specific' && !form.targetCustomers.trim()) {
      setErrorMsg('Please specify at least one customer email or phone number for targeted coupon.');
      return;
    }

    const payload = {
      code: form.code.trim().toUpperCase(),
      discount: Number(form.discount),
      type: form.type,
      minOrder: Number(form.minOrder) || 0,
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
      targetCustomers: form.audienceType === 'specific' ? form.targetCustomers.trim() : 'all',
      description: form.description.trim(),
      active: Boolean(form.active),
    };

    try {
      setSaving(true);
      setErrorMsg('');

      if (editingId) {
        await api.updateCoupon(editingId, payload);
      } else {
        await api.createCoupon(payload);
      }

      await fetchCouponsList();
      resetForm();
    } catch (err) {
      console.error('Save Coupon Error:', err);
      setErrorMsg(err.message || 'Failed to save coupon in database.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Are you sure you want to delete coupon "${code}"?`)) return;
    try {
      await api.deleteCoupon(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Delete Coupon Error:', err);
      alert('Failed to delete coupon: ' + err.message);
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      const updatedStatus = !coupon.active;
      await api.updateCoupon(coupon.id, { active: updatedStatus });
      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? { ...c, active: updatedStatus } : c))
      );
    } catch (err) {
      console.error('Toggle Active Error:', err);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const applyPreset = (preset) => {
    setForm({
      ...emptyCoupon,
      ...preset,
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6 font-inter text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <span className="text-brand-red text-xs font-bold uppercase block mb-0.5">
            PROMOTIONAL ENGINE
          </span>
          <h2 className="text-xl md:text-3xl font-black text-white uppercase">
            Coupon & Discount Engine ({coupons.length})
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Issue percentage discounts, flat amount vouchers, and exclusive targeted coupons for specific VIP customers.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary py-3 px-6 text-xs font-bold uppercase rounded-xl inline-flex items-center gap-2 self-start sm:self-auto shadow-xl"
        >
          <Plus size={16} />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* Quick Add Presets Bar */}
      <div className="p-4 bg-[#141414] border border-white/15 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-gray-300 font-bold uppercase text-[11px] flex items-center gap-1.5">
          <Sparkles size={14} className="text-brand-red" />
          Quick Issue Templates:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() =>
              applyPreset({
                code: 'WELCOME10',
                discount: 10,
                type: 'percentage',
                minOrder: 999,
                audienceType: 'all',
                description: '10% Welcome discount on orders above ₹999',
              })
            }
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-brand-red text-white text-[11px] font-bold uppercase transition-all"
          >
            + 10% Welcome (All)
          </button>
          <button
            onClick={() =>
              applyPreset({
                code: 'VIP500',
                discount: 500,
                type: 'fixed',
                minOrder: 2499,
                audienceType: 'specific',
                targetCustomers: 'customer@gmail.com, 9876543210',
                description: 'Flat ₹500 discount for selected VIP customers',
              })
            }
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-brand-red text-white text-[11px] font-bold uppercase transition-all flex items-center gap-1"
          >
            <Users size={12} />
            + ₹500 Selected VIPs
          </button>
          <button
            onClick={() =>
              applyPreset({
                code: 'FESTIVE20',
                discount: 20,
                type: 'percentage',
                minOrder: 1999,
                maxDiscount: 1000,
                audienceType: 'all',
                description: '20% Festive discount up to ₹1,000',
              })
            }
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-brand-red text-white text-[11px] font-bold uppercase transition-all"
          >
            + 20% Festive (Cap ₹1k)
          </button>
        </div>
      </div>

      {/* Coupons Table / Grid */}
      <div className="bg-[#121212] border border-white/15 rounded-3xl overflow-hidden shadow-2xl">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#181818] border-b border-white/15 text-gray-300 font-bold uppercase">
              <tr>
                <th className="py-4 px-5">Coupon Code</th>
                <th className="py-4 px-5">Discount Value</th>
                <th className="py-4 px-5">Min Order & Cap</th>
                <th className="py-4 px-5">Target Audience</th>
                <th className="py-4 px-5 text-center">Status</th>
                <th className="py-4 px-5 text-right w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {coupons.map((coupon) => {
                const isSpecific = coupon.targetCustomers && coupon.targetCustomers.toLowerCase() !== 'all';
                return (
                  <tr key={coupon.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-white text-sm bg-[#1c1c1c] border border-white/20 px-3 py-1 rounded-xl tracking-wider">
                          {coupon.code}
                        </span>
                        <button
                          onClick={() => copyToClipboard(coupon.code)}
                          className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                          title="Copy Code"
                        >
                          {copiedCode === coupon.code ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                        </button>
                      </div>
                      {coupon.description && (
                        <span className="text-[11px] text-gray-400 block mt-1 line-clamp-1">{coupon.description}</span>
                      )}
                    </td>

                    <td className="py-4 px-5">
                      <span className="inline-flex items-center gap-1 font-black text-sm text-green-400 bg-green-500/10 border border-green-500/30 px-2.5 py-1 rounded-full">
                        {coupon.type === 'percentage' ? (
                          <>
                            <Percent size={13} />
                            <span>{coupon.discount}% OFF</span>
                          </>
                        ) : (
                          <>
                            <IndianRupee size={13} />
                            <span>₹{coupon.discount} FLAT</span>
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-gray-300">
                      <div>Min: <strong className="text-white">₹{(coupon.minOrder || 0).toLocaleString()}</strong></div>
                      {coupon.maxDiscount && (
                        <div className="text-[11px] text-gray-400">Max Cap: ₹{coupon.maxDiscount.toLocaleString()}</div>
                      )}
                    </td>

                    <td className="py-4 px-5">
                      {isSpecific ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            <Users size={11} />
                            Selected VIP Customers
                          </span>
                          <span className="text-[10px] text-gray-400 block font-mono truncate max-w-[200px]" title={coupon.targetCustomers}>
                            {coupon.targetCustomers}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          <Globe size={11} />
                          All Customers (Public)
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-5 text-center">
                      <button
                        onClick={() => handleToggleActive(coupon)}
                        className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full border transition-all ${
                          coupon.active
                            ? 'bg-green-500/20 text-green-400 border-green-500/40 hover:bg-green-500/30'
                            : 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30'
                        }`}
                      >
                        {coupon.active ? '● Active' : '○ Paused'}
                      </button>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEdit(coupon)}
                          className="p-2 text-gray-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon.id, coupon.code)}
                          className="p-2 text-gray-300 hover:text-red-400 rounded-xl hover:bg-red-500/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="block md:hidden divide-y divide-white/10">
          {coupons.map((coupon) => {
            const isSpecific = coupon.targetCustomers && coupon.targetCustomers.toLowerCase() !== 'all';
            return (
              <div key={coupon.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-white text-sm bg-[#1c1c1c] border border-white/20 px-3 py-1 rounded-xl">
                      {coupon.code}
                    </span>
                    <button
                      onClick={() => copyToClipboard(coupon.code)}
                      className="p-1.5 text-gray-400 hover:text-white"
                    >
                      {copiedCode === coupon.code ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <button
                    onClick={() => handleToggleActive(coupon)}
                    className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                      coupon.active
                        ? 'bg-green-500/20 text-green-400 border-green-500/40'
                        : 'bg-red-500/20 text-red-400 border-red-500/40'
                    }`}
                  >
                    {coupon.active ? 'Active' : 'Paused'}
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-green-400">
                    {coupon.type === 'percentage' ? `${coupon.discount}% OFF` : `₹${coupon.discount} FLAT OFF`}
                  </span>
                  <span className="text-gray-300">Min Order: ₹{(coupon.minOrder || 0).toLocaleString()}</span>
                </div>

                {isSpecific ? (
                  <div className="text-[11px] bg-purple-500/10 border border-purple-500/20 rounded-xl p-2 text-purple-300">
                    <span className="font-bold block uppercase text-[10px]">Restricted to Selected Customers:</span>
                    <span className="font-mono text-gray-300 truncate block mt-0.5">{coupon.targetCustomers}</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-gray-400 font-bold uppercase">🌐 Public to All Customers</span>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={() => handleEdit(coupon)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs inline-flex items-center gap-1"
                  >
                    <Pencil size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(coupon.id, coupon.code)}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Centered Modal Popup Widget */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetForm}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 320 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#141414] border border-white/20 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-5 z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/15 sticky -top-2 bg-[#141414] z-20">
                <div>
                  <span className="text-[10px] font-bold text-brand-red uppercase tracking-wider block">
                    {editingId ? 'Modify Voucher' : 'Issue Voucher'}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white uppercase">
                    {editingId ? 'Edit Coupon Parameters' : 'Create New Promotional Coupon'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="p-2 text-white hover:text-gray-300 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Coupon Code */}
                <div>
                  <label className="block font-bold text-white uppercase mb-1.5">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. FESTIVE25, VIP500"
                    className="w-full bg-[#1c1c1c] border border-white/20 text-white placeholder-gray-400 px-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-mono font-bold uppercase text-sm"
                  />
                </div>

                {/* Discount Type */}
                <div>
                  <label className="block font-bold text-white uppercase mb-1.5">
                    Discount Type *
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-[#1c1c1c] border border-white/20 text-white px-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-bold uppercase text-xs cursor-pointer"
                  >
                    <option value="percentage">Percentage Discount (%)</option>
                    <option value="fixed">Flat Price Discount (₹)</option>
                  </select>
                </div>

                {/* Discount Value */}
                <div>
                  <label className="block font-bold text-white uppercase mb-1.5">
                    Discount Value {form.type === 'percentage' ? '(%)' : '(₹)'} *
                  </label>
                  <input
                    type="number"
                    required
                    value={form.discount}
                    onChange={(e) => setForm({ ...form, discount: e.target.value })}
                    placeholder={form.type === 'percentage' ? 'e.g. 20 for 20%' : 'e.g. 500 for ₹500'}
                    className="w-full bg-[#1c1c1c] border border-white/20 text-white px-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-bold text-sm"
                  />
                </div>

                {/* Minimum Order Amount */}
                <div>
                  <label className="block font-bold text-white uppercase mb-1.5">
                    Minimum Order Value (₹)
                  </label>
                  <input
                    type="number"
                    value={form.minOrder}
                    onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
                    placeholder="e.g. 999 (0 for no limit)"
                    className="w-full bg-[#1c1c1c] border border-white/20 text-white px-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-medium text-xs"
                  />
                </div>

                {/* Max Discount Cap (Only for Percentage) */}
                {form.type === 'percentage' && (
                  <div className="md:col-span-2">
                    <label className="block font-bold text-white uppercase mb-1.5">
                      Maximum Discount Cap (₹) (Optional)
                    </label>
                    <input
                      type="number"
                      value={form.maxDiscount}
                      onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                      placeholder="e.g. 1000 (limits 20% discount up to ₹1,000 max)"
                      className="w-full bg-[#1c1c1c] border border-white/20 text-white px-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-medium text-xs"
                    />
                  </div>
                )}

                {/* Target Audience Selector */}
                <div className="md:col-span-2 p-4 bg-[#1a1a1a] rounded-2xl border border-white/15 space-y-3">
                  <label className="block font-bold text-white uppercase text-xs flex items-center gap-1.5">
                    <Users size={14} className="text-brand-red" />
                    Target Audience / Customer Eligibility *
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      onClick={() => setForm({ ...form, audienceType: 'all' })}
                      className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-all ${
                        form.audienceType === 'all'
                          ? 'bg-brand-red/15 border-brand-red text-white'
                          : 'bg-[#141414] border-white/15 text-gray-300 hover:border-white/30'
                      }`}
                    >
                      <input
                        type="radio"
                        name="audienceType"
                        checked={form.audienceType === 'all'}
                        onChange={() => setForm({ ...form, audienceType: 'all' })}
                        className="accent-brand-red"
                      />
                      <div>
                        <span className="font-bold text-xs block text-white">All Customers</span>
                        <span className="text-[10px] text-gray-400">Public coupon anyone can apply</span>
                      </div>
                    </label>

                    <label
                      onClick={() => setForm({ ...form, audienceType: 'specific' })}
                      className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-all ${
                        form.audienceType === 'specific'
                          ? 'bg-brand-red/15 border-brand-red text-white'
                          : 'bg-[#141414] border-white/15 text-gray-300 hover:border-white/30'
                      }`}
                    >
                      <input
                        type="radio"
                        name="audienceType"
                        checked={form.audienceType === 'specific'}
                        onChange={() => setForm({ ...form, audienceType: 'specific' })}
                        className="accent-brand-red"
                      />
                      <div>
                        <span className="font-bold text-xs block text-white">Selected Customers Only</span>
                        <span className="text-[10px] text-gray-400">Restricted to specific emails or phone numbers</span>
                      </div>
                    </label>
                  </div>

                  {form.audienceType === 'specific' && (
                    <div className="space-y-1.5 pt-1">
                      <label className="block font-bold text-brand-red uppercase text-[11px]">
                        Allowed Customer Emails / Phone Numbers (Comma Separated) *
                      </label>
                      <textarea
                        rows={2}
                        value={form.targetCustomers}
                        onChange={(e) => setForm({ ...form, targetCustomers: e.target.value })}
                        placeholder="e.g. rishukumar@gmail.com, 9720538576, priya.sharma@example.com"
                        className="w-full bg-[#141414] border border-brand-red/40 text-white placeholder-gray-500 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-brand-red font-mono text-xs"
                      />
                      <p className="text-[10px] text-gray-400">
                        Only customers logged in with these email addresses or phone numbers can apply this coupon.
                      </p>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block font-bold text-white uppercase mb-1.5">
                    Description / Internal Note
                  </label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="e.g. Special VIP Loyalty Drop 2026"
                    className="w-full bg-[#1c1c1c] border border-white/20 text-white px-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-medium text-xs"
                  />
                </div>

                {/* Status Toggle */}
                <div className="md:col-span-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) => setForm({ ...form, active: e.target.checked })}
                      className="w-4 h-4 accent-brand-red"
                    />
                    <span>Active and Available for Redemption</span>
                  </label>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="flex items-center gap-3 pt-4 border-t border-white/15">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary py-3 px-8 text-xs font-bold uppercase rounded-xl shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingId ? 'Update Coupon' : 'Publish Coupon'}</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="px-6 py-3 border border-white/20 text-gray-300 hover:text-white rounded-xl text-xs font-bold uppercase disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
