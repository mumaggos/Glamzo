import React, { useState, ComponentProps, useMemo, useEffect } from 'react';

export type ImageProps = ComponentProps<'img'> & {
  fill?: boolean;
  priority?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

const WIDTHS = [320, 640, 768, 1024, 1280, 1600, 1920];

export function Image({ src, alt, fill, priority, className, sizes = "100vw", objectFit = 'cover', width, height, ...props }: ImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    if (!src) {
      setIsLoaded(true);
      setHasError(true);
    }
  }, [src]);

  // Responsive srcSet generator for Unsplash
  const generateUnsplashSrcSet = (urlStr: string, format: string) => {
    try {
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
    if (typeof src !== 'string' || !src) return null;
    if (src.includes('images.unsplash.com')) {
      const avifSrcSet = generateUnsplashSrcSet(src, 'avif');
      const webpSrcSet = generateUnsplashSrcSet(src, 'webp');
      
      return (
        <React.Fragment>
          {avifSrcSet && <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} />}
          {webpSrcSet && <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />}
        </React.Fragment>
      );
    }
    return null;
  }, [src, sizes]);

  const baseSrc = useMemo(() => {
    if (typeof src !== 'string' || !src) return src || "";
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

  const pictureClass = fill 
    ? 'absolute inset-0 w-full h-full' 
    : 'relative w-full h-full block';
    
  if (!src || hasError) {
    return (
      <div className={`${pictureClass} ${className || ''} bg-slate-100 flex items-center justify-center`}>
        <span className="text-slate-300 opacity-50">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        </span>
      </div>
    );
  }

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
        onError={() => { setIsLoaded(true); setHasError(true); }}
        className={`
          w-full h-full 
          ${fill ? `object-${objectFit}` : ''} ${!isLoaded && !priority ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 ease-in-out
        `}
        style={!isLoaded ? { color: 'transparent' } : {}}
        {...props}
      />
    </picture>
  );
}
