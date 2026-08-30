import { useState } from 'react';
import { Plus, Pencil, Trash2, X, FolderOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProducts } from '../../context/ProductContext';

const emptyCategory = { name: '', image: '', gender: 'unisex' };

export default function CategoryManager() {
  const { categories, addCategory, updateCategory, deleteCategory } = useProducts();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyCategory);
  const [showForm, setShowForm] = useState(false);

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

  return (
    <div className="space-y-6 font-inter text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <span className="text-brand-red text-xs font-bold uppercase block mb-0.5">
            ATELIER TAXONOMY
          </span>
          <h2 className="text-xl md:text-3xl font-black text-white uppercase">Category Manager ({categories.length})</h2>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">Organize departments, collections, and garment categories.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="btn-primary py-3 px-6 text-xs font-bold uppercase rounded-xl inline-flex items-center gap-2 self-start sm:self-auto shadow-xl"
        >
          <Plus size={16} />
          <span>Add Category</span>
        </button>
      </div>

      {/* Form Card */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#141414] border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-white/15">
            <h3 className="text-base font-bold text-white uppercase">{editing ? 'Edit Category' : 'New Category'}</h3>
            <button onClick={resetForm} className="p-2 text-white hover:text-gray-300 rounded-full bg-white/10 transition-colors"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-white uppercase mb-1.5">Category Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-[#1c1c1c] border border-white/20 text-white placeholder-gray-400 px-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-medium" placeholder="e.g. Dresses & Gowns" />
            </div>
            <div>
              <label className="block font-bold text-white uppercase mb-1.5">Image URL *</label>
              <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full bg-[#1c1c1c] border border-white/20 text-white placeholder-gray-400 px-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-mono" placeholder="https://images.unsplash.com/..." />
            </div>
            <div>
              <label className="block font-bold text-white uppercase mb-1.5">Target Department</label>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full bg-[#1c1c1c] border border-white/20 text-white px-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-bold uppercase">
                <option value="unisex" className="bg-black text-white">Unisex</option>
                <option value="women" className="bg-black text-white">Women</option>
                <option value="men" className="bg-black text-white">Men</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-4 border-t border-white/15">
            <button onClick={handleSave} className="btn-primary py-3 px-8 text-xs font-bold uppercase rounded-xl shadow-xl">{editing ? 'Update' : 'Create'} Category</button>
            <button onClick={resetForm} className="px-6 py-3 border border-white/20 text-gray-300 hover:text-white rounded-xl text-xs font-bold uppercase">Cancel</button>
          </div>
        </motion.div>
      )}

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-[#121212] border border-white/15 rounded-3xl p-5 shadow-xl space-y-3"
          >
            <div className="aspect-video bg-black rounded-2xl overflow-hidden relative border border-white/15">
              {cat.image && <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />}
              <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white uppercase">
                {cat.gender || 'Unisex'}
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
