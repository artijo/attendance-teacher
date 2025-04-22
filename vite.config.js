import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server : {
    port : 5174
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'axios', 'luxon', 'tabletojson', 'xlsx', 'yup', 'zod', '@ag-media/react-pdf-table', '@react-pdf/renderer','zusyand']
          // Add other libraries you want to split into separate chunks here
        },
      },
    },
  },
})
