import express from 'express';
import 'dotenv/config';

const router = express.Router();

// Función para generar actividades simples sin IA
function generarActividadesSimples(materia, grado, objetivo) {
  // Generar actividades más detalladas y útiles
  const actividades = [
    {
      titulo: `Actividad 1: Introducción y Fundamentos de ${materia}`,
      descripcion: `Ejercicios básicos de ${materia} diseñados para estudiantes de ${grado} grado. Esta actividad introduce conceptos fundamentales a través de ejemplos prácticos y ejercicios guiados. Objetivo: ${objetivo}. Incluye ejercicios paso a paso para asegurar la comprensión inicial.`,
      nivel: 'bajo',
      tipo: 'introducción'
    },
    {
      titulo: `Actividad 2: Practica y Refuerzo de ${materia}`,
      descripcion: `Ejercicios intermedios de ${materia} que refuerzan los conceptos aprendidos. Diseñados para estudiantes de ${grado} grado, estos ejercicios permiten practicar y consolidar conocimientos. Enfocado en: ${objetivo}. Incluye problemas prácticos y situaciones reales.`,
      nivel: 'medio',
      tipo: 'práctica'
    },
    {
      titulo: `Actividad 3: Evaluación y Aplicación Avanzada de ${materia}`,
      descripcion: `Actividad de evaluación completa para estudiantes de ${grado} grado que demuestra el dominio de ${materia}. Esta actividad incluye problemas más complejos y situaciones que requieren aplicar múltiples conceptos. Objetivo: ${objetivo}. Ideal para evaluar el progreso y preparar para niveles superiores.`,
      nivel: 'alto',
      tipo: 'evaluación'
    }
  ];
  
  return actividades;
}

/**
 * POST /actividades/generar
 * Body esperado: { materia, grado, objetivo }
 */
router.post('/generar', async (req, res) => {
  // Verificar que el body esté presente
  if (!req.body) {
    console.error('req.body es undefined');
    return res.status(400).json({ 
      error: 'Body no recibido. Asegúrate de enviar Content-Type: application/json' 
    });
  }

  const { materia, grado, objetivo } = req.body;

  if (!materia || !grado || !objetivo) {
    return res.status(400).json({ 
      error: 'Faltan campos requeridos (materia, grado, objetivo).',
      recibido: req.body 
    });
  }

  try {
    // 🔑 Clave de Hugging Face (usa variables de entorno)
    const HF_API_KEY = process.env.HF_API_KEY;
    // Permitir desactivar IA con USE_AI=false, o usar automáticamente si hay token
    const USE_AI = process.env.USE_AI !== 'false' && HF_API_KEY;
    
    // Si no hay API key o está deshabilitada, usar generación simple
    if (!USE_AI) {
      console.log('Generando actividades sin IA (modo simple)');
      const actividades = generarActividadesSimples(materia, grado, objetivo);
      return res.json({ actividades, modo: 'simple' });
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

    // 🚀 Llamada a la API de Hugging Face
    // Nota: Muchos modelos requieren que los aceptes primero en huggingface.co
    // Visita: https://huggingface.co/models y busca el modelo para aceptarlo
    // Modelos actualizados con las URLs correctas:
    const modelos = [
      "https://api-inference.huggingface.co/models/distilgpt2",
      "https://api-inference.huggingface.co/models/openai-community/gpt2",
      "https://api-inference.huggingface.co/models/google/flan-t5-base"
    ];
    
    let response;
    let lastError;
    
    // Intentar con cada modelo hasta que uno funcione
    for (const modelUrl of modelos) {
      try {
        response = await fetch(modelUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json"
      },
          body: JSON.stringify({ 
            inputs: prompt,
            parameters: {
              max_length: 500,
              return_full_text: false
            }
          })
        });
        
        // Si la respuesta es exitosa, salir del loop
        if (response.ok) {
          console.log(`✅ Modelo exitoso: ${modelUrl}`);
          break;
        } else {
          const errorText = await response.text();
          console.log(`⚠️ Modelo ${modelUrl} falló: ${response.status} - ${errorText}`);
          lastError = { status: response.status, message: errorText, model: modelUrl };
        }
      } catch (fetchError) {
        console.log(`⚠️ Error al llamar ${modelUrl}:`, fetchError.message);
        lastError = { error: fetchError.message, model: modelUrl };
      }
    }
    
    // Si todos los modelos fallaron, usar generación simple
    if (!response || !response.ok) {
      console.log('❌ Todos los modelos de IA fallaron, usando generación simple');
      const actividades = generarActividadesSimples(materia, grado, objetivo);
      return res.json({ 
        actividades, 
        modo: 'simple',
        nota: 'La IA no está disponible, se generaron actividades básicas',
        error_ia: lastError
      });
    }

    // Parsear la respuesta como JSON
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      const errorText = await response.text();
      console.error('Error parseando JSON de Hugging Face:', errorText);
      return res.status(500).json({ 
        error: 'La respuesta de Hugging Face no es válida JSON',
        respuesta: errorText
      });
    }

    // 💡 Manejar diferentes formatos de respuesta de Hugging Face
    let generatedText = '';
    
    if (Array.isArray(data) && data[0]?.generated_text) {
      // Formato: [{generated_text: "..."}]
      generatedText = data[0].generated_text;
    } else if (data.generated_text) {
      // Formato: {generated_text: "..."}
      generatedText = data.generated_text;
    } else if (Array.isArray(data) && data[0]?.text) {
      // Otro formato posible
      generatedText = data[0].text;
    } else {
      console.error('Respuesta inesperada de Hugging Face:', JSON.stringify(data, null, 2));
      return res.status(500).json({ 
        error: 'No se pudo extraer el texto generado de la respuesta', 
        respuesta: data,
        sugerencia: 'El modelo puede estar cargándose o el formato de respuesta cambió. Intenta nuevamente en unos segundos.'
      });
    }

    // 🧹 Intentar parsear JSON del texto generado
    let actividades;
    try {
      // Buscar JSON en el texto generado
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        actividades = JSON.parse(jsonMatch[0]);
      } else {
        // Si no hay JSON, crear actividades desde el texto
        const lines = generatedText.split('\n').filter(line => line.trim());
        actividades = lines.slice(0, 3).map((line, index) => ({
          titulo: `Actividad ${index + 1}`,
          descripcion: line.trim(),
          nivel: 'medio'
        }));
      }
    } catch (err) {
      // Si falla el parseo, crear actividades simples
      console.log('No se pudo parsear JSON, creando actividades simples');
      actividades = [{
        titulo: "Actividad generada",
        descripcion: generatedText.substring(0, 200),
        nivel: "medio"
      }];
    }

    res.json({ actividades });

  } catch (error) {
    console.error('Error generando actividades:', error);
    res.status(500).json({ error: 'Error interno generando actividades', details: error.message });
  }
});

export default router;
