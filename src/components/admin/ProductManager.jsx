import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Search, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProducts } from '../../context/ProductContext';

const emptyProduct = {
  name: '',
  gender: 'women',
  category: 'dresses',
  price: '',
  originalPrice: '',
  description: '',
  fabric: '100% Bio-Washed Combed Cotton (240 GSM)',
  fit: 'Relaxed Fit',
  image: '',
  sizes: ['XS', 'S', 'M', 'L', 'XL'],
  colors: ['#000000'],
  colorNames: ['Noir Black'],
  isNew: true,
  isSale: false,
  rating: 4.8,
  reviews: 12,
};

export default function ProductManager() {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useProducts();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [showForm, setShowForm] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');

  const [sizesInput, setSizesInput] = useState('XS,S,M,L,XL');
  const [colorsInput, setColorsInput] = useState('#000000');
  const [colorNamesInput, setColorNamesInput] = useState('Noir Black');

  const handleSave = (e) => {
    e?.preventDefault();
    if (!form.name || !form.price) return;

    const data = {
      ...form,
      price: Number(form.price),
      originalPrice: Number(form.originalPrice) || Number(form.price),
      sizes: sizesInput.split(',').map((s) => s.trim()).filter(Boolean),
      colors: colorsInput.split(',').map((s) => s.trim()).filter(Boolean),
      colorNames: colorNamesInput.split(',').map((s) => s.trim()).filter(Boolean),
      images: [form.image],
    };

    if (editing) {
      updateProduct(editing, data);
    } else {
      addProduct(data);
    }
    resetForm();
  };

  const handleEdit = (product) => {
    setEditing(product.id);
    setForm({
      name: product.name,
      gender: product.gender || 'women',
      category: product.categorySlug || (typeof product.category === 'object' ? product.category?.slug : product.category) || 'dresses',
      price: product.price,
      originalPrice: product.originalPrice,
      description: product.description || '',
      fabric: product.fabric || '',
      fit: product.fit || '',
      image: product.image,
      isNew: product.isNew ?? false,
      isSale: product.isSale ?? false,
      rating: product.rating || 4.8,
      reviews: product.reviews || 0,
    });
    setSizesInput((product.sizes || ['S', 'M', 'L']).join(','));
    setColorsInput((product.colors || ['#000000']).join(','));
    setColorNamesInput((product.colorNames || ['Black']).join(','));
    setShowForm(true);
  };

  const resetForm = () => {
    setForm(emptyProduct);
    setSizesInput('XS,S,M,L,XL');
    setColorsInput('#000000');
    setColorNamesInput('Noir Black');
    setEditing(null);
    setShowForm(false);
  };

  const filteredList = products.filter((p) => {
    const matchesGender = genderFilter === 'all' || p.gender === genderFilter;
    const q = searchFilter.toLowerCase();
    const catName = (typeof p.category === 'object' ? p.category?.name : p.category) || p.categorySlug || '';
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || catName.toLowerCase().includes(q);
    return matchesGender && matchesSearch;
  });

  return (
    <div className="space-y-6 font-inter text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <span className="text-brand-red text-xs font-bold uppercase block mb-0.5">
            INVENTORY CURATION
          </span>
          <h2 className="text-xl md:text-3xl font-black text-white uppercase">
            Product Catalog ({filteredList.length})
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Add, edit, or adjust garments across Women's, Men's, and Couture lines.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="btn-primary py-3 px-6 text-xs font-bold uppercase rounded-xl inline-flex items-center gap-2 self-start sm:self-auto shadow-xl"
        >
          <Plus size={16} />
          <span>New Garment Piece</span>
        </button>
      </div>

      {/* Form Drawer / Card */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#141414] border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6"
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/15">
            <h3 className="text-base font-bold text-white uppercase">
              {editing ? 'Edit Garment Details' : 'Create New Collection Piece'}
            </h3>
            <button onClick={resetForm} className="p-2 text-white hover:text-gray-300 rounded-full bg-white/10 transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="block font-bold text-white uppercase mb-1.5">
                Garment Title *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Noir Velvet Cutout Midi Dress"
                className="w-full bg-[#1c1c1c] border border-white/20 text-white placeholder-gray-400 px-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-white uppercase mb-1.5">
                Department / Gender *
              </label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full bg-[#1c1c1c] border border-white/20 text-white px-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-bold uppercase"
              >
                <option value="women" className="bg-black text-white">Women</option>
                <option value="men" className="bg-black text-white">Men</option>
                <option value="unisex" className="bg-black text-white">Unisex</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-white uppercase mb-1.5">
                Category *
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-[#1c1c1c] border border-white/20 text-white px-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-bold uppercase"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug} className="bg-black text-white">
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-white uppercase mb-1.5">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="e.g. 2499"
                className="w-full bg-[#1c1c1c] border border-white/20 text-white px-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-white uppercase mb-1.5">
                Original MRP (₹)
              </label>
              <input
                type="number"
                value={form.originalPrice}
                onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                placeholder="e.g. 3999"
                className="w-full bg-[#1c1c1c] border border-white/20 text-white px-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-medium"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block font-bold text-white uppercase mb-1.5">
                Image URL *
              </label>
              <input
                type="text"
                required
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-[#1c1c1c] border border-white/20 text-white placeholder-gray-400 px-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-mono"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block font-bold text-white uppercase mb-1.5">
                Description
              </label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Product description and features..."
                className="w-full bg-[#1c1c1c] border border-white/20 text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-brand-red resize-none font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-white uppercase mb-1.5">
                Available Sizes (comma separated)
              </label>
              <input
                type="text"
                value={sizesInput}
                onChange={(e) => setSizesInput(e.target.value)}
                placeholder="XS,S,M,L,XL"
                className="w-full bg-[#1c1c1c] border border-white/20 text-white px-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-white uppercase mb-1.5">
                Color Codes (hex comma separated)
              </label>
              <input
                type="text"
                value={colorsInput}
                onChange={(e) => setColorsInput(e.target.value)}
                placeholder="#000000,#f5f5f5"
                className="w-full bg-[#1c1c1c] border border-white/20 text-white px-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-white uppercase mb-1.5">
                Color Names (comma separated)
              </label>
              <input
                type="text"
                value={colorNamesInput}
                onChange={(e) => setColorNamesInput(e.target.value)}
                placeholder="Noir Black,Off White"
                className="w-full bg-[#1c1c1c] border border-white/20 text-white px-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-medium"
              />
            </div>

            <div className="flex flex-wrap items-center gap-6 md:col-span-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
                <input
                  type="checkbox"
                  checked={form.isNew}
                  onChange={(e) => setForm({ ...form, isNew: e.target.checked })}
                  className="w-4 h-4 accent-brand-red"
                />
                <span>Mark as New Arrival Drop</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
                <input
                  type="checkbox"
                  checked={form.isSale}
                  onChange={(e) => setForm({ ...form, isSale: e.target.checked })}
                  className="w-4 h-4 accent-brand-red"
                />
                <span>Mark as On Sale / Archive</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-white/15">
            <button
              type="button"
              onClick={handleSave}
              className="btn-primary py-3 px-8 text-xs font-bold uppercase rounded-xl shadow-xl"
            >
              {editing ? 'Save Updates' : 'Publish Product'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 border border-white/20 text-gray-300 hover:text-white rounded-xl text-xs font-bold uppercase"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#141414] p-3 rounded-2xl border border-white/15 shadow-xl">
        <div className="flex items-center gap-2 bg-[#1c1c1c] px-3.5 py-2.5 rounded-xl border border-white/20 w-full sm:w-80">
          <Search size={16} className="text-gray-300 shrink-0" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="bg-transparent text-xs text-white placeholder-gray-400 focus:outline-none w-full font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar py-1">
          {['all', 'women', 'men', 'unisex'].map((g) => (
            <button
              key={g}
              onClick={() => setGenderFilter(g)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase transition-all shrink-0 ${
                genderFilter === g
                  ? 'bg-white text-black shadow-md'
                  : 'bg-[#1c1c1c] text-gray-300 hover:text-white border border-white/15'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table & Mobile Cards */}
      <div className="bg-[#121212] border border-white/15 rounded-3xl overflow-hidden shadow-2xl">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#181818] border-b border-white/15 text-gray-300 font-bold uppercase">
              <tr>
                <th className="py-4 px-5">Garment</th>
                <th className="py-4 px-5">Gender</th>
                <th className="py-4 px-5">Category</th>
                <th className="py-4 px-5 text-right">Price</th>
                <th className="py-4 px-5 text-center">Tags</th>
                <th className="py-4 px-5 text-right w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredList.map((product) => (
                <tr key={product.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt="" className="w-10 h-12 object-cover rounded-xl bg-black border border-white/15 shrink-0" />
                      <div>
                        <span className="font-bold text-white text-sm block line-clamp-1">{product.name}</span>
                        <span className="text-[11px] text-gray-400">Sizes: {product.sizes?.join(', ')}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-5 capitalize">
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                        product.gender === 'women'
                          ? 'bg-brand-red/20 text-brand-red border-brand-red/30'
                          : product.gender === 'men'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                      }`}
                    >
                      {product.gender}
                    </span>
                  </td>

                  <td className="py-4 px-5 text-gray-300 font-medium capitalize">
                    {typeof product.category === 'object' && product.category?.name ? product.category.name : (typeof product.category === 'string' ? product.category.replace(/-/g, ' ') : (product.categorySlug?.replace(/-/g, ' ') || 'Collection'))}
                  </td>

                  <td className="py-4 px-5 text-right font-black text-white text-sm">
                    ₹{product.price.toLocaleString()}
                  </td>

                  <td className="py-4 px-5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {product.isNew && (
                        <span className="text-[10px] bg-brand-red text-white px-2 py-0.5 rounded-full font-bold uppercase">
                          NEW
                        </span>
                      )}
                      {product.isSale && (
                        <span className="text-[10px] bg-green-500/20 text-green-300 border border-green-500/40 px-2 py-0.5 rounded-full font-bold uppercase">
                          SALE
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 text-gray-300 hover:text-white rounded-xl hover:bg-white/10 border border-transparent hover:border-white/15 transition-all"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete ${product.name}?`)) {
                            deleteProduct(product.id);
                          }
                        }}
                        className="p-2 text-gray-300 hover:text-red-400 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="block md:hidden divide-y divide-white/10">
          {filteredList.map((product) => (
            <div key={product.id} className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <img src={product.image} alt="" className="w-12 h-14 object-cover rounded-xl bg-black border border-white/15 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-brand-red/20 text-brand-red">
                      {product.gender}
                    </span>
                    <span className="text-xs text-gray-400 capitalize">
                      {typeof product.category === 'object' && product.category?.name ? product.category.name : (typeof product.category === 'string' ? product.category.replace(/-/g, ' ') : (product.categorySlug?.replace(/-/g, ' ') || 'Collection'))}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm line-clamp-1">{product.name}</h4>
                  <span className="font-black text-white text-sm">₹{product.price.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                <span className="text-gray-400 text-[11px]">Sizes: {product.sizes?.join(', ')}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs inline-flex items-center gap-1"
                  >
                    <Pencil size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete ${product.name}?`)) {
                        deleteProduct(product.id);
                      }
                    }}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
