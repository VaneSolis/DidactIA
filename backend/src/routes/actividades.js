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
  const { tema, grado, materia } = req.body;

  try {
    const prompt = `Genera una actividad creativa para la clase de ${materia}, nivel ${grado}, sobre el tema "${tema}". Incluye una descripción corta y una dinámica práctica.`;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/openai-community/gpt2",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 150,
            temperature: 0.7,
          },
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error("Error de Hugging Face:", data.error);
      return res.status(500).json({ error: data.error });
    }

    const textoGenerado = data[0]?.generated_text || "No se pudo generar la actividad";

    res.json({
      tema,
      materia,
      grado,
      actividad_generada: textoGenerado,
    });
  } catch (error) {
    console.error("❌ Error al generar actividad con IA:", error);
    res.status(500).json({ message: "Error al generar la actividad con IA" });
  }
});


export default router;
