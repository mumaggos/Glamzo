const fs = require('fs');
let code = fs.readFileSync('src/components/Image.tsx', 'utf8');

const supabaseFunc = `
  const generateSupabaseSrcSet = (src: string, format: 'avif' | 'webp') => {
    try {
      if (!src.includes('/storage/v1/object/public/')) return '';
      const baseUrl = src.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
      return WIDTHS.map(w => {
        return \`\${baseUrl}?width=\${w}&format=\${format}&quality=\${format === 'avif' ? 50 : 70} \${w}w\`;
      }).join(', ');
    } catch (e) { return ''; }
  };
`;

code = code.replace(
  "const generateUnsplashSrcSet",
  supabaseFunc + "\n  const generateUnsplashSrcSet"
);

code = code.replace(
  `}
    return null;
  }, [src, sizes]);`,
  `} else if (src.includes('.supabase.co/storage/v1/object/public/')) {
      const avifSrcSet = generateSupabaseSrcSet(src, 'avif');
      const webpSrcSet = generateSupabaseSrcSet(src, 'webp');
      
      return (
        <React.Fragment>
          {avifSrcSet && <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} />}
          {webpSrcSet && <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />}
        </React.Fragment>
      );
    }
    return null;
  }, [src, sizes]);`
);

code = code.replace(
  `}
    return src;
  }, [src]);`,
  `} else if (src.includes('.supabase.co/storage/v1/object/public/')) {
      try {
         return src.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/') + '?width=800&format=webp&quality=70';
      } catch (e) { return src; }
    }
    return src;
  }, [src]);`
);

fs.writeFileSync('src/components/Image.tsx', code);
