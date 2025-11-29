import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Asegurar que el DOM esté completamente listo antes de montar React
function initApp() {
  const rootElement = document.getElementById('root')
  
  if (!rootElement) {
    console.error('❌ Error: No se encontró el elemento #root en el DOM')
    return
  }

  try {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  } catch (error) {
    console.error('❌ Error al montar la aplicación React:', error)
  }
}

// Esperar a que el DOM esté completamente listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp)
} else {
  // Si el DOM ya está listo, ejecutar inmediatamente
  initApp()
}
