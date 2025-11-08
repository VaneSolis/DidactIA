import express from 'express';
import 'dotenv/config';

const router = express.Router();

// Función para generar actividades simples sin IA
function generarActividadesSimples({ materia, grado, objetivo, tema, modalidad, duracion, tipo, nivel }) {
  const temaCentral = tema || objetivo || 'el tema indicado';
  const nivelEducativo = nivel || grado || 'el nivel seleccionado';
  const modalidadTexto = modalidad === 'grupal' ? 'trabajo colaborativo en equipo' : 'trabajo individual y reflexión personal';
  const duracionTexto = duracion ? `${duracion} minutos` : '35 minutos';
  const tipoActividad = tipo || 'desarrollo';

  return [
    {
      titulo: `Actividad 1 (${tipoActividad.toUpperCase()}): Explorando ${temaCentral}`,
      descripcion: `Introduce el tema de ${temaCentral} en la materia de ${materia} con una dinámica de ${modalidadTexto}. El objetivo es activar conocimientos previos, motivar al grupo y establecer el propósito de la sesión para estudiantes de ${nivelEducativo}.`,
      nivel: nivelEducativo,
      tipo: tipoActividad,
      duracion: duracionTexto
    },
    {
      titulo: `Actividad 2 (${tipoActividad.toUpperCase()}): Aplicación práctica`,
      descripcion: `Profundiza en ${temaCentral} mediante ejercicios guiados que permitan a los alumnos aplicar lo aprendido. La actividad se realiza con modalidad ${modalidadTexto} y busca consolidar el objetivo propuesto para ${nivelEducativo}.`,
      nivel: nivelEducativo,
      tipo: tipoActividad,
      duracion: duracionTexto
    },
    {
      titulo: `Actividad 3 (${tipoActividad.toUpperCase()}): Cierre reflexivo`,
      descripcion: `Cierra la sesión invitando a los estudiantes de ${nivelEducativo} a compartir hallazgos clave de ${temaCentral}, destacando logros y áreas de mejora. Mantén la modalidad ${modalidadTexto} para fomentar la metacognición.`,
      nivel: nivelEducativo,
      tipo: tipoActividad,
      duracion: duracionTexto
    }
  ];
}

/**
 * POST /actividades/generar
 * Body esperado: { materia, tema, modalidad, duracion, tipo, nivel }
 */
