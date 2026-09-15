import { useState, useRef } from 'react';
import { Video, Plus, X, Loader2, Play, Link as LinkIcon, Film, Sparkles } from 'lucide-react';
import { api } from '../../api/client';
import { isVideoUrl, getEmbedVideoUrl } from '../../utils/mediaHelper';

export default function MultiVideoUploadZone({
  videos = [],
  onChange,
  folder = 'montaraw_atelier/videos',
  label = 'Product Videos & Reels (Multiple Videos Supported)',
  helpText = 'Add direct video URLs (MP4, WebM, Cloudinary) or YouTube/Vimeo links. Videos will display alongside photos in the product gallery.',
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [showUrlField, setShowUrlField] = useState(false);
  const [previewVideo, setPreviewVideo] = useState(null);
  const fileInputRef = useRef(null);

  const validVideos = Array.isArray(videos) ? videos.filter(Boolean) : [];

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (validVideos.includes(trimmed)) {
      setError('This video URL is already added.');
      return;
    }
    setError('');
    onChange([...validVideos, trimmed]);
    setUrlInput('');
    setShowUrlField(false);
  };

  const handleFilesSelect = async (e) => {
    const rawFiles = Array.from(e.target.files || []);
    if (!rawFiles.length) return;

    setUploading(true);
    setError('');

    const newUrls = [];

    for (const rawFile of rawFiles) {
      try {
        // Try uploading to server/cloudinary
        const res = await api.uploadImage(rawFile, folder);
        if (res?.url) {
          newUrls.push(res.url);
        } else {
          throw new Error('Upload returned no URL');
        }
      } catch (err) {
        console.warn('[Video Upload Fallback to Local Reader]', err);
        await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (loadEvt) => {
            newUrls.push(loadEvt.target.result);
            resolve();
          };
          reader.readAsDataURL(rawFile);
        });
      }
    }

    if (newUrls.length > 0) {
      onChange([...validVideos, ...newUrls]);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = (index) => {
    const updated = validVideos.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3 font-inter text-xs">
      <div className="flex items-center justify-between">
        <div>
          <label className="block font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Film size={14} className="text-brand-red" />
            <span>{label}</span>
          </label>
          <span className="text-[11px] text-gray-400 font-medium">
            {validVideos.length} video{validVideos.length !== 1 ? 's' : ''} attached
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowUrlField(!showUrlField)}
          className="text-[11px] text-gray-300 hover:text-brand-red flex items-center gap-1.5 transition-colors font-semibold"
        >
          <LinkIcon size={12} />
          {showUrlField ? 'Close URL paste' : '+ Paste Video URL'}
        </button>
      </div>

      {showUrlField && (
        <div className="p-3.5 bg-[#181818] rounded-2xl border border-white/15 space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddUrl();
                }
              }}
              placeholder="https://... (MP4, WebM, Cloudinary video URL or YouTube link)"
              className="flex-1 bg-[#121212] border border-white/20 text-white px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-brand-red font-mono"
            />
            <button
              type="button"
              onClick={handleAddUrl}
              className="btn-primary py-2.5 px-4 rounded-xl text-xs font-bold uppercase shrink-0"
            >
              Add Video
            </button>
          </div>
          <p className="text-[10px] text-gray-400">
            Tip: You can paste direct video links (.mp4, .webm) or embeddable video URLs.
          </p>
        </div>
      )}

      {/* Hidden File Input for Video */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="video/mp4,video/webm,video/quicktime,video/*"
        onChange={handleFilesSelect}
        className="hidden"
      />

      {/* Grid of uploaded videos + Add Box */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {validVideos.map((url, index) => {
          const isEmbed = url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');
          return (
            <div
              key={index}
              className="relative group aspect-[3/4] bg-black rounded-2xl overflow-hidden border border-white/20 shadow-lg flex flex-col items-center justify-center"
            >
              {isEmbed ? (
                <iframe
                  src={getEmbedVideoUrl(url)}
                  title={`Product Video ${index + 1}`}
                  className="w-full h-full pointer-events-none opacity-80"
                />
              ) : (
                <video
                  src={url}
                  className="w-full h-full object-cover opacity-80"
                  muted
                  playsInline
                  onMouseOver={(e) => e.target.play().catch(() => {})}
                  onMouseOut={(e) => e.target.pause()}
                />
              )}

              {/* Video Badge */}
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-brand-red border border-white/10 text-[9px] font-bold uppercase flex items-center gap-1 shadow-md">
                <Play size={10} fill="currentColor" />
                <span>Video #{index + 1}</span>
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 text-white hover:text-red-400 hover:bg-black transition-colors"
                title="Delete Video"
              >
                <X size={12} />
              </button>

              {/* Quick Play overlay button */}
              <button
                type="button"
                onClick={() => setPreviewVideo(url)}
                className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <div className="w-9 h-9 rounded-full bg-brand-red text-white flex items-center justify-center shadow-lg">
                  <Play size={16} fill="currentColor" className="ml-0.5" />
                </div>
              </button>
            </div>
          );
        })}

        {/* Upload / Add Video Box */}
        <div
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
                <Video size={20} />
              </div>
              <div>
                <p className="font-bold text-white text-[11px] uppercase">+ Add Video</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Upload .mp4 / .webm</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-[11px] text-red-400">{error}</p>}
      <p className="text-[10px] text-gray-400">{helpText}</p>

      {/* Mini Video Preview Modal */}
      {previewVideo && (
        <div
          className="fixed inset-0 z-[130] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewVideo(null)}
        >
          <div
            className="relative max-w-xl w-full bg-[#141414] rounded-3xl overflow-hidden border border-white/20 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <span className="font-bold text-xs uppercase text-white flex items-center gap-2">
                <Play size={14} className="text-brand-red" />
                Video Preview
              </span>
              <button
                type="button"
                onClick={() => setPreviewVideo(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X size={16} />
              </button>
            </div>
            {previewVideo.includes('youtube.com') || previewVideo.includes('youtu.be') || previewVideo.includes('vimeo.com') ? (
              <div className="aspect-video w-full rounded-2xl overflow-hidden">
                <iframe
                  src={getEmbedVideoUrl(previewVideo)}
                  title="Video preview"
                  className="w-full h-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              </div>
            ) : (
              <video
                src={previewVideo}
                controls
                autoPlay
                className="w-full max-h-[60vh] object-contain rounded-2xl bg-black"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
