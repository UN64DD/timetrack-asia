import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1594882645126-14020914d58d?q=80&w=2000&auto=format&fit=crop';

export default function ImageWithFallback({
  src,
  alt,
  className = '',
  fallbackSrc = DEFAULT_FALLBACK
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <img
        src={imgSrc}
        alt={alt}
        className={className}
        onError={handleError}
      />
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/5">
          <ImageIcon size={32} className="text-white/20" />
        </div>
      )}
    </div>
  );
}
