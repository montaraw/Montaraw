import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Search, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '../../context/ProductContext';
import MultiImageUploadZone from './MultiImageUploadZone';

const emptyProduct = {
  name: '',
  gender: 'women',
  category: 'pakistani-suits',
  price: '',
  originalPrice: '',
  description: '',
  fabric: '100% Premium Pure Fabric',
  fit: 'Tailored Fit',
  image: '',
  images: [],
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
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [sizesInput, setSizesInput] = useState('XS,S,M,L,XL');
  const [colorsInput, setColorsInput] = useState('#000000');
  const [colorNamesInput, setColorNamesInput] = useState('Noir Black');

  const handleSave = (e) => {
    e?.preventDefault();
    if (!form.name || !form.price) return;

    const validImages = form.images && form.images.length > 0
      ? form.images
      : (form.image ? [form.image] : []);

    const primaryImg = validImages[0] || form.image;

    const data = {
      ...form,
      price: Number(form.price),
      originalPrice: Number(form.originalPrice) || Number(form.price),
      sizes: sizesInput.split(',').map((s) => s.trim()).filter(Boolean),
      colors: colorsInput.split(',').map((s) => s.trim()).filter(Boolean),
      colorNames: colorNamesInput.split(',').map((s) => s.trim()).filter(Boolean),
      image: primaryImg,
      images: validImages,
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
    const existingImages = Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : (product.image ? [product.image] : []);

    setForm({
      name: product.name,
      gender: product.gender || 'women',
      category: product.categorySlug || (typeof product.category === 'object' ? product.category?.slug : product.category) || 'pakistani-suits',
      price: product.price,
      originalPrice: product.originalPrice,
      description: product.description || '',
      fabric: product.fabric || '',
      fit: product.fit || '',
      image: product.image || existingImages[0] || '',
      images: existingImages,
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

  const quickNewItem = (targetGender, targetCategorySlug) => {
    resetForm();
    setForm({
      ...emptyProduct,
      gender: targetGender,
      category: targetCategorySlug,
    });
    setShowForm(true);
  };

  const filteredList = products.filter((p) => {
    const matchesGender = genderFilter === 'all' || p.gender === genderFilter;
    const catSlug = (typeof p.category === 'object' ? p.category?.slug : p.category) || p.categorySlug || '';
    const matchesCategory = categoryFilter === 'all' || catSlug === categoryFilter;
    const q = searchFilter.toLowerCase();
    const catName = (typeof p.category === 'object' ? p.category?.name : p.category) || p.categorySlug || '';
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || catName.toLowerCase().includes(q);
    return matchesGender && matchesCategory && matchesSearch;
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
            Add, edit, or adjust garments across Pakistani Suits, Suits, Cord Sets, and Men collections.
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

      {/* Quick Add Subcategory Actions Bar */}
      <div className="p-4 bg-[#141414] border border-white/15 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-gray-300 font-bold uppercase text-[11px] flex items-center gap-1.5">
          <Sparkles size={14} className="text-brand-red" />
          Quick Add Under Subcategories:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => quickNewItem('women', 'pakistani-suits')}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-brand-red text-white text-[11px] font-bold uppercase transition-all flex items-center gap-1"
          >
            <Plus size={13} /> Pakistani Suit
          </button>
          <button
            onClick={() => quickNewItem('women', 'suits')}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-brand-red text-white text-[11px] font-bold uppercase transition-all flex items-center gap-1"
          >
            <Plus size={13} /> Suit / Anarkali
          </button>
          <button
            onClick={() => quickNewItem('women', 'cord-set')}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-brand-red text-white text-[11px] font-bold uppercase transition-all flex items-center gap-1"
          >
            <Plus size={13} /> Cord Set
          </button>
          <button
            onClick={() => quickNewItem('men', 'pakistani-suits')}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-blue-600 text-white text-[11px] font-bold uppercase transition-all flex items-center gap-1"
          >
            <Plus size={13} /> Men Streetwear
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'all', label: `All Garments (${products.length})` },
          { id: 'pakistani-suits', label: `✨ Pakistani Suits (${products.filter(p => (p.categorySlug || p.category) === 'pakistani-suits').length})` },
          { id: 'suits', label: `✨ Suits (${products.filter(p => (p.categorySlug || p.category) === 'suits').length})` },
          { id: 'cord-set', label: `✨ Cord Sets (${products.filter(p => (p.categorySlug || p.category) === 'cord-set').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setCategoryFilter(tab.id);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase transition-all shrink-0 ${
              categoryFilter === tab.id
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
            {/* Dark Blur Backdrop */}
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
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#141414] border border-white/20 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6 z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/15 sticky -top-2 bg-[#141414] z-20">
                <div>
                  <span className="text-[10px] font-bold text-brand-red uppercase tracking-wider block">
                    {editing ? 'Modify Inventory Piece' : 'New Collection Piece'}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white uppercase">
                    {editing ? 'Edit Garment Details' : 'Create New Collection Piece'}
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
                    placeholder="e.g. Royal Embroidered Velvet Pakistani Suit"
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
                    Category / Subcategory *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-[#1c1c1c] border border-white/20 text-white px-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-bold uppercase"
                  >
                    <optgroup label="✨ Women Atelier Subcategories" className="bg-black text-brand-red font-bold">
                      {categories
                        .filter((c) => c.gender === 'women')
                        .map((cat) => (
                          <option key={cat.id || cat.slug} value={cat.slug} className="bg-[#181818] text-white">
                            {cat.name}
                          </option>
                        ))}
                    </optgroup>

                    <optgroup label="🔥 Men / Unisex Collections" className="bg-black text-blue-400 font-bold">
                      {categories
                        .filter((c) => c.gender !== 'women')
                        .map((cat) => (
                          <option key={cat.id || cat.slug} value={cat.slug} className="bg-[#181818] text-white">
                            {cat.name}
                          </option>
                        ))}
                    </optgroup>
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
                  <MultiImageUploadZone
                    images={form.images?.length ? form.images : (form.image ? [form.image] : [])}
                    onChange={(newImages) => {
                      setForm({
                        ...form,
                        images: newImages,
                        image: newImages[0] || '',
                      });
                    }}
                    folder="montaraw_atelier/products"
                    label="Product Image Gallery (2-5+ Photos with Auto-Scroll Carousel) *"
                    helpText="Upload 2, 3, 4, 5+ photos. First photo is cover; all photos will auto-scroll on product page and zoom on click."
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
          </div>
        )}
      </AnimatePresence>

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
