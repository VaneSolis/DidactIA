function DetalleClase({ clase, onClose }) {
  if (!clase) {
    return null
  }

  return (
    <div>
      <h2>Detalle de la Clase</h2>
      <div>
        <h3>{clase.nombre}</h3>
        <p><strong>Grado:</strong> {clase.grado}</p>
        <p><strong>Materia:</strong> {clase.materia}</p>
        <p><strong>ID Maestro:</strong> {clase.id_maestro}</p>
        <p><strong>ID:</strong> {clase.id}</p>
      </div>
      {onClose && (
        <button onClick={onClose}>Cerrar</button>
      )}
    </div>
  )
}

export default DetalleClase

