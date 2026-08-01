import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import {defineConfig} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'favicon-v2.svg', 'apple-touch-icon.png'],
        manifest: {
          name: 'Glamzo',
          short_name: 'Glamzo',
          description: 'Plataforma & Agendamentos de Beleza Premium',
          theme_color: '#A855F7',
          background_color: '#ffffff',
          display: 'standalone',
          icons: [
            {
              src: '/favicon-v2.svg',
              sizes: '192x192',
              type: 'image/svg+xml'
            },
            {
              src: '/favicon-v2.svg',
              sizes: '512x512',
              type: 'image/svg+xml'
            }
          ]
        },
        devOptions: {
          enabled: true
        }
      }),
      react(), 
      tailwindcss()
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
            'vendor-icons': ['lucide-react'],
            'vendor-motion': ['motion'],
            'vendor-date': ['date-fns', 'date-fns-tz'],
            'vendor-toast': ['react-hot-toast'],
            'vendor-i18n': ['i18next', 'react-i18next'],
            'vendor-stripe': ['@stripe/stripe-js', '@stripe/connect-js', '@stripe/react-connect-js'],
            'vendor-maps': ['@vis.gl/react-google-maps']
          },
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        }
      }
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
