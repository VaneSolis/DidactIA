import { useState } from 'react'
import api from '../api'

const modalidades = [
  { value: 'individual', label: 'Individual' },
  { value: 'grupal', label: 'Grupal' }
]

const tiposActividad = [
  { value: 'inicio', label: 'Inicio' },
  { value: 'desarrollo', label: 'Desarrollo' },
  { value: 'cierre', label: 'Cierre' }
]

const niveles = [
  { value: 'preescolar', label: 'Preescolar' },
  { value: 'primaria', label: 'Primaria' },
  { value: 'secundaria', label: 'Secundaria' },
  { value: 'preparatoria', label: 'Preparatoria' },
  { value: 'universidad', label: 'Universidad' }
]

const estilosContenedor = {
  border: '1px solid #dee2e6',
  borderRadius: '8px',
  padding: '20px',
  backgroundColor: '#ffffff',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  marginBottom: '30px'
}

function GeneradorActividadesIA() {
  const [formData, setFormData] = useState({
    materia: '',
    tema: '',
    modalidad: 'individual',
    duracion: 45,
    tipo: 'inicio',
    nivel: 'primaria'
  })

  const [resultado, setResultado] = useState(null)
  const [modoGeneracion, setModoGeneracion] = useState(null)
  const [nota, setNota] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'duracion' ? Number(value) : value
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!formData.materia.trim() || !formData.tema.trim()) {
      setError('Por favor ingresa la materia y el tema antes de generar las actividades.')
      return
    }

    setCargando(true)
    setError(null)
    setResultado(null)
    setNota(null)
    setModoGeneracion(null)

    try {
      const response = await api.post('/actividades/generar', {
        materia: formData.materia.trim(),
        tema: formData.tema.trim(),
        modalidad: formData.modalidad,
        duracion: Number(formData.duracion) || formData.duracion,
        tipo: formData.tipo,
        nivel: formData.nivel
      })

      setResultado(response.data.actividades || [])
      setModoGeneracion(response.data.modo || 'ia')
      setNota(response.data.nota || null)
    } catch (err) {
      console.error('Error al generar actividades con IA:', err)
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'No se pudieron generar las actividades. Intenta de nuevo más tarde.'
      )
    } finally {
      setCargando(false)
    }
  }

  const handleLimpiar = () => {
    setFormData({
      materia: '',
      tema: '',
      modalidad: 'individual',
      duracion: 45,
      tipo: 'inicio',
      nivel: 'primaria'
    })
    setResultado(null)
    setModoGeneracion(null)
    setNota(null)
    setError(null)
  }

  return (
    <div style={estilosContenedor}>
      <h2 style={{ marginBottom: '20px', color: '#343a40' }}>Generador de Actividades con IA</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="materia" style={{ fontWeight: 'bold', marginBottom: '6px' }}>
            Materia
          </label>
          <input
            id="materia"
            name="materia"
            type="text"
            placeholder="Ej. Matemáticas, Historia del Arte..."
            value={formData.materia}
            onChange={handleChange}
            style={{
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ced4da'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="tema" style={{ fontWeight: 'bold', marginBottom: '6px' }}>
            Tema
          </label>
          <input
            id="tema"
            name="tema"
            type="text"
            placeholder="Ej. Fracciones, Revolución Industrial..."
            value={formData.tema}
            onChange={handleChange}
            style={{
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ced4da'
            }}
          />
        </div>

        <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="modalidad" style={{ fontWeight: 'bold', marginBottom: '6px' }}>
              Modalidad
            </label>
            <select
              id="modalidad"
              name="modalidad"
              value={formData.modalidad}
              onChange={handleChange}
              style={{
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ced4da'
              }}
            >
              {modalidades.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="duracion" style={{ fontWeight: 'bold', marginBottom: '6px' }}>
              Duración (minutos)
            </label>
            <input
              id="duracion"
              name="duracion"
              type="number"
              min="5"
              step="5"
              value={formData.duracion}
              onChange={handleChange}
              style={{
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ced4da'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="tipo" style={{ fontWeight: 'bold', marginBottom: '6px' }}>
              Tipo de actividad
            </label>
            <select
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              style={{
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ced4da'
              }}
            >
              {tiposActividad.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="nivel" style={{ fontWeight: 'bold', marginBottom: '6px' }}>
              Nivel educativo
            </label>
            <select
              id="nivel"
              name="nivel"
              value={formData.nivel}
              onChange={handleChange}
              style={{
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ced4da'
              }}
            >
              {niveles.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: '#f8d7da',
              color: '#721c24',
              borderRadius: '6px',
              padding: '10px 12px'
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="submit"
            disabled={cargando}
            style={{
              padding: '12px 24px',
              backgroundColor: '#6f42c1',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              opacity: cargando ? 0.7 : 1
            }}
          >
            {cargando ? 'Generando...' : '✨ Generar actividades con IA'}
          </button>
          <button
            type="button"
            onClick={handleLimpiar}
            style={{
              padding: '12px 24px',
              backgroundColor: '#f1f3f5',
              color: '#343a40',
              border: '1px solid #ced4da',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Limpiar
          </button>
        </div>
      </form>

      {modoGeneracion && (
        <div style={{ marginTop: '24px', padding: '12px 16px', borderRadius: '6px', backgroundColor: '#e9ecef' }}>
          <strong>Modo utilizado:</strong>{' '}
          {modoGeneracion === 'simple' ? 'Generación simple (sin IA)' : 'Generación con IA'}
          {nota && (
            <div style={{ marginTop: '8px', color: '#495057' }}>
              {nota}
            </div>
          )}
        </div>
      )}

      {resultado && resultado.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ marginBottom: '16px', color: '#343a40' }}>Actividades sugeridas</h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            {resultado.map((actividad, index) => (
              <div
                key={`${actividad.titulo || 'actividad'}-${index}`}
                style={{
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  padding: '16px',
                  backgroundColor: '#f8f9fa'
                }}
              >
                <h4 style={{ margin: '0 0 10px 0', color: '#212529' }}>
                  {actividad.titulo || `Actividad ${index + 1}`}
                </h4>
                {actividad.nivel && (
                  <p style={{ margin: '0 0 6px 0', color: '#495057', fontStyle: 'italic' }}>
                    Nivel sugerido: {actividad.nivel}
                  </p>
                )}
                <p style={{ margin: 0, color: '#343a40', whiteSpace: 'pre-line' }}>
                  {actividad.descripcion || actividad.dinamica || 'Sin descripción disponible.'}
                </p>
                {actividad.duracion && (
                  <p style={{ marginTop: '8px', color: '#495057' }}>
                    Duración aproximada: {actividad.duracion}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default GeneradorActividadesIA


