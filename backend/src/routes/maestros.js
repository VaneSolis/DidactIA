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
      console.log('📋 Usando datos de ejemplo para maestros');
      res.json(mockData.maestros);
    }
  } catch (error) {
    console.error('❌ Error al obtener maestros:', error);
    // En caso de error, devolver datos de ejemplo
    console.log('📋 Usando datos de ejemplo por error');
    res.json(mockData.maestros);
  }
});

export default router;
