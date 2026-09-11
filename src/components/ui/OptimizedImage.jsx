import { useState, memo } from 'react';
import { getOptimizedImageUrl } from '../../utils/imageOptimizer';

const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  width = 600,
  quality = 'auto',
  className = '',
  aspectRatio = 'aspect-[3/4]',
  priority = false,
  fallback = 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80',
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const optimizedSrc = getOptimizedImageUrl(hasError ? fallback : src, { width, quality });

  return (
    <div className={`relative overflow-hidden ${aspectRatio} ${className}`}>
      {/* Low-cost blur-up background placeholder to prevent layout shift */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#171717] animate-pulse" />
      )}

      <img
        src={optimizedSrc}
        alt={alt || 'Montaraw Luxury Garment'}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${props.imgClassName || ''}`}
        {...props}
      />
    </div>
  );
});

export default OptimizedImage;
