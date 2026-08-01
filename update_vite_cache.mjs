import fs from 'fs';
let code = fs.readFileSync('vite.config.ts', 'utf8');

const pwaRegex = /VitePWA\(\{[\s\S]*?\}\),/;
const replacement = `VitePWA({
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
        workbox: {
          navigateFallbackDenylist: [/^\\/api/],
          runtimeCaching: [
            {
              urlPattern: /^https:\\/\\/.*\\.google\\.com\\/.*/i,
              handler: 'NetworkOnly',
            },
            {
              urlPattern: /^https:\\/\\/.*\\.googleapis\\.com\\/.*/i,
              handler: 'NetworkOnly',
            },
            {
              urlPattern: /^https:\\/\\/.*\\.gstatic\\.com\\/.*/i,
              handler: 'NetworkOnly',
            }
          ]
        },
        devOptions: {
          enabled: true
        }
      }),`;

code = code.replace(pwaRegex, replacement);
fs.writeFileSync('vite.config.ts', code);
