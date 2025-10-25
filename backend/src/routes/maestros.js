import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// Ruta para obtener todos los maestros
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM maestros');
    res.json(rows);
  } catch (error) {
    console.error('❌ Error al obtener maestros:', error);
    res.status(500).json({ message: 'Error al obtener los maestros' });
  }
});

export default router;
