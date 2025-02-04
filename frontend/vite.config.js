import { defineConfig } from 'vite';
import path from "path";
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          pdf: ['pdfjs-dist'],
          tensorflow: ['@tensorflow/tfjs', '@tensorflow-models/universal-sentence-encoder'],
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true
      }
    }
  },
  optimizeDeps: {
    include: ['@tensorflow/tfjs', '@tensorflow-models/universal-sentence-encoder'],
    exclude: ['pdfjs-dist']
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, "./src"),
    },
  },
  server: {
    https: false,
    host: true
  },
  preview: {
    https: false,
    host: true,
    port: 80,
    strictPort: true,
    cors: true
  }
});