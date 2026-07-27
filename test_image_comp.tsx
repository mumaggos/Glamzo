import React, { useState, ComponentProps, useMemo } from 'react';

export type ImageProps = ComponentProps<'img'> & {
  fill?: boolean;
  priority?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

const WIDTHS = [320, 640, 768, 1024, 1280, 1600, 1920];

export function Image({ src, alt, fill, priority, className, sizes = "100vw", objectFit = 'cover', width, height, ...props }: ImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Responsive srcSet generator for Unsplash
  const generateUnsplashSrcSet = (urlStr: string, format: string) => {
    try {
      // Handle both absolute and relative urls if needed, but unsplash is absolute
      const url = new URL(urlStr);
      url.searchParams.delete('fm');
      url.searchParams.delete('w');
      url.searchParams.delete('q');
      url.searchParams.set('auto', 'format,compress');
      url.searchParams.set('fit', 'crop');
      
      return WIDTHS.map(w => {
        return `${url.toString()}&fm=${format}&w=${w}&q=${format === 'avif' ? 50 : 70} ${w}w`;
      }).join(', ');
    } catch (e) {
      return '';
    }
  };

  const sources = useMemo(() => {
    if (typeof src !== 'string') return null;
    if (src.includes('images.unsplash.com')) {
      const avifSrcSet = generateUnsplashSrcSet(src, 'avif');
      const webpSrcSet = generateUnsplashSrcSet(src, 'webp');
      
      return (
        <>
          {avifSrcSet && <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} />}
          {webpSrcSet && <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />}
        </>
      );
    }
    return null;
  }, [src, sizes]);

  const baseSrc = useMemo(() => {
    if (typeof src !== 'string') return src;
    if (src.includes('images.unsplash.com')) {
       try {
         const url = new URL(src);
         if (!url.searchParams.has('w')) {
            url.searchParams.set('w', '800');
         }
         url.searchParams.set('fm', 'webp');
         url.searchParams.set('q', '70');
         return url.toString();
       } catch (e) {
         return src;
       }
    }
    return src;
  }, [src]);

  // A wrapper is only strictly necessary if we rely on `fill` and need absolute positioning, 
  // but <picture> can be styled block/absolute itself.
  
  // Actually, to make <picture> match `fill`, we can apply absolute inset-0 to <picture>
  const pictureClass = fill 
    ? 'absolute inset-0 w-full h-full' 
    : 'relative w-full h-full block';

  return (
    <picture className={`${pictureClass} ${className || ''} overflow-hidden flex`}>
      {sources}
      <img
        src={baseSrc}
        alt={alt || ""}
        sizes={sizes}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => setIsLoaded(true)}
        className={`
          w-full h-full 
          ${fill ? `object-${objectFit}` : ''} 
          ${!isLoaded && !priority ? 'blur-xl scale-110 grayscale' : 'blur-0 scale-100 grayscale-0'} 
          transition-all duration-700 ease-out
        `}
        style={{ color: 'transparent' }}
        {...props}
      />
    </picture>
  );
}
