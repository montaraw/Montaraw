import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProducts } from '../../context/ProductContext';

const emptyBanner = { title: '', subtitle: '', headline: '', buttonText: 'Shop Now', link: '/shop', image: '' };

export default function BannerManager() {
  const { banners, addBanner, updateBanner, deleteBanner } = useProducts();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyBanner);
  const [showForm, setShowForm] = useState(false);

  const handleSave = () => {
    if (!form.title || !form.headline) return;
    if (editing) {
      updateBanner(editing, form);
    } else {
      addBanner(form);
    }
    resetForm();
  };

  const handleEdit = (banner) => {
    setEditing(banner.id);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle || '',
      headline: banner.headline || '',
      buttonText: banner.buttonText || 'Shop Now',
      link: banner.link || '/shop',
      image: banner.image || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setForm(emptyBanner);
    setEditing(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6 font-inter text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <span className="text-brand-red text-xs font-bold uppercase block mb-0.5">
            HERO SHOWCASE
          </span>
          <h2 className="text-xl md:text-3xl font-black text-white uppercase">Hero Banner Slides ({banners.length})</h2>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">Manage carousel slides, headlines, CTAs, and hero assets.</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary py-3 px-6 text-xs font-bold uppercase rounded-xl inline-flex items-center gap-2 self-start sm:self-auto shadow-xl">
          <Plus size={16} />
          <span>Add Slide</span>
        </button>
      </div>

      {/* Form Drawer */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#141414] border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-white/15">
            <h3 className="text-base font-bold text-white uppercase">{editing ? 'Edit Slide' : 'New Banner Slide'}</h3>
            <button onClick={resetForm} className="p-2 text-white hover:text-gray-300 rounded-full bg-white/10 transition-colors"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-white uppercase mb-1.5">Tagline / Pill</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-[#1c1c1c] border border-white/20 text-white placeholder-gray-400 px-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-medium" placeholder="e.g. WOMEN COUTURE DROP" />
            </div>
            <div>
              <label className="block font-bold text-white uppercase mb-1.5">Main Headline</label>
              <input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} className="w-full bg-[#1c1c1c] border border-white/20 text-white placeholder-gray-400 px-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-bold" placeholder="e.g. EFFORTLESS ELEGANCE" />
            </div>
            <div className="md:col-span-2">
              <label className="block font-bold text-white uppercase mb-1.5">Subtitle Description</label>
              <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="w-full bg-[#1c1c1c] border border-white/20 text-white placeholder-gray-400 px-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-medium" placeholder="Short description for hero..." />
            </div>
            <div>
              <label className="block font-bold text-white uppercase mb-1.5">Button Text</label>
              <input value={form.buttonText} onChange={(e) => setForm({ ...form, buttonText: e.target.value })} className="w-full bg-[#1c1c1c] border border-white/20 text-white placeholder-gray-400 px-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-medium" placeholder="Shop Women" />
            </div>
            <div>
              <label className="block font-bold text-white uppercase mb-1.5">Button Target Link</label>
              <input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="w-full bg-[#1c1c1c] border border-white/20 text-white placeholder-gray-400 px-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-medium" placeholder="/shop?gender=women" />
            </div>
            <div className="md:col-span-2">
              <label className="block font-bold text-white uppercase mb-1.5">Hero Image URL</label>
              <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full bg-[#1c1c1c] border border-white/20 text-white placeholder-gray-400 px-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-mono" placeholder="https://images.unsplash.com/..." />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-4 border-t border-white/15">
            <button onClick={handleSave} className="btn-primary py-3 px-8 text-xs font-bold uppercase rounded-xl shadow-xl">{editing ? 'Update' : 'Create'} Slide</button>
            <button onClick={resetForm} className="px-6 py-3 border border-white/20 text-gray-300 hover:text-white rounded-xl text-xs font-bold uppercase">Cancel</button>
          </div>
        </motion.div>
      )}

      {/* Grid of Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map((banner, i) => (
          <motion.div
            key={banner.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-[#121212] border border-white/15 rounded-3xl p-4 md:p-5 shadow-xl relative overflow-hidden space-y-3"
          >
            <div className="aspect-[16/9] bg-black rounded-2xl overflow-hidden relative border border-white/15">
              {banner.image && <img src={banner.image} alt={banner.headline} className="w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent p-4 flex flex-col justify-end">
                <span className="text-[10px] font-bold text-brand-red uppercase">{banner.title}</span>
                <h4 className="text-base sm:text-lg font-black text-white uppercase">{banner.headline}</h4>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-300 truncate flex-1 mr-3 font-medium">{banner.subtitle}</p>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => handleEdit(banner)} className="p-2 text-gray-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors" title="Edit"><Pencil size={15} /></button>
                <button onClick={() => { if (window.confirm('Delete slide?')) deleteBanner(banner.id); }} className="p-2 text-gray-300 hover:text-red-400 rounded-xl hover:bg-red-500/10 transition-colors" title="Delete"><Trash2 size={15} /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
