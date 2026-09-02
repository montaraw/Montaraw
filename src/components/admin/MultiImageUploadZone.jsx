import { useState, useRef } from 'react';
import { UploadCloud, Plus, X, Loader2, CheckCircle2, Image as ImageIcon, Star } from 'lucide-react';
import { api } from '../../api/client';

export default function MultiImageUploadZone({
  images = [],
  onChange,
  folder = 'montaraw_atelier/products',
  label = 'Product Image Gallery (2-5+ Photos) *',
  helpText = 'Upload multiple high-res photos for 360° views & auto-scroll showcase',
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [showUrlField, setShowUrlField] = useState(false);
  const fileInputRef = useRef(null);

  const validImages = Array.isArray(images) ? images.filter(Boolean) : [];

  const handleFilesSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setError('');

    const newUrls = [];

    for (const file of files) {
      if (file.size > 15 * 1024 * 1024) {
        setError('One or more files exceed 15MB limit.');
        continue;
      }

      try {
        const res = await api.uploadImage(file, folder);
        if (res?.url) {
          newUrls.push(res.url);
        } else {
          throw new Error('No URL returned');
        }
      } catch (err) {
        console.warn('[Upload Fallback to Local Reader]', err);
        // Fallback local reader
        await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (loadEvt) => {
            newUrls.push(loadEvt.target.result);
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }
    }

    if (newUrls.length > 0) {
      onChange([...validImages, ...newUrls]);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (files && files.length) {
      handleFilesSelect({ target: { files } });
    }
  };

  const handleRemove = (index) => {
    const updated = validImages.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleSetPrimary = (index) => {
    if (index === 0) return;
    const selected = validImages[index];
    const rest = validImages.filter((_, i) => i !== index);
    onChange([selected, ...rest]);
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    onChange([...validImages, urlInput.trim()]);
    setUrlInput('');
    setShowUrlField(false);
  };

  return (
    <div className="space-y-3 font-inter text-xs">
      <div className="flex items-center justify-between">
        <div>
          <label className="block font-bold text-white uppercase tracking-wider">
            {label}
          </label>
          <span className="text-[11px] text-gray-400 font-medium">
            {validImages.length} image{validImages.length !== 1 ? 's' : ''} in gallery
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowUrlField(!showUrlField)}
          className="text-[11px] text-gray-400 hover:text-brand-red flex items-center gap-1 transition-colors"
        >
          {showUrlField ? 'Close URL paste' : '+ Paste Image URL'}
        </button>
      </div>

      {showUrlField && (
        <div className="flex items-center gap-2 p-3 bg-[#181818] rounded-2xl border border-white/15">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://images.unsplash.com/... or https://res.cloudinary.com/..."
            className="flex-1 bg-[#121212] border border-white/20 text-white px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-brand-red font-mono"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="btn-primary py-2.5 px-4 rounded-xl text-xs font-bold uppercase"
          >
            Add
          </button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFilesSelect}
        className="hidden"
      />

      {/* Grid of uploaded images + Add Box */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {validImages.map((url, index) => (
          <div
            key={index}
            className="relative group aspect-[3/4] bg-black rounded-2xl overflow-hidden border border-white/20 shadow-lg"
          >
            <img src={url} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />

            {/* Primary Badge */}
            {index === 0 ? (
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-brand-red text-white text-[9px] font-bold uppercase shadow-md flex items-center gap-1">
                <Star size={10} fill="currentColor" />
                <span>Primary</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => handleSetPrimary(index)}
                className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 hover:bg-white text-white hover:text-black text-[9px] font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity"
                title="Make Cover / Primary Photo"
              >
                Set Cover
              </button>
            )}

            {/* Remove Button */}
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 text-white hover:text-red-400 hover:bg-black transition-colors"
              title="Delete Photo"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {/* Upload Add Box */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`aspect-[3/4] border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            uploading
              ? 'border-brand-red bg-brand-red/5'
              : 'border-white/20 hover:border-brand-red bg-[#161616] hover:bg-[#1c1c1c]'
          }`}
        >
          {uploading ? (
            <div className="space-y-1.5 flex flex-col items-center justify-center">
              <Loader2 size={22} className="animate-spin text-brand-red" />
              <p className="text-[10px] font-bold text-white uppercase">Uploading...</p>
            </div>
          ) : (
            <div className="space-y-2 flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-brand-red">
                <Plus size={20} />
              </div>
              <div>
                <p className="font-bold text-white text-[11px] uppercase">+ Add Photos</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Select 1 or more</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-[11px] text-red-400">{error}</p>}
      <p className="text-[10px] text-gray-400">{helpText}</p>
    </div>
  );
}
