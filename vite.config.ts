import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const base = process.env.GITHUB_PAGES === 'true' ? '/garry-micro-dev-utilities/' : '/';

  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.ts',
        includeAssets: ['favicon.svg', 'pwa-192.png', 'pwa-512.png', 'apple-touch-icon.png'],
        manifest: {
          name: 'Garry Micro Dev Utilities',
          short_name: 'Garry',
          description:
            'Local-first browser tools for JSON, APIs, data, planning, and architecture. No server. No login.',
          theme_color: '#0A66C2',
          background_color: '#0f172a',
          display: 'standalone',
          display_override: ['standalone', 'browser'],
          orientation: 'any',
          start_url: base,
          scope: base,
          icons: [
            {
              src: 'pwa-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: 'favicon.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'any',
            },
          ],
        },
        injectManifest: {
          /** Unminified SW avoids terser OOM when the precache list is large */
          minify: false,
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,ico,svg,png,woff2}'],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    optimizeDeps: {
      include: ['@xyflow/react', '@xyflow/system', 'mermaid'],
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      __DEV__: mode !== 'production',
      __LOG_LEVEL__: JSON.stringify(process.env.VITE_LOG_LEVEL || ''),
      'import.meta.env.VITE_BUILD_TARGET': JSON.stringify('web'),
    },
  };
});
