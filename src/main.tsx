import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import './lib/install'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { InstallPrompt } from './components/InstallPrompt.tsx'

// Nieuwe versie gevonden? Meteen activeren en herladen, zodat niemand op een oude versie blijft hangen.
registerSW({
  immediate: true,
  onRegisteredSW(_url, reg) {
    if (reg) setInterval(() => void reg.update(), 60 * 60 * 1000)
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
      <InstallPrompt />
    </ErrorBoundary>
  </StrictMode>,
)
