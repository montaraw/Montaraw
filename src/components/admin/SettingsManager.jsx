import { useState } from 'react';
import { Save, Check } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';

export default function SettingsManager() {
  const { settings, updateSettings } = useProducts();
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl space-y-6 font-inter text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <span className="text-brand-red text-xs font-bold uppercase block mb-0.5">
            STORE CONFIGURATION
          </span>
          <h2 className="text-xl md:text-3xl font-black text-white uppercase">Store Settings</h2>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">Manage brand metadata, social profiles, and customer helpline.</p>
        </div>
        <button
          onClick={handleSave}
          className="btn-primary py-3 px-7 text-xs font-bold uppercase rounded-xl inline-flex items-center gap-2 self-start sm:self-auto shadow-xl"
        >
          {saved ? (
            <>
              <Check size={16} />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      <div className="bg-[#121212] border border-white/15 rounded-3xl p-6 md:p-8 space-y-4 text-xs shadow-2xl">
        <div>
          <label className="block font-bold text-white uppercase mb-1.5">Brand Name</label>
          <input
            value={form.brandName || ''}
            onChange={(e) => setForm({ ...form, brandName: e.target.value })}
            className="w-full bg-[#181818] border border-white/20 text-white px-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-medium"
          />
        </div>

        <div>
          <label className="block font-bold text-white uppercase mb-1.5">Brand Tagline</label>
          <input
            value={form.tagline || ''}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            className="w-full bg-[#181818] border border-white/20 text-white px-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-medium"
          />
        </div>

        <div>
          <label className="block font-bold text-white uppercase mb-1.5">Customer Support Email</label>
          <input
            value={form.contactEmail || ''}
            onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
            className="w-full bg-[#181818] border border-white/20 text-white px-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-medium"
          />
        </div>

        <div>
          <label className="block font-bold text-white uppercase mb-1.5">Customer Support Helpline</label>
          <input
            value={form.contactPhone || ''}
            onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
            className="w-full bg-[#181818] border border-white/20 text-white px-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-medium"
          />
        </div>

        <div>
          <label className="block font-bold text-white uppercase mb-1.5">Instagram Handle</label>
          <input
            value={form.instagram || ''}
            onChange={(e) => setForm({ ...form, instagram: e.target.value })}
            className="w-full bg-[#181818] border border-white/20 text-white px-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-medium"
          />
        </div>
      </div>
    </div>
  );
}
