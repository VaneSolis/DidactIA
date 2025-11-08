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

  const filtros = {
    materia,
    tema: tema || objetivo,
    modalidad,
    duracion,
    tipo,
    nivel: nivel || grado
  };

  const responderModoSimple = (nota, errorIA = null) => {
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
      nota,
      error_ia: errorIA,
      filtros,
      instrucciones: {
        paso1: 'Verifica que OPENAI_API_KEY esté definido en backend/.env',
        paso2: 'Confirma que tu cuenta de OpenAI tiene acceso al modelo y saldo disponible',
        paso3: 'Reinicia el backend después de actualizar las credenciales'
      }
    });
  };

  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const USE_AI = process.env.USE_AI !== 'false' && OPENAI_API_KEY;
    
    // Si no hay API key o está deshabilitada, usar generación simple
    if (!USE_AI) {
      console.log('Generando actividades sin IA (modo simple)');
      return responderModoSimple(
        'La IA está desactivada o la clave de OpenAI no está configurada.'
      );
    }

    // 🧠 Prompt: texto que se enviará al modelo de IA
    const nivelEducativo = nivel || grado;
    const objetivoEducativo = objetivo || `Lograr aprendizaje significativo sobre ${tema}`;
    const duracionTexto = duracion ? `${duracion} minutos` : '40 minutos';
    const modalidadTexto = modalidad ? `Modalidad principal: ${modalidad}.` : '';
    const tipoDescripcion = tipo ? `Tipo de actividad: ${tipo}.` : '';

    const prompt = `
Genera 3 actividades breves y concretas para estudiantes de ${nivelEducativo} en la materia de ${materia}.
Tema central: ${tema || objetivo}.
${modalidadTexto}
${tipoDescripcion}
Duración estimada para cada actividad: ${duracionTexto}.
Objetivo educativo: "${objetivoEducativo}".

Devuelve únicamente un JSON válido con una lista llamada "actividades" en el siguiente formato:
[
  {
    "titulo": "...",
    "descripcion": "...",
    "nivel": "...",
    "duracion": "..."
  }
]
`;

    console.log('IA (OpenAI) activada: ✅');
    console.log(`Modelo configurado: ${OPENAI_MODEL}`);

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
            content: 'Eres un asistente educativo especializado en diseñar actividades pedagógicas. Responde siempre con JSON válido y sin texto adicional.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    const rawResponse = await response.text();

    if (!response.ok) {
      console.error('⚠️ Error desde OpenAI:', rawResponse);
      return responderModoSimple(
        'La IA no está disponible, se generaron actividades básicas.',
        { status: response.status, message: rawResponse }
      );
    }

    let data;
    try {
      data = JSON.parse(rawResponse);
    } catch (jsonError) {
      console.error('Error parseando respuesta de OpenAI:', rawResponse);
      return responderModoSimple(
        'La IA respondió con un formato inesperado, se generaron actividades básicas.',
        { error: 'JSON inválido desde OpenAI' }
      );
    }

    const content = data?.choices?.[0]?.message?.content?.trim();
    if (!content) {
      console.error('Respuesta vacía de OpenAI:', data);
      return responderModoSimple(
        'La IA no devolvió contenido válido, se generaron actividades básicas.',
        { error: 'Respuesta vacía de OpenAI' }
      );
    }

    // 💡 Intentar extraer JSON del contenido devuelto por OpenAI
    let generatedText = '';
    generatedText = content;

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
        nivel: "medio",
        duracion: duracion ? `${duracion} minutos` : '40 minutos'
      }];
    }

    res.json({ 
      actividades,
      modo: 'ia',
      filtros,
      modelo: OPENAI_MODEL
    });

  } catch (error) {
    console.error('Error generando actividades:', error);
    return responderModoSimple(
      'Ocurrió un error interno al usar la IA, se generaron actividades básicas.',
      { error: error.message }
    );
  }
});

export default router;
