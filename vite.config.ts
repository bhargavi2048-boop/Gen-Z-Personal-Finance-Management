import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('d3') || id.includes('victory-vendor')) {
              return 'vendor-d3';
            }
            if (id.includes('recharts')) {
              return 'vendor-recharts';
            }
            if (id.includes('canvas-confetti')) {
              return 'vendor-confetti';
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
});
