import { useState, useEffect } from 'react'
import ListaClases from '../components/ListaClases'
import FormularioClase from '../components/FormularioClase'
import DetalleClase from '../components/DetalleClase'
import api from '../api'

function Home() {
  const [selectedClase, setSelectedClase] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [claseToEdit, setClaseToEdit] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [backendStatus, setBackendStatus] = useState('checking')

  // Verificar conexión con el backend al cargar
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await api.get('/health')
        if (response.data.status === 'OK') {
          setBackendStatus('connected')
        } else {
          setBackendStatus('error')
        }
      } catch (error) {
        console.error('Error conectando al backend:', error)
        setBackendStatus('error')
      }
    }
    checkBackend()
  }, [])

  const handleSelectClase = (clase) => {
    setSelectedClase(clase)
    setShowForm(false)
  }

  const handleNuevaClase = () => {
    setSelectedClase(null)
    setClaseToEdit(null)
    setShowForm(true)
  }

  const handleSaveSuccess = () => {
    setShowForm(false)
    setClaseToEdit(null)
    // Forzar actualización de la lista incrementando la key
    setRefreshKey((prev) => prev + 1)
  }

  const handleCloseDetail = () => {
    setSelectedClase(null)
  }

  return (
    <div>
      <h1>DidactIA - Gestión de Clases</h1>
      
      {/* Indicador de estado del backend */}
      <div style={{ 
        padding: '10px', 
        marginBottom: '20px',
        borderRadius: '5px',
        backgroundColor: backendStatus === 'connected' ? '#d4edda' : backendStatus === 'error' ? '#f8d7da' : '#fff3cd',
        color: backendStatus === 'connected' ? '#155724' : backendStatus === 'error' ? '#721c24' : '#856404'
      }}>
        {backendStatus === 'checking' && '🔄 Verificando conexión con el backend...'}
        {backendStatus === 'connected' && '✅ Backend conectado correctamente'}
        {backendStatus === 'error' && '❌ Error: No se pudo conectar al backend. Asegúrate de que esté corriendo en ' + import.meta.env.VITE_API_URL}
      </div>
      
      <div>
        <button onClick={handleNuevaClase}>Nueva Clase</button>
      </div>

      {showForm && (
        <div>
          <FormularioClase
            clase={claseToEdit}
            onSave={handleSaveSuccess}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {selectedClase && !showForm && (
        <div>
          <DetalleClase clase={selectedClase} onClose={handleCloseDetail} />
        </div>
      )}

      {!showForm && !selectedClase && (
        <div>
          <ListaClases key={refreshKey} onSelectClase={handleSelectClase} />
        </div>
      )}
    </div>
  )
}

export default Home

