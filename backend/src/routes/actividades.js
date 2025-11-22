import { Router } from 'express';
import { db, mockData } from '../db.js';
import fetch from "node-fetch";

const router = Router();

// GET: todas las actividades
router.get('/', async (req, res) => {
  try {
    if (db) {
      const [rows] = await db.query('SELECT * FROM actividades');
      res.json(rows);
    } else {
      // Usar datos de ejemplo si no hay conexión a la base de datos
      res.json(mockData.actividades);
    }
  } catch (error) {
    console.error('❌ Error al obtener actividades:', error);
    // En caso de error, devolver datos de ejemplo
    res.json(mockData.actividades);
  }
});

// POST: crear nueva actividad
router.post('/', async (req, res) => {
  try {
    const { id_clase, titulo, descripcion, fecha } = req.body;
    
    if (db) {
      const [result] = await db.query(
        'INSERT INTO actividades (id_clase, titulo, descripcion, fecha) VALUES (?, ?, ?, ?)',
        [id_clase, titulo, descripcion, fecha]
      );
      res.json({ id: result.insertId, message: 'Actividad creada correctamente' });
    } else {
      // Simular creación con datos de ejemplo
      const newId = mockData.actividades.length + 1;
      const newActivity = { id: newId, id_clase, titulo, descripcion, fecha };
      mockData.actividades.push(newActivity);
      res.json({ id: newId, message: 'Actividad creada correctamente (modo demo)' });
    }
  } catch (error) {
    console.error('❌ Error al crear actividad:', error);
    res.status(500).json({ message: 'Error al crear la actividad' });
  }
});


// POST: generar actividad con IA
router.post('/generar', async (req, res) => {
  const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

  const response = await fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body)
  });

  const data = await response.json();
  return res.json(data);
});




export default router;
