import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'copy-extension-manifest-and-icon',
      closeBundle() {
        const outDir = path.resolve(__dirname, 'dist-extension');
        fs.mkdirSync(outDir, { recursive: true });
        fs.copyFileSync(
          path.resolve(__dirname, 'extension/manifest.json'),
          path.join(outDir, 'manifest.json')
        );
        const iconSrc = path.resolve(__dirname, 'public/favicon.svg');
        if (fs.existsSync(iconSrc)) {
          fs.copyFileSync(iconSrc, path.join(outDir, 'favicon.svg'));
        }
      },
    },
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
    'import.meta.env.VITE_BUILD_TARGET': JSON.stringify('extension'),
  },
  build: {
    outDir: 'dist-extension',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        full: path.resolve(__dirname, 'full.html'),
      },
    },
  },
}));
