import { useState, useEffect } from 'react'
import ListaClases from '../components/ListaClases'
import FormularioClase from '../components/FormularioClase'
import FormularioMaestro from '../components/FormularioMaestro'
import DetalleClase from '../components/DetalleClase'
import api from '../api'

function Home() {
  const [selectedClase, setSelectedClase] = useState(null)
  const [showFormClase, setShowFormClase] = useState(false)
  const [showFormMaestro, setShowFormMaestro] = useState(false)
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
    setShowFormClase(false)
  }

  const handleNuevaClase = () => {
    setSelectedClase(null)
    setClaseToEdit(null)
    setShowFormClase(true)
    setShowFormMaestro(false)
  }

  const handleNuevoMaestro = () => {
    setShowFormMaestro(true)
    setShowFormClase(false)
    setSelectedClase(null)
  }

  const handleSaveClaseSuccess = () => {
    setShowFormClase(false)
    setClaseToEdit(null)
    // Forzar actualización de la lista incrementando la key
    setRefreshKey((prev) => prev + 1)
  }

  const handleSaveMaestroSuccess = () => {
    setShowFormMaestro(false)
    // Forzar actualización para que el formulario de clase pueda cargar los nuevos maestros
    setRefreshKey((prev) => prev + 1)
  }

  const handleCloseDetail = () => {
    setSelectedClase(null)
  }

  const handleVerClases = () => {
    setSelectedClase(null)
    setShowFormClase(false)
    setShowFormMaestro(false)
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px', color: '#333' }}>DidactIA - Gestión de Clases</h1>
      
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
      
      {/* Botones de acción */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={handleVerClases}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          📋 Ver Clases
        </button>
        <button 
          onClick={handleNuevaClase}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          ➕ Nueva Clase
        </button>
        <button 
          onClick={handleNuevoMaestro}
          style={{
            padding: '10px 20px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          👤 Agregar Maestro
        </button>
      </div>

      {/* Formulario de Maestro */}
      {showFormMaestro && (
        <div style={{ marginBottom: '30px' }}>
          <FormularioMaestro
            onSave={handleSaveMaestroSuccess}
            onCancel={() => setShowFormMaestro(false)}
          />
        </div>
      )}

      {/* Formulario de Clase */}
      {showFormClase && (
        <div style={{ marginBottom: '30px' }}>
          <FormularioClase
            clase={claseToEdit}
            onSave={handleSaveClaseSuccess}
            onCancel={() => setShowFormClase(false)}
            refreshTrigger={refreshKey}
          />
        </div>
      )}

      {/* Detalle de Clase */}
      {selectedClase && !showFormClase && (
        <div style={{ 
          marginBottom: '30px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '20px',
          backgroundColor: '#f9f9f9'
        }}>
          <DetalleClase clase={selectedClase} onClose={handleCloseDetail} />
        </div>
      )}

      {/* Lista de Clases - Siempre visible */}
      <div style={{ marginTop: '30px' }}>
        <ListaClases 
          key={refreshKey} 
          onSelectClase={handleSelectClase}
          refreshTrigger={refreshKey}
        />
      </div>
    </div>
  )
}

export default Home

