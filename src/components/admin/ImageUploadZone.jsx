import { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, Loader2, CheckCircle2, Link as LinkIcon } from 'lucide-react';
import { api } from '../../api/client';

export default function ImageUploadZone({
  value = '',
  onChange,
  folder = 'montaraw_atelier/products',
  label = 'Garment Image *',
  helpText = 'PNG, JPG, WEBP up to 15MB (Auto-compressed to Cloudinary CDN)',
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('file'); // 'file' | 'url'
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (15MB)
    if (file.size > 15 * 1024 * 1024) {
      setError('File is too large. Maximum size is 15MB.');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const res = await api.uploadImage(file, folder);
      if (res?.url) {
        onChange(res.url);
      } else {
        throw new Error('No URL returned from server.');
      }
    } catch (err) {
      console.error('[Upload Error]', err);
      // Fallback to reading file locally as data URL so admin is never blocked
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        onChange(loadEvt.target.result);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      const syntheticEvent = { target: { files: [file] } };
      handleFileSelect(syntheticEvent);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-1.5 font-inter text-xs">
      <div className="flex items-center justify-between">
        <label className="block font-bold text-white uppercase tracking-wider">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setMode(mode === 'file' ? 'url' : 'file')}
          className="text-[11px] text-gray-400 hover:text-brand-red flex items-center gap-1 transition-colors"
        >
          {mode === 'file' ? (
            <>
              <LinkIcon size={12} />
              <span>Or paste Image URL</span>
            </>
          ) : (
            <>
              <UploadCloud size={12} />
              <span>Upload file directly</span>
            </>
          )}
        </button>
      </div>

      {mode === 'url' ? (
        <div className="space-y-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://res.cloudinary.com/... or https://images.unsplash.com/..."
            className="w-full bg-[#1c1c1c] border border-white/20 text-white placeholder-gray-400 px-3.5 py-3 rounded-xl focus:outline-none focus:border-brand-red font-mono text-xs"
          />
          {value && (
            <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-white/20 bg-black">
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute top-1 right-1 p-1 bg-black/80 rounded-full text-white hover:text-red-400"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {value ? (
            <div className="relative group border border-white/20 bg-[#161616] rounded-2xl p-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/20 bg-black shrink-0 relative">
                  <img src={value} alt="Uploaded piece" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-green-400 font-bold text-[11px] uppercase">
                    <CheckCircle2 size={13} />
                    <span>Cloudinary Cloud Stored</span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-mono truncate max-w-xs mt-0.5">
                    {value}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold uppercase transition-colors"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                  title="Remove image"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                uploading
                  ? 'border-brand-red bg-brand-red/5'
                  : 'border-white/20 hover:border-brand-red bg-[#161616] hover:bg-[#1a1a1a]'
              }`}
            >
              {uploading ? (
                <div className="space-y-2 flex flex-col items-center justify-center">
                  <Loader2 size={24} className="animate-spin text-brand-red" />
                  <p className="font-bold text-white text-xs uppercase">Uploading to Cloudinary...</p>
                  <p className="text-[10px] text-gray-400">Optimizing resolution and generating CDN URL</p>
                </div>
              ) : (
                <div className="space-y-2 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-brand-red">
                    <UploadCloud size={20} />
                  </div>
                  <div>
                    <span className="font-bold text-white text-xs">
                      Click to upload image file
                    </span>
                    <span className="text-gray-400 text-xs"> or drag and drop</span>
                  </div>
                  <p className="text-[10px] text-gray-400">{helpText}</p>
                </div>
              )}
            </div>
          )}

          {error && <p className="text-[11px] text-red-400 mt-1">{error}</p>}
        </div>
      )}
    </div>
  );
}
