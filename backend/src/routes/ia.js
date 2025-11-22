import express from 'express';
import 'dotenv/config';

const router = express.Router();

// 🔄 Configuración de reintentos automáticos
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 2000,      // 2 segundos
  maxDelayMs: 60000,         // 60 segundos
  backoffMultiplier: 2       // Exponential backoff
};

// 💾 Caché simple en memoria para actividades generadas (opcional)
const activityCache = new Map();
const CACHE_TTL_MS = 3600000; // 1 hora

/**
 * Genera un hash de los parámetros para usar como clave de caché
 */
function generateCacheKey(params) {
  const key = `${params.materia}_${params.tema || params.objetivo}_${params.nivel || params.grado}`;
  return Buffer.from(key).toString('base64');
}

/**
 * Obtiene actividades del caché si existen y no han expirado
 */
function getFromCache(params) {
  const key = generateCacheKey(params);
  const cached = activityCache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    console.log('✅ Actividades obtenidas del caché');
    return cached.data;
  }
  
  // Limpiar caché expirado
  if (cached) {
    activityCache.delete(key);
  }
  
  return null;
}

/**
 * Guarda actividades en el caché
 */
function saveToCache(params, data) {
  const key = generateCacheKey(params);
  activityCache.set(key, {
    data,
    timestamp: Date.now()
  });
}

/**
 * Realiza reintentos automáticos con exponential backoff
 * Maneja específicamente el error 429 (quota exceeded)
 */
