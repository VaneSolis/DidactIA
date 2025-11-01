import { useState, useEffect } from 'react'
import api from '../api'

function FormularioClase({ clase, onSave, onCancel, refreshTrigger }) {
  const [formData, setFormData] = useState({
    id_maestro: '',
    nombre: '',
    grado: '',
    materia: '',
  })
  const [maestros, setMaestros] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    cargarMaestros()
  }, [refreshTrigger])

  useEffect(() => {
    if (clase) {
      setFormData({
        id_maestro: clase.id_maestro || '',
        nombre: clase.nombre || '',
        grado: clase.grado || '',
        materia: clase.materia || '',
      })
    }
  }, [clase])

  const cargarMaestros = async () => {
    try {
      const response = await api.get('/maestros')
      setMaestros(response.data)
    } catch (err) {
      console.error('Error al cargar maestros:', err)
    }
  }

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

    try {
      // Convertir id_maestro a número si es necesario
      const dataToSend = {
        ...formData,
        id_maestro: parseInt(formData.id_maestro)
      }
      
      const response = await api.post('/clases', dataToSend)
      console.log('Clase guardada:', response.data)
      
      // Limpiar formulario si no es edición
      if (!clase) {
        setFormData({
          id_maestro: '',
          nombre: '',
          grado: '',
          materia: '',
        })
      }
      
      // Llamar callback después de limpiar
      onSave?.()
    } catch (err) {
      console.error('Error al guardar clase:', err)
      const errorMessage = err.response?.data?.message || 'Error al guardar la clase'
      setError(errorMessage)
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      padding: '20px', 
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <form onSubmit={handleSubmit}>
        <h2>{clase ? 'Editar Clase' : 'Nueva Clase'}</h2>
        
        {error && (
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#f8d7da', 
            color: '#721c24', 
            borderRadius: '5px',
            marginBottom: '15px'
          }}>
            ❌ {error}
          </div>
        )}

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Maestro: *
          </label>
          <select
            name="id_maestro"
            value={formData.id_maestro}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '14px'
            }}
          >
            <option value="">Selecciona un maestro</option>
            {maestros.length === 0 ? (
              <option disabled>No hay maestros disponibles. Agrega uno primero.</option>
            ) : (
              maestros.map((maestro) => (
                <option key={maestro.id} value={maestro.id}>
                  {maestro.nombre} {maestro.email ? `(${maestro.email})` : ''}
                </option>
              ))
            )}
          </select>
          {maestros.length === 0 && (
            <p style={{ fontSize: '12px', color: '#856404', marginTop: '5px' }}>
              💡 No hay maestros. Haz clic en "Agregar Maestro" para crear uno.
            </p>
          )}
        </div>

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
            Grado: *
          </label>
          <input
            type="text"
            name="grado"
            value={formData.grado}
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
            Materia: *
          </label>
          <input
            type="text"
            name="materia"
            value={formData.materia}
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

        <div>
          <button 
            type="submit" 
            disabled={loading || maestros.length === 0}
            style={{
              padding: '10px 20px',
              backgroundColor: loading || maestros.length === 0 ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading || maestros.length === 0 ? 'not-allowed' : 'pointer',
              marginRight: '10px',
              fontSize: '16px'
            }}
          >
            {loading ? 'Guardando...' : 'Guardar Clase'}
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
                cursor: 'pointer',
                fontSize: '16px'
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

export default FormularioClase

