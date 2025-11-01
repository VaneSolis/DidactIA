import { useState, useEffect } from 'react'
import api from '../api'

function ListaClases({ onSelectClase }) {
  const [clases, setClases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    cargarClases()
  }, [])

  const cargarClases = async () => {
    try {
      setLoading(true)
      const response = await api.get('/clases')
      setClases(response.data)
      setError(null)
    } catch (err) {
      console.error('Error al cargar clases:', err)
      setError('Error al cargar las clases')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Cargando clases...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div>
      <h2>Lista de Clases</h2>
      {clases.length === 0 ? (
        <p>No hay clases disponibles</p>
      ) : (
        <ul>
          {clases.map((clase) => (
            <li key={clase.id}>
              <button onClick={() => onSelectClase(clase)}>
                {clase.nombre} - {clase.grado} - {clase.materia}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ListaClases