async function fetchWithRetry(apiUrl, options, retryCount = 0) {
  try {
    const response = await fetch(apiUrl, options);
    const rawResponse = await response.text();

    // Si es éxito, retornar
    if (response.ok) {
      return { response, rawResponse };
    }

    // Si es error 429 y hay reintentos disponibles
    if (response.status === 429 && retryCount < RETRY_CONFIG.maxRetries) {
      const delayMs = Math.min(
        RETRY_CONFIG.initialDelayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, retryCount),
        RETRY_CONFIG.maxDelayMs
      );
      
      console.warn(`⚠️ Cuota excedida (429). Reintentando en ${delayMs / 1000} segundos... (intento ${retryCount + 1}/${RETRY_CONFIG.maxRetries})`);
      
      // Esperar antes de reintentar
      await new Promise(resolve => setTimeout(resolve, delayMs));
      
      return fetchWithRetry(apiUrl, options, retryCount + 1);
    }

    // Si es otro error, retornar el error
    return { response, rawResponse, error: true };
  } catch (error) {
    if (retryCount < RETRY_CONFIG.maxRetries) {
      const delayMs = Math.min(
        RETRY_CONFIG.initialDelayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, retryCount),
        RETRY_CONFIG.maxDelayMs
      );
      
      console.warn(`⚠️ Error de conexión. Reintentando en ${delayMs / 1000} segundos... (intento ${retryCount + 1}/${RETRY_CONFIG.maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      
      return fetchWithRetry(apiUrl, options, retryCount + 1);
    }
    
    throw error;
  }
}

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
        paso1: 'Verifica que GEMINI_API_KEY esté definido en backend/.env',
        paso2: 'Obtén tu API key en https://makersuite.google.com/app/apikey',
        paso3: 'Reinicia el backend después de actualizar las credenciales'
      }
    });
  };

  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const USE_AI = process.env.USE_AI !== 'false' && GEMINI_API_KEY;
    
    // Si no hay API key o está deshabilitada, usar generación simple
    if (!USE_AI) {
      console.log('🤖 Generando actividades sin IA (modo simple)');
      return responderModoSimple(
        'La IA está desactivada o la clave de Gemini no está configurada.'
      );
    }

    // 🧠 Verificar caché primero
    const cacheParams = { materia, tema, objetivo, nivel, grado };
    const cachedActivities = getFromCache(cacheParams);
    if (cachedActivities) {
      return res.json({
        actividades: cachedActivities,
        modo: 'IA (caché)',
        nota: 'Actividades obtenidas del caché local',
        filtros: cacheParams
      });
    }

    // 🧠 Construir prompt optimizado (menos tokens)
    const nivelEducativo = nivel || grado;
    const objetivoEducativo = objetivo || `Aprendizaje en ${tema}`;
    const duracionTexto = duracion || '40';
    const modalidadTexto = modalidad || '';
    const tipoDescripcion = tipo || '';

    // Prompt compacto para reducir tokens
    const prompt = `Genera 3 actividades para ${nivelEducativo} en ${materia} sobre "${tema || objetivo}". 
${modalidadTexto ? `Modalidad: ${modalidadTexto}. ` : ''}${tipoDescripcion ? `Tipo: ${tipoDescripcion}. ` : ''}Duración: ${duracionTexto} min.
Devuelve SOLO JSON:
[{"titulo":"...","descripcion":"...","nivel":"...","duracion":"..."}]`;

    console.log('🤖 IA (Gemini) activada: ✅');
    console.log(`📦 Modelo configurado: ${GEMINI_MODEL}`);
    console.log('🔄 Reintentos automáticos: Habilitados (max 3)');

    const systemInstruction = 'Responde con JSON válido únicamente.';
    const fullPrompt = `${systemInstruction}\n${prompt}`;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    
    // Usar la función con reintentos
    const { response, rawResponse, error: fetchError } = await fetchWithRetry(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024  // Reducido de 2048
        }
      })
    });

    if (fetchError || !response.ok) {
      console.error('❌ Error desde Gemini después de reintentos:', {
        status: response?.status,
        message: rawResponse
      });
      return responderModoSimple(
        'La IA no está disponible después de reintentos, se generaron actividades básicas.',
        { status: response?.status, message: rawResponse }
      );
    }

    let data;
    try {
      data = JSON.parse(rawResponse);
    } catch (jsonError) {
      console.error('❌ Error parseando respuesta de Gemini:', rawResponse);
      return responderModoSimple(
        'La IA respondió con un formato inesperado, se generaron actividades básicas.',
        { error: 'JSON inválido desde Gemini' }
      );
    }

    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!content) {
      console.error('❌ Respuesta vacía de Gemini:', data);
      return responderModoSimple(
        'La IA no devolvió contenido válido, se generaron actividades básicas.',
        { error: 'Respuesta vacía de Gemini' }
      );
    }

    // 💡 Intentar extraer JSON del contenido devuelto por Gemini
    let generatedText = content
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    let actividades;
    try {
      // Detectar JSON tipo {} o []
      const jsonMatch = generatedText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);

      if (!jsonMatch) throw new Error("No se detectó JSON");

      let parsed = JSON.parse(jsonMatch[0]);

      // Gemini a veces devuelve { actividades: [...] }
      if (parsed.actividades) {
        actividades = parsed.actividades;
      } else {
        actividades = Array.isArray(parsed) ? parsed : [parsed];
      }

      // Guardar en caché
      saveToCache(cacheParams, actividades);

      return res.json({
        actividades,
        modo: 'IA',
        nota: 'Actividades generadas con éxito por Gemini',
        filtros: cacheParams
      });

    } catch (err) {
      console.warn("⚠️ No se pudo parsear JSON de Gemini, usando fallback");
      actividades = [
        {
          titulo: "Actividad generada",
          descripcion: generatedText.slice(0, 200),
          nivel: nivelEducativo,
          duracion: `${duracionTexto} minutos`
        }
      ];
      
      return res.json({
        actividades,
        modo: 'IA (fallback)',
        nota: 'Actividades generadas con formato fallback',
        filtros: cacheParams
      });
    }

  } catch (error) {
    console.error('❌ Error generando actividades:', error.message);
    return responderModoSimple(
      'Error interno al generar actividades con IA',
      { error: error.message }
    );
  }
});

/**
 * GET /ia/stats
 * Retorna estadísticas de uso y caché
 */
router.get('/stats', (req, res) => {
  const stats = {
    cacheSize: activityCache.size,
    maxCacheSize: 100,
    cacheTTLMinutes: CACHE_TTL_MS / 60000,
    retryConfig: {
      maxRetries: RETRY_CONFIG.maxRetries,
      initialDelayMs: RETRY_CONFIG.initialDelayMs,
      backoffMultiplier: RETRY_CONFIG.backoffMultiplier
    },
    timestamp: new Date().toISOString(),
    tips: [
      'Si tienes errores 429, espera 44-60 segundos antes de reintentar',
      'Las actividades se cachean por 1 hora para reducir llamadas a la API',
      'Usa modelos gemini-1.5-flash para menor consumo de tokens',
      'Verifica tu cuota en: https://ai.google.com/usage'
    ]
  };

  res.json(stats);
});

/**
 * DELETE /ia/cache
 * Limpia el caché de actividades
 */
router.delete('/cache', (req, res) => {
  const sizeBefore = activityCache.size;
  activityCache.clear();

  res.json({
    message: 'Caché limpiado',
    itemsCleared: sizeBefore,
    timestamp: new Date().toISOString()
  });
});

export default router;
