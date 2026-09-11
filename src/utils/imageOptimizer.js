/**
 * Montaraw Intelligent Image Optimizer
 * Injects automatic WebP/AVIF format selection (f_auto), intelligent compression (q_auto),
 * responsive width bounding (w_xxx), and device pixel ratio adaptation (dpr_auto)
 * for Cloudinary and Unsplash image URLs.
 */
export function getOptimizedImageUrl(url, { width = 600, quality = 'auto' } = {}) {
  if (!url) return 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80';

  // 1. Cloudinary Dynamic Transformation Injection
  if (url.includes('res.cloudinary.com')) {
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex !== -1) {
      // Check if transformation is already present
      const afterUpload = url.slice(uploadIndex + 8);
      if (afterUpload.startsWith('f_auto') || afterUpload.startsWith('w_')) {
        return url;
      }
      const transform = `f_auto,q_${quality},w_${width},c_limit,dpr_auto`;
      return `${url.slice(0, uploadIndex + 8)}${transform}/${afterUpload}`;
    }
  }

  // 2. Unsplash Dynamic Compression & Format Optimization
  if (url.includes('images.unsplash.com')) {
    const cleanUrl = url.split('?')[0];
    const qValue = quality === 'auto' ? 80 : quality;
    return `${cleanUrl}?auto=format&fit=crop&w=${width}&q=${qValue}`;
  }

  return url;
}
