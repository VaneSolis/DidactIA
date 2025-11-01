import { useState, useEffect } from 'react'
import api from '../api'

function ListaClases({ onSelectClase, refreshTrigger }) {
  const [clases, setClases] = useState([])
  const [clasesFiltradas, setClasesFiltradas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtroMateria, setFiltroMateria] = useState('')

  useEffect(() => {
    cargarClases()
  }, [refreshTrigger])

  useEffect(() => {
    aplicarFiltro()
  }, [filtroMateria, clases])

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

  const aplicarFiltro = () => {
    if (!filtroMateria) {
      setClasesFiltradas(clases)
    } else {
      const filtradas = clases.filter(clase =>
        clase.materia.toLowerCase().includes(filtroMateria.toLowerCase())
      )
      setClasesFiltradas(filtradas)
    }
  }

  // Obtener materias únicas para el selector
  const materiasUnicas = [...new Set(clases.map(clase => clase.materia).filter(Boolean))]

  if (loading) {
    return <div>Cargando clases...</div>
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>
  }

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <h2>Lista de Clases ({clasesFiltradas.length})</h2>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ fontWeight: 'bold' }}>
            Filtrar por materia:
          </label>
          <select
            value={filtroMateria}
            onChange={(e) => setFiltroMateria(e.target.value)}
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '14px'
            }}
          >
            <option value="">Todas las materias</option>
            {materiasUnicas.map((materia) => (
              <option key={materia} value={materia}>
                {materia}
              </option>
            ))}
          </select>
          {filtroMateria && (
            <button
              onClick={() => setFiltroMateria('')}
              style={{
                padding: '8px 15px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Limpiar filtro
            </button>
          )}
        </div>
      </div>

      {clases.length === 0 ? (
        <p>No hay clases disponibles</p>
      ) : clasesFiltradas.length === 0 ? (
        <p>No hay clases que coincidan con el filtro "{filtroMateria}"</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '15px'
        }}>
          {clasesFiltradas.map((clase) => (
            <div
              key={clase.id}
              onClick={() => onSelectClase(clase)}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '15px',
                cursor: 'pointer',
                backgroundColor: '#fff',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{clase.nombre}</h3>
              <p style={{ margin: '5px 0', color: '#666' }}>
                <strong>Grado:</strong> {clase.grado}
              </p>
              <p style={{ margin: '5px 0', color: '#666' }}>
                <strong>Materia:</strong> {clase.materia}
              </p>
              <p style={{ margin: '5px 0', color: '#999', fontSize: '12px' }}>
                ID: {clase.id}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ListaClases

