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

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  if (!OPENAI_API_KEY) {
    return res.status(503).json({
      message: 'La IA no está configurada. Define OPENAI_API_KEY en backend/.env o habilita USE_AI=false.'
    });
  }

  try {
    const prompt = `Genera una única actividad creativa para la materia ${materia}, nivel ${grado}, sobre el tema "${tema}".
Responde exclusivamente en formato JSON con el siguiente esquema:
{
  "titulo": "...",
  "descripcion": "...",
  "dinamica": "...",
  "materiales": ["...", "..."],
  "duracion": "tiempo estimado en minutos"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente educativo que propone actividades prácticas. Entrega siempre JSON válido y sin texto adicional.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    const raw = await response.text();

    if (!response.ok) {
      console.error('Error de OpenAI en /actividades/generar:', raw);
      return res.status(response.status).json({
        message: 'No se pudo generar la actividad con IA',
        detalle: raw
      });
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      console.error('Formato inválido desde OpenAI:', raw);
      return res.status(500).json({ message: 'Respuesta inválida de la IA' });
    }

    const content = data?.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return res.status(500).json({ message: 'La IA no devolvió contenido válido' });
    }

    let actividadGenerada;
    try {
      actividadGenerada = JSON.parse(content);
    } catch (err) {
      console.warn('No se pudo parsear JSON, devolviendo texto plano');
      actividadGenerada = {
        titulo: 'Actividad sugerida',
        descripcion: content,
        dinamica: content,
        materiales: [],
        duracion: '40 minutos'
      };
    }

    res.json({
      tema,
      materia,
      grado,
      actividad_generada: actividadGenerada
    });
  } catch (error) {
    console.error("❌ Error al generar actividad con IA:", error);
    res.status(500).json({ message: "Error al generar la actividad con IA" });
  }
});


export default router;
