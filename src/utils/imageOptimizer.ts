import { useTranslation } from "react-i18next";

/**
 * Highly optimized browser-side Image compression and format conversion utility.
 * Compresses any image (JPG, PNG, GIF, etc.) to modern high-performance WebP format,
 * enforces a maximum dimension constraint of 1600px (preserving aspect ratio),
 * and compresses with an elite target quality of 70%.
 */
export async function optimizeImageBeforeUpload(
  file: File,
  maxDimension: number = 1600,
  quality: number = 0.70
): Promise<{ blob: Blob; mimeType: string; fileName: string }> {
  return new Promise((resolve, reject) => {
    // If the browser doesn't support FileReader or Canvas, fallback to original
    if (!window.FileReader || !window.HTMLCanvasElement) {
      resolve({
        blob: file,
        mimeType: file.type,
        fileName: file.name
      });
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        // Enforce aspect ratio and upper-bound resolution (1600px default)
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            blob: file,
            mimeType: file.type,
            fileName: file.name
          });
          return;
        }

        // Draw image onto canvas
        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Convert specifically to webp with high efficiency lossy compression
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const originalPrefix = file.name.substring(0, file.name.lastIndexOf('.')) || 'image';
              resolve({
                blob,
                mimeType: 'image/webp',
                fileName: `${originalPrefix}-${Date.now()}.webp`
              });
            } else {
              resolve({
                blob: file,
                mimeType: file.type,
                fileName: file.name
              });
            }
          },
          'image/webp',
          quality
        );
      };

      img.onerror = (err) => {
        reject(new Error("Erro a carregar imagem para compressão: " + err));
      };
    };

    reader.onerror = (err) => {
      reject(new Error("Erro a ler ficheiro: " + err));
    };
  });
}