router.post('/generar', async (req, res) => {
  // Verificar que el body esté presente
  if (!req.body) {
    console.error('req.body es undefined');
    return res.status(400).json({ 
      error: 'Body no recibido. Asegúrate de enviar Content-Type: application/json' 
    });
  }

  const {
    materia,
    grado,
    objetivo,
    tema,
    modalidad,
    duracion,
    tipo,
    nivel
  } = req.body;

  if (!materia || !(tema || objetivo) || !(nivel || grado)) {
    return res.status(400).json({ 
      error: 'Faltan campos requeridos. Asegúrate de enviar materia, tema (u objetivo) y nivel educativo.',
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
      const actividades = generarActividadesSimples({
        materia,
        grado,
        objetivo,
        tema,
        modalidad,
        duracion,
        tipo,
        nivel
      });
      return res.json({ 
        actividades, 
        modo: 'simple',
        filtros: {
          materia,
          tema: tema || objetivo,
          modalidad,
          duracion,
          tipo,
          nivel: nivel || grado
        }
      });
    }

    // 🧠 Prompt: texto que se enviará al modelo de IA
    const nivelEducativo = nivel || grado;
    const objetivoEducativo = objetivo || `Lograr aprendizaje significativo sobre ${tema}`;
    const duracionTexto = duracion ? `${duracion} minutos` : '40 minutos';
    const modalidadTexto = modalidad ? `Modalidad principal: ${modalidad}.` : '';
    const tipoDescripcion = tipo ? `Tipo de actividad: ${tipo}.` : '';

    const prompt = `
Eres un asistente educativo. Genera 3 actividades breves y concretas para estudiantes de ${nivelEducativo} en la materia de ${materia}.
Tema central: ${tema || objetivo}.
${modalidadTexto}
${tipoDescripcion}
Duración estimada para cada actividad: ${duracionTexto}.
Objetivo educativo: "${objetivoEducativo}".

Cada actividad debe incluir:
- "titulo"
- "descripcion"
- "nivel" (especificando el nivel educativo o dificultad sugerida)
- "duracion" (texto corto con la duración aproximada)

Devuelve únicamente un JSON válido con una lista llamada "actividades".
`;

    // 🚀 Llamada a la API de Hugging Face
    // Nota: Muchos modelos requieren que los aceptes primero en huggingface.co
    // Visita: https://huggingface.co/models y busca el modelo para aceptarlo
    // Modelos que deberían estar disponibles (en orden de prioridad):
    const modelos = [
      "https://router.huggingface.co/hf-inference/facebook/opt-125m",
      "https://router.huggingface.co/hf-inference/distilgpt2",
      "https://router.huggingface.co/hf-inference/openai-community/gpt2",
      "https://router.huggingface.co/hf-inference/google/flan-t5-base"
    ];
    
    if (USE_AI) {
      console.log('IA activada: ✅');
      console.log(`Modelos configurados (prioridad): ${modelos.map(url => url.split('/hf-inference/')[1]).join(', ')}`);
    }
    
    let response;
    let lastError;
    let modeloSeleccionado = null;
    
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
          modeloSeleccionado = modelUrl.split('/hf-inference/')[1];
          break;
        } else {
          const errorText = await response.text();
          console.log(`⚠️ Modelo ${modelUrl} falló: ${response.status} - ${errorText}`);
          
          // Extraer nombre del modelo de la URL
          const modelName = modelUrl.split('/hf-inference/')[1];
          lastError = { 
            status: response.status, 
            message: errorText, 
            model: modelName,
            url: modelUrl,
            solucion: response.status === 404 
              ? `Visita https://huggingface.co/${modelName} y haz clic en "Agree and access repository" para aceptar el modelo`
              : 'Verifica que tu token tenga permisos de inferencia en Hugging Face Settings'
          };
        }
      } catch (fetchError) {
        console.log(`⚠️ Error al llamar ${modelUrl}:`, fetchError.message);
        lastError = { error: fetchError.message, model: modelUrl };
      }
    }
    
    // Si todos los modelos fallaron, usar generación simple
    if (!response || !response.ok) {
      console.log('❌ Todos los modelos de IA fallaron, usando generación simple');
      const actividades = generarActividadesSimples({
        materia,
        grado,
        objetivo,
        tema,
        modalidad,
        duracion,
        tipo,
        nivel
      });
      
      // Crear mensaje más útil con instrucciones
      let mensaje = 'La IA no está disponible, se generaron actividades básicas.';
      if (lastError?.solucion) {
        mensaje += ` ${lastError.solucion}`;
      }
      
      return res.json({ 
        actividades, 
        modo: 'simple',
        nota: mensaje,
        error_ia: lastError,
        filtros: {
          materia,
          tema: tema || objetivo,
          modalidad,
          duracion,
          tipo,
          nivel: nivel || grado
        },
        instrucciones: {
          paso1: 'Ve a https://huggingface.co/settings/tokens',
          paso2: 'Verifica que tu token tenga el permiso "Make calls to inference providers"',
          paso3: `Visita cada modelo y haz clic en "Agree and access repository":`,
          modelos: modelos.map(url => url.split('/hf-inference/')[1])
        }
      });
    }

    if (modeloSeleccionado) {
      console.log(`Modelo configurado: ${modeloSeleccionado}`);
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

    res.json({ 
      actividades,
      modo: 'ia',
      filtros: {
        materia,
        tema: tema || objetivo,
        modalidad,
        duracion,
        tipo,
        nivel: nivel || grado
      }
    });

  } catch (error) {
    console.error('Error generando actividades:', error);
    res.status(500).json({ error: 'Error interno generando actividades', details: error.message });
  }
});

export default router;
