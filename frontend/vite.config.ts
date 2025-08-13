import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  // Build optimizations for Vercel
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          alerts: ['sweetalert2']
        }
      }
    },
    // Simple minification for compatibility
    minify: 'esbuild',
    target: 'esnext'
  },
  
  // Preview configuration for production testing
  preview: {
    port: 3000,
    host: true
  },
  
  // Development server configuration
  server: {
    port: 3000,
    host: true,
    open: true
  }
})
