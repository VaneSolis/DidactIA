import { useState, useEffect } from 'react'
import api from '../api'

function FormularioClase({ clase, onSave, onCancel }) {
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
      await api.post('/clases', formData)
      onSave?.()
      // Limpiar formulario si no es edición
      if (!clase) {
        setFormData({
          id_maestro: '',
          nombre: '',
          grado: '',
          materia: '',
        })
      }
    } catch (err) {
      console.error('Error al guardar clase:', err)
      setError('Error al guardar la clase')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>{clase ? 'Editar Clase' : 'Nueva Clase'}</h2>
      
      {error && <div style={{ color: 'red' }}>{error}</div>}

      <div>
        <label>
          Maestro:
          <select
            name="id_maestro"
            value={formData.id_maestro}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona un maestro</option>
            {maestros.map((maestro) => (
              <option key={maestro.id} value={maestro.id}>
                {maestro.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <label>
          Nombre:
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </label>
      </div>

      <div>
        <label>
          Grado:
          <input
            type="text"
            name="grado"
            value={formData.grado}
            onChange={handleChange}
            required
          />
        </label>
      </div>

      <div>
        <label>
          Materia:
          <input
            type="text"
            name="materia"
            value={formData.materia}
            onChange={handleChange}
            required
          />
        </label>
      </div>

      <div>
        <button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

export default FormularioClase

