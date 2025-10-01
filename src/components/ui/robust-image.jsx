import React, { useState } from 'react';

const FALLBACK_IMAGES = {
  food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
  recipe: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
  meal: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
  cooking: 'https://images.unsplash.com/photo-1556909114-c91da8019a7c?w=400&h=300&fit=crop'
};

const PLACEHOLDER_SVG = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbiBkZSByZWNldGE8L3RleHQ+Cjwvc3ZnPg==";

export default function RobustImage({ 
  src, 
  alt, 
  fallbackType = 'food',
  className = '',
  loading = 'lazy',
  ...props 
}) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    if (currentSrc === src) {
      // Try fallback image
      setCurrentSrc(FALLBACK_IMAGES[fallbackType] || FALLBACK_IMAGES.food);
    } else if (currentSrc !== PLACEHOLDER_SVG) {
      // If fallback also fails, use placeholder
      setCurrentSrc(PLACEHOLDER_SVG);
      setHasError(true);
    }
  };

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${className}`} {...props}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <div className="w-8 h-8 text-gray-400">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
          </div>
        </div>
      )}
      <img
        src={currentSrc}
        alt={alt}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
      />
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-400 text-sm">
          📸 Imagen no disponible
        </div>
      )}
    </div>
  );
}