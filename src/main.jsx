import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

function blockZoom(event) {
  event.preventDefault()
}

document.addEventListener('gesturestart', blockZoom, { passive: false })
document.addEventListener('gesturechange', blockZoom, { passive: false })
document.addEventListener('gestureend', blockZoom, { passive: false })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
