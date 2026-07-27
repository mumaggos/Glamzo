import React, { useState, useEffect, ComponentProps } from 'react';
import { optimizeUnsplashUrl } from '../utils/optimizeUnsplashUrl';

export type ImageProps = ComponentProps<'img'> & {
  fill?: boolean;
  priority?: boolean;
}

export function Image({ src, alt, fill, priority, className, sizes, ...props }: ImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [optimizedSrc, setOptimizedSrc] = useState<string | undefined>(src);

  useEffect(() => {
    let url = src;
    if (typeof src === 'string' && src.includes('images.unsplash.com') && !src.includes('fm=webp')) {
      url = optimizeUnsplashUrl(src);
    }
    setOptimizedSrc(url);
  }, [src]);

  return (
    <img
      src={optimizedSrc}
      alt={alt || ""}
      sizes={sizes}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      onLoad={() => setIsLoaded(true)}
      className={`
        ${fill ? 'absolute inset-0 w-full h-full object-cover' : ''} 
        ${!isLoaded && !priority ? 'blur-sm grayscale' : 'blur-0 grayscale-0'} 
        transition-all duration-300 ease-in-out
        ${className || ''}
      `}
      {...props}
    />
  );
}
