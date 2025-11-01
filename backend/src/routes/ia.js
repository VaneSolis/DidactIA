import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();
const router = express.Router();

/**
 * POST /actividades/generar
 * Body esperado: { materia, grado, objetivo }
 */
router.post('/generar', async (req, res) => {
  const { materia, grado, objetivo } = req.body;

  if (!materia || !grado || !objetivo) {
    return res.status(400).json({ error: 'Faltan campos requeridos (materia, grado, objetivo).' });
  }

  try {
    // 🔑 Clave de Hugging Face (usa variables de entorno)
    const HF_API_KEY = process.env.HF_API_KEY;
    if (!HF_API_KEY) {
      return res.status(500).json({ error: 'No hay clave de Hugging Face configurada en .env' });
    }

    // 🧠 Prompt: texto que se enviará al modelo de IA
    const prompt = `
Eres un asistente educativo. Genera 3 actividades breves para estudiantes de ${grado} grado 
en la materia de ${materia}. 
Cada actividad debe tener:
- un título
- una descripción
- un nivel de dificultad (bajo, medio o alto)
El objetivo educativo es: "${objetivo}".
Responde en formato JSON como una lista llamada "actividades".
`;

    // 🚀 Llamada a la API de Hugging Face (modelo de texto)
    const response = await fetch("https://api-inference.huggingface.co/models/google/gemma-2b-it", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt })
    });

    const data = await response.json();

    // 💡 Manejar errores de Hugging Face
    if (!Array.isArray(data) || !data[0]?.generated_text) {
      console.error('Respuesta inesperada:', data);
      return res.status(500).json({ error: 'No se pudo generar el texto con Hugging Face', data });
    }

    // 🧹 Intentar parsear JSON si el modelo lo devuelve en texto
    let generated;
    try {
      generated = JSON.parse(data[0].generated_text.match(/\[.*\]/s)?.[0] || '[]');
    } catch (err) {
      generated = [{ titulo: "Actividad generada", descripcion: data[0].generated_text }];
    }

    res.json({ actividades: generated });

  } catch (error) {
    console.error('Error generando actividades:', error);
    res.status(500).json({ error: 'Error interno generando actividades', details: error.message });
  }
});

export default router;
