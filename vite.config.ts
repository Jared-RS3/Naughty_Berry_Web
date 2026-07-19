import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true,
    port: 5173,
    // Never silently fall back to 5174/5175/... — the Codespaces forwarded
    // URL is hard-wired to :5173, so a drifting port is what causes the 404.
    // Fail loudly instead so a stale server gets cleaned up rather than hidden.
    strictPort: true,
  },
})
