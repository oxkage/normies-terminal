import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/normie': {
        target: 'https://api.normies.art',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/normie/, '/normie')
      }
    }
  }
})
