import { Router } from 'express';
import { db, mockData } from '../db.js';

const router = Router();

// GET: todas las clases
router.get('/', async (req, res) => {
  try {
    if (db) {
      const [rows] = await db.query('SELECT * FROM clases');
      res.json(rows);
    } else {
      // Usar datos de ejemplo si no hay conexión a la base de datos
      res.json(mockData.clases);
    }
  } catch (error) {
    console.error('❌ Error al obtener clases:', error);
    // En caso de error, devolver datos de ejemplo
    res.json(mockData.clases);
  }
});

// POST: crear nueva clase
router.post('/', async (req, res) => {
  try {
    const { id_maestro, nombre, grado, materia } = req.body;
    
    if (db) {
      const [result] = await db.query(
        'INSERT INTO clases (id_maestro, nombre, grado, materia) VALUES (?, ?, ?, ?)',
        [id_maestro, nombre, grado, materia]
      );
      res.json({ id: result.insertId, message: 'Clase creada correctamente' });
    } else {
      // Simular creación con datos de ejemplo
      const newId = mockData.clases.length + 1;
      const newClass = { id: newId, id_maestro, nombre, grado, materia };
      mockData.clases.push(newClass);
      res.json({ id: newId, message: 'Clase creada correctamente (modo demo)' });
    }
  } catch (error) {
    console.error('❌ Error al crear clase:', error);
    res.status(500).json({ message: 'Error al crear la clase' });
  }
});

export default router;
