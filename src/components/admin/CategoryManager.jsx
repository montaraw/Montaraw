import { useState } from 'react';
import { Plus, Pencil, Trash2, X, FolderOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '../../context/ProductContext';
import ImageUploadZone from './ImageUploadZone';

const emptyCategory = { name: '', image: '', gender: 'unisex' };

export default function CategoryManager() {
  const { categories, addCategory, updateCategory, deleteCategory } = useProducts();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyCategory);
  const [showForm, setShowForm] = useState(false);
  const [filterTab, setFilterTab] = useState('all');

  const handleSave = () => {
    if (!form.name) return;
    if (editing) {
      updateCategory(editing, form);
    } else {
      addCategory(form);
    }
    resetForm();
  };

  const handleEdit = (cat) => {
    setEditing(cat.id);
    setForm({ name: cat.name, image: cat.image, gender: cat.gender || 'unisex' });
    setShowForm(true);
  };

  const resetForm = () => {
    setForm(emptyCategory);
    setEditing(null);
    setShowForm(false);
  };

  const filteredCategories = categories.filter((cat) => {
    if (filterTab === 'all') return true;
    return (cat.gender || 'unisex') === filterTab;
  });

  const applyPreset = (presetName, presetGender, presetImg) => {
    setForm({
      name: presetName,
      gender: presetGender,
      image: presetImg || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80',
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6 font-inter text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <span className="text-brand-red text-xs font-bold uppercase block mb-0.5">
            ATELIER TAXONOMY
          </span>
          <h2 className="text-xl md:text-3xl font-black text-white uppercase">
            Category & Subcategory Manager ({categories.length})
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Organize Women subcategories (Pakistani Suits, Suits, Cord Set), Men collections, and custom lines.
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="btn-primary py-3 px-6 text-xs font-bold uppercase rounded-xl inline-flex items-center gap-2 self-start sm:self-auto shadow-xl"
        >
          <Plus size={16} />
          <span>Add New Category / Subcategory</span>
        </button>
      </div>

      {/* Quick Add Presets Bar */}
      <div className="p-4 bg-[#141414] border border-white/15 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-gray-300 font-bold uppercase text-[11px] flex items-center gap-1.5">
          <FolderOpen size={14} className="text-brand-red" />
          Quick Add Women Subcategories:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => applyPreset('Pakistani Suits', 'women', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80')}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-brand-red text-white text-[11px] font-bold uppercase transition-all"
          >
            + Pakistani Suits
          </button>
          <button
            onClick={() => applyPreset('Suits', 'women', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80')}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-brand-red text-white text-[11px] font-bold uppercase transition-all"
          >
            + Suits
          </button>
          <button
            onClick={() => applyPreset('Cord Set', 'women', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80')}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-brand-red text-white text-[11px] font-bold uppercase transition-all"
          >
            + Cord Set
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: `All (${categories.length})` },
          { id: 'women', label: `Women Subcategories (${categories.filter(c => c.gender === 'women').length})` },
          { id: 'men', label: `Men (${categories.filter(c => c.gender === 'men').length})` },
          { id: 'unisex', label: `Unisex (${categories.filter(c => c.gender === 'unisex' || !c.gender).length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all shrink-0 ${
              filterTab === tab.id
                ? 'bg-brand-red text-white shadow-lg'
                : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Centered Modal Popup Widget (Middle of the Screen) */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetForm}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Centered Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 320 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#141414] border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5 z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/15 sticky -top-2 bg-[#141414] z-20">
                <h3 className="text-base sm:text-lg font-bold text-white uppercase">
                  {editing ? 'Edit Category Details' : 'Create New Category / Subcategory'}
                </h3>
                <button
                  type="button"
                  onClick={resetForm}
                  className="p-2 text-white hover:text-gray-300 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-white uppercase mb-1.5">Category / Subcategory Name *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-[#1c1c1c] border border-white/20 text-white placeholder-gray-400 px-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-medium" placeholder="e.g. Pakistani Suits" />
                </div>
                <div>
                  <label className="block font-bold text-white uppercase mb-1.5">Department / Target Line</label>
                  <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full bg-[#1c1c1c] border border-white/20 text-white px-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-bold uppercase">
                    <option value="women" className="bg-black text-white">Women (Subcategory)</option>
                    <option value="men" className="bg-black text-white">Men (Streetwear)</option>
                    <option value="unisex" className="bg-black text-white">Unisex</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <ImageUploadZone
                    value={form.image}
                    onChange={(url) => setForm({ ...form, image: url })}
                    folder="montaraw_atelier/categories"
                    label="Category Cover Image *"
                    helpText="Upload PNG, JPG, WEBP — automatically stored to Cloudinary"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/15">
                <button onClick={handleSave} className="btn-primary py-3 px-8 text-xs font-bold uppercase rounded-xl shadow-xl">{editing ? 'Update' : 'Create'} Category</button>
                <button onClick={resetForm} className="px-6 py-3 border border-white/20 text-gray-300 hover:text-white rounded-xl text-xs font-bold uppercase">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((cat, i) => (
          <motion.div
            key={cat.id || cat.slug}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-[#121212] border border-white/15 rounded-3xl p-5 shadow-xl space-y-3"
          >
            <div className="aspect-video bg-black rounded-2xl overflow-hidden relative border border-white/15">
              {cat.image && <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />}
              <span className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full backdrop-blur-md border text-[10px] font-bold uppercase ${
                cat.gender === 'women'
                  ? 'bg-red-950/80 text-red-300 border-red-500/30'
                  : cat.gender === 'men'
                  ? 'bg-blue-950/80 text-blue-300 border-blue-500/30'
                  : 'bg-black/80 text-white border-white/20'
              }`}>
                {cat.gender === 'women' ? "Women's Subcategory" : (cat.gender || 'Unisex')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white uppercase">{cat.name}</h4>
                <p className="text-xs text-gray-400 font-mono mt-0.5">/shop/{cat.slug}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => handleEdit(cat)} className="p-2 text-gray-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors" title="Edit"><Pencil size={15} /></button>
                <button onClick={() => { if (window.confirm(`Delete ${cat.name}?`)) deleteCategory(cat.id); }} className="p-2 text-gray-300 hover:text-red-400 rounded-xl hover:bg-red-500/10 transition-colors" title="Delete"><Trash2 size={15} /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
