/**
 * Media Helper Utility for Montaraw Product Galleries
 * Safely parses and normalizes images and videos.
 */

export const isVideoUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const cleanUrl = url.toLowerCase().split('?')[0];
  return (
    cleanUrl.endsWith('.mp4') ||
    cleanUrl.endsWith('.webm') ||
    cleanUrl.endsWith('.ogg') ||
    cleanUrl.endsWith('.mov') ||
    cleanUrl.endsWith('.m4v') ||
    cleanUrl.includes('youtube.com') ||
    cleanUrl.includes('youtu.be') ||
    cleanUrl.includes('vimeo.com') ||
    cleanUrl.includes('/video/') ||
    url.startsWith('data:video/')
  );
};

export const getEmbedVideoUrl = (url) => {
  if (!url) return '';
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
  }
  if (url.includes('vimeo.com/')) {
    const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
    return `https://player.vimeo.com/video/${videoId}`;
  }
  return url;
};

export const normalizeProductMedia = (images = [], videos = []) => {
  const mediaList = [];
  const seenUrls = new Set();

  // 1. Process explicit images
  if (Array.isArray(images)) {
    images.forEach((img) => {
      if (!img || seenUrls.has(img)) return;
      seenUrls.add(img);
      if (isVideoUrl(img)) {
        mediaList.push({ type: 'video', url: img });
      } else {
        mediaList.push({ type: 'image', url: img });
      }
    });
  }

  // 2. Process explicit videos
  if (Array.isArray(videos)) {
    videos.forEach((vid) => {
      if (!vid || seenUrls.has(vid)) return;
      seenUrls.add(vid);
      mediaList.push({ type: 'video', url: vid });
    });
  }

  return mediaList;
};
