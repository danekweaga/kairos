import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { AuthProvider } from '@/context/AuthContext'
import './index.css'
import App from './App.tsx'

// #region agent log
if (typeof window !== "undefined") {
  fetch("http://127.0.0.1:7813/ingest/5b4830d4-73b3-470d-a8be-4731797e0582", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "f0655d" },
    body: JSON.stringify({
      sessionId: "f0655d",
      runId: "reset-repro",
      hypothesisId: "H2",
      location: "main.tsx:init",
      message: "app_startup",
      data: {},
      timestamp: Date.now(),
    }),
  }).catch(() => {})
}
// #endregion

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
