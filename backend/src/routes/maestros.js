import { Router } from 'express';
import { db, mockData } from '../db.js';

const router = Router();

// Ruta para obtener todos los maestros
router.get('/', async (req, res) => {
  try {
    if (db) {
      const [rows] = await db.query('SELECT * FROM maestros');
      res.json(rows);
    } else {
      // Usar datos de ejemplo si no hay conexión a la base de datos
      res.json(mockData.maestros);
    }
  } catch (error) {
    console.error('❌ Error al obtener maestros:', error);
    // En caso de error, devolver datos de ejemplo
    res.json(mockData.maestros);
  }
});

export default router;
