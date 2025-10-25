import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// GET: todas las actividades
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM actividades');
    res.json(rows);
  } catch (error) {
    console.error('❌ Error al obtener actividades:', error);
    res.status(500).json({ message: 'Error al obtener las actividades' });
  }
});

// POST: crear nueva actividad
router.post('/', async (req, res) => {
  try {
    const { id_clase, titulo, descripcion, fecha } = req.body;
    const [result] = await db.query(
      'INSERT INTO actividades (id_clase, titulo, descripcion, fecha) VALUES (?, ?, ?, ?)',
      [id_clase, titulo, descripcion, fecha]
    );
    res.json({ id: result.insertId, message: 'Actividad creada correctamente' });
  } catch (error) {
    console.error('❌ Error al crear actividad:', error);
    res.status(500).json({ message: 'Error al crear la actividad' });
  }
});

export default router;
