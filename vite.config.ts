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
    // `npm run dev` runs Vite directly on :5173, which is what the Codespaces
    // forwarded URL is hard-wired to. `npm run dev:netlify` instead puts
    // `netlify dev`'s own proxy on :5173 (see [dev] in netlify.toml) so that
    // API routes work too, and pushes this Vite server to :5174 behind it via
    // a `--port` flag on the command line, which overrides this default.
    port: 5173,
    // Never silently fall back to 5174/5175/... when the intended port is
    // taken — a drifting port is what causes the 404. Fail loudly instead so
    // a stale server gets cleaned up rather than hidden.
    strictPort: true,
  },
})
