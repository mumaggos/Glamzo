import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'vite-plugin-async-css-and-inline',
        enforce: 'post' as const,
        transformIndexHtml(html, ctx) {
          if (!ctx || !ctx.bundle) return html;
          
          let newHtml = html;
          let cssContent = '';
          
          // Localizar o ficheiro CSS gerado no bundle de produção
          for (const [fileName, asset] of Object.entries(ctx.bundle)) {
            if (fileName.endsWith('.css') && 'source' in asset) {
              cssContent += asset.source;
            }
          }
          
          if (cssContent) {
            // Injetar o CSS crítico diretamente na head
            const styleTag = `\n    <style id="critical-css">\n${cssContent}\n    </style>`;
            newHtml = newHtml.replace('</head>', `${styleTag}\n</head>`);
          }
          
          // Tornar o carregamento do ficheiro de estilos CSS assíncrono (não bloqueante)
          newHtml = newHtml.replace(
            /<link\s+rel="stylesheet"\s+href="([^"]+\.css)"\s*\/?>/gi,
            '<link rel="preload" href="$1" as="style" />\n    <link rel="stylesheet" href="$1" media="print" onload="this.media=\'all\'" />'
          );
          
          return newHtml;
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    define: {
      'process.env.GOOGLE_MAPS_PLATFORM_KEY': JSON.stringify(process.env.GOOGLE_MAPS_PLATFORM_KEY || '')
    },
    build: {
      minify: true,
      cssMinify: true,
      sourcemap: false,
      chunkSizeWarningLimit: 800,
      reportCompressedSize: false,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-core': ['react', 'react-dom', 'react-router-dom'],
            'vendor-supabase': ['@supabase/supabase-js'],
            'vendor-charts': ['recharts'],
          },
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        }
      }
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
