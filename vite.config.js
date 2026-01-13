import { defineConfig } from 'vite';

export default defineConfig({
  // Configuración simple para Vanilla JS + p5.js
  build: {
    outDir: 'dist',       // Donde se guardará la web final
    emptyOutDir: true,    // Limpiar la carpeta antes de construir
  },
  server: {
    port: 3000            // Puerto para desarrollo local
  }
});
