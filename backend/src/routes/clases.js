import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// GET: todas las clases
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM clases');
    res.json(rows);
  } catch (error) {
    console.error('❌ Error al obtener clases:', error);
    res.status(500).json({ message: 'Error al obtener las clases' });
  }
});

// POST: crear nueva clase
router.post('/', async (req, res) => {
  try {
    const { id_maestro, nombre, grado, materia } = req.body;
    const [result] = await db.query(
      'INSERT INTO clases (id_maestro, nombre, grado, materia) VALUES (?, ?, ?, ?)',
      [id_maestro, nombre, grado, materia]
    );
    res.json({ id: result.insertId, message: 'Clase creada correctamente' });
  } catch (error) {
    console.error('❌ Error al crear clase:', error);
    res.status(500).json({ message: 'Error al crear la clase' });
  }
});

export default router;
