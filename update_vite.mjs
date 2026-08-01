import fs from 'fs';
let code = fs.readFileSync('vite.config.ts', 'utf8');

if (!code.includes('VitePWA')) {
    code = code.replace(
        "import {defineConfig} from 'vite';",
        "import {defineConfig} from 'vite';\nimport { VitePWA } from 'vite-plugin-pwa';"
    );
    
    code = code.replace(
        "plugins: [",
        `plugins: [
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
      }),`
    );
    fs.writeFileSync('vite.config.ts', code);
}
