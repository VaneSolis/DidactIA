import { useState } from 'react'
import api from '../api'

function FormularioMaestro({ onSave, onCancel }) {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Primero verificar que el backend esté disponible
      try {
        await api.get('/health')
      } catch (healthError) {
        setError(`⚠️ El backend no está disponible en ${api.defaults.baseURL}

Por favor:
1. Abre una terminal y ejecuta: cd backend && npm run dev
2. Espera a ver: "✅ Servidor backend corriendo en puerto 4000"
3. Luego intenta nuevamente`)
        setLoading(false)
        return
      }

      // Preparar datos para enviar (convertir email vacío a null)
      const dataToSend = {
        nombre: formData.nombre.trim(),
        email: formData.email.trim() || null
      }

      console.log('Enviando datos:', dataToSend)
      console.log('URL completa:', api.defaults.baseURL + '/maestros')
      
      const response = await api.post('/maestros', dataToSend)
      console.log('Respuesta del servidor:', response.data)
      
      setSuccess(true)
      setFormData({
        nombre: '',
        email: '',
      })
      // Esperar un momento antes de cerrar o notificar
      setTimeout(() => {
        onSave?.()
      }, 1000)
    } catch (err) {
      console.error('Error al guardar maestro:', err)
      console.error('Detalles del error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: api.defaults.baseURL + '/maestros'
      })
      
      let errorMessage = 'Error al guardar el maestro'
      
      if (err.response?.status === 404) {
        errorMessage = `❌ Error 404: No se encontró el endpoint.

El backend no está corriendo o la URL es incorrecta.

📋 Pasos a seguir:
1. Abre una NUEVA terminal
2. Ejecuta: cd backend
3. Ejecuta: npm run dev
4. Espera el mensaje: "✅ Servidor backend corriendo en puerto 4000"
5. Vuelve aquí e intenta nuevamente

🔗 URL esperada: ${api.defaults.baseURL}/maestros`
      } else if (err.response?.status === 0 || err.message?.includes('Network')) {
        errorMessage = `❌ Error de conexión: No se pudo conectar al backend.

El servidor backend no está disponible en ${api.defaults.baseURL}

Por favor inicia el backend en una terminal:
cd backend && npm run dev`
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      padding: '20px', 
      borderRadius: '8px',
      marginBottom: '20px',
      backgroundColor: '#f9f9f9'
    }}>
      <h2>Agregar Nuevo Maestro</h2>
      
      {success && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#d4edda', 
          color: '#155724', 
          borderRadius: '5px',
          marginBottom: '15px'
        }}>
          ✅ Maestro creado exitosamente
        </div>
      )}
      
      {error && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          borderRadius: '5px',
          marginBottom: '15px',
          border: '1px solid #f5c6cb',
          whiteSpace: 'pre-line',
          lineHeight: '1.6'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Nombre: *
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Email: <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#666' }}>(opcional)</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Si no se proporciona, se generará automáticamente"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '14px'
            }}
          />
          <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            Si dejas el email vacío, se generará automáticamente basado en el nombre.
          </p>
        </div>

        <div>
          <button 
            type="submit" 
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginRight: '10px'
            }}
          >
            {loading ? 'Guardando...' : 'Guardar Maestro'}
          </button>
          {onCancel && (
            <button 
              type="button" 
              onClick={onCancel}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default FormularioMaestro

