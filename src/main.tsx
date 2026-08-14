import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initAnalytics } from './lib/analytics.ts'

// Applies whatever the visitor decided on a previous visit, and nothing more.
// With no stored consent this loads no script and sets no cookie — it only
// starts listening for a decision. See src/lib/analytics.ts.
initAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
