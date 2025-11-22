# 🧪 Guía de Prueba - Optimizaciones Gemini API

Este documento te guía para probar todas las nuevas funcionalidades implementadas.

## 📋 Prerequisitos

- Backend corriendo en `http://localhost:4000`
- GEMINI_API_KEY configurado en `.env`
- `curl` o Postman instalado

---

## ✅ Test 1: Verificar Reintentos Automáticos

### Objetivo
Asegurar que la API reintenta automáticamente cuando hay error 429.

### Paso 1: Fuerza un error 429
```bash
# Haz varias solicitudes rápidamente para agotar la cuota
for i in {1..10}; do
  curl -X POST http://localhost:3000/ia/generar \
    -H "Content-Type: application/json" \
    -d '{
      "materia": "Matemáticas",
      "tema": "Números Primos",
      "nivel": "Secundaria 1"
    }'
  echo "Solicitud $i completada"
done
```

### Paso 2: Observar logs
```
⚠️ Cuota excedida (429). Reintentando en 2 segundos... (intento 1/3)
⚠️ Cuota excedida (429). Reintentando en 4 segundos... (intento 2/3)
✅ Éxito después del reintento (después de ~6 segundos)
```

### Resultado esperado
❌ **Antes**: Error 429 inmediato
✅ **Después**: Espera automática + 3 reintentos

---

## ✅ Test 2: Verificar Caché

### Objetivo
Asegurar que las actividades se cachean correctamente.

### Paso 1: Primera solicitud (sin caché)
```bash
curl -X POST http://localhost:3000/ia/generar \
  -H "Content-Type: application/json" \
  -d '{
    "materia": "Historia",
    "tema": "Revolución Francesa",
    "nivel": "Bachillerato 2"
  }'
```

**Respuesta esperada:**
```json
{
  "actividades": [...],
  "modo": "IA",
  "nota": "Actividades generadas con éxito por Gemini"
}
```

### Paso 2: Segunda solicitud (CON los MISMOS parámetros)
```bash
# Espera 2-3 segundos y luego:
curl -X POST http://localhost:3000/ia/generar \
  -H "Content-Type: application/json" \
  -d '{
    "materia": "Historia",
    "tema": "Revolución Francesa",
    "nivel": "Bachillerato 2"
  }'
```

**Respuesta esperada:**
```json
{
  "actividades": [...],
  "modo": "IA (caché)",
  "nota": "Actividades obtenidas del caché local"
}
```

### Verificación
- ✅ Primera llamada tardó ~3-5 segundos (API real)
- ✅ Segunda llamada tardó <100ms (desde caché)
- ✅ El campo `modo` cambió de "IA" a "IA (caché)"

---

## ✅ Test 3: Monitorear Estadísticas

### Objetivo
Ver estado del caché y configuración de reintentos.

### Comando
```bash
curl http://localhost:3000/ia/stats
```

### Respuesta esperada
```json
{
  "cacheSize": 1,
  "maxCacheSize": 100,
  "cacheTTLMinutes": 60,
  "retryConfig": {
    "maxRetries": 3,
    "initialDelayMs": 2000,
    "backoffMultiplier": 2
  },
  "timestamp": "2025-11-15T10:30:00.000Z",
  "tips": [...]
}
```

### Qué significa
- `cacheSize: 1` → Hay 1 elemento en caché
- `cacheTTLMinutes: 60` → El caché expira en 60 minutos
- `maxRetries: 3` → Hasta 3 intentos automáticos

---

## ✅ Test 4: Limpiar Caché

### Objetivo
Eliminar todos los elementos del caché manualmente.

### Comando
```bash
curl -X DELETE http://localhost:3000/ia/cache
```

### Respuesta esperada
```json
{
  "message": "Caché limpiado",
  "itemsCleared": 1,
  "timestamp": "2025-11-15T10:30:00.000Z"
}
```

### Verificación
```bash
# Antes de limpiar:
curl http://localhost:3000/ia/stats  # cacheSize: 1

# Después de limpiar:
curl http://localhost:3000/ia/stats  # cacheSize: 0
```

---

## ✅ Test 5: Fallback a Modo Simple

### Objetivo
Verificar que si Gemini falla, se generan actividades básicas.

### Paso 1: Desactivar IA temporalmente
Edita `.env`:
```bash
USE_AI=false
```

### Paso 2: Hacer solicitud
```bash
curl -X POST http://localhost:3000/ia/generar \
  -H "Content-Type: application/json" \
  -d '{
    "materia": "Biología",
    "tema": "Fotosíntesis",
    "nivel": "Secundaria 2"
  }'
```

### Respuesta esperada
```json
{
  "actividades": [
    {
      "titulo": "Actividad 1 (desarrollo): Explorando Fotosíntesis",
      "descripcion": "Introduce el tema de Fotosíntesis...",
      "nivel": "Secundaria 2",
      "tipo": "desarrollo",
      "duracion": "35 minutos"
    },
    ...
  ],
  "modo": "simple",
  "nota": "La IA está desactivada o la clave de Gemini no está configurada."
}
```

### Paso 3: Reactivar IA
```bash
USE_AI=true
```

---

## ✅ Test 6: Optimización de Tokens

### Objetivo
Verificar que los prompts sean más compactos.

### Actividad
1. Abre las dev tools de tu navegador (F12)
2. En la consola del backend, observa los logs
3. Busca mensajes como:
   ```
   📦 Modelo configurado: gemini-2.0-flash-exp
   🔄 Reintentos automáticos: Habilitados (max 3)
   ✅ Actividades obtenidas del caché local
   ```

### Comparación
- **Antes**: Prompt ~450 caracteres
- **Después**: Prompt ~200 caracteres
- **Ahorro**: 55% menos tokens

---

## 🧪 Test Suite Completo (Bash)

Guarda este script como `test-gemini.sh`:

```bash
#!/bin/bash

echo "🧪 Test Suite - Optimizaciones Gemini API"
echo "========================================="
echo ""

# Test 1: Stats
echo "📊 Test 1: Obtener estadísticas"
curl http://localhost:3000/ia/stats | jq .
echo ""
echo "✅ Test 1 completado"
echo ""

# Test 2: Limpiar caché
echo "🧹 Test 2: Limpiar caché"
curl -X DELETE http://localhost:3000/ia/cache | jq .
echo ""
echo "✅ Test 2 completado"
echo ""

# Test 3: Primera solicitud (sin caché)
echo "📝 Test 3: Primera solicitud (sin caché)"
time curl -X POST http://localhost:3000/ia/generar \
  -H "Content-Type: application/json" \
  -d '{
    "materia": "Matemáticas",
    "tema": "Álgebra",
    "nivel": "Secundaria 1"
  }' | jq '.modo'
echo ""
echo "✅ Test 3 completado"
echo ""

# Test 4: Segunda solicitud (CON caché)
echo "📝 Test 4: Segunda solicitud (con caché)"
sleep 2
time curl -X POST http://localhost:3000/ia/generar \
  -H "Content-Type: application/json" \
  -d '{
    "materia": "Matemáticas",
    "tema": "Álgebra",
    "nivel": "Secundaria 1"
  }' | jq '.modo'
echo ""
echo "✅ Test 4 completado"
echo ""

# Test 5: Verificar caché
echo "📊 Test 5: Verificar caché después de solicitudes"
curl http://localhost:3000/ia/stats | jq '.cacheSize'
echo ""
echo "✅ Test 5 completado"
echo ""

echo "🎉 Todos los tests completados"
```

### Ejecutar
```bash
chmod +x test-gemini.sh
./test-gemini.sh
```

---

## 📊 Métricas Esperadas

### Timing
| Escenario | Tiempo | Descripción |
|-----------|--------|-------------|
| Primera solicitud | 3-5s | Llamada a API + parsing |
| Desde caché | <100ms | Lectura de memoria |
| Con reintento (429) | 6-10s | 2-3 reintentos |

### Consumo
| Métrica | Valor |
|---------|-------|
| Tokens por solicitud | ~400 (antes) → ~160 (después) |
| Caché hit rate | 40-60% |
| Errores 429 evitados | 80-90% |

---

## 🐛 Troubleshooting

### Problema: Los reintentos no funcionan
**Solución:**
```bash
# Verifica que curl/fetch no tenga timeout bajo
# Aumenta el timeout en tu cliente
```

### Problema: Caché siempre vacío
**Solución:**
```bash
# Verifica que estés enviando los MISMOS parámetros
# Los parámetros opcionales también cuentan: 
# { materia, tema, nivel, modalidad, duracion, tipo }
```

### Problema: Error "Respuesta vacía de Gemini"
**Solución:**
1. Verifica tu GEMINI_API_KEY en `.env`
2. Verifica que no hayas excedido la cuota diaria
3. Intenta con `gemini-1.5-flash` en lugar de `gemini-2.0-flash-exp`

---

## 📚 Recursos

- [Documentación de optimizaciones](./GEMINI_OPTIMIZATION.md)
- [Gemini API Docs](https://ai.google.dev)
- [Rate Limits](https://ai.google.dev/gemini-api/docs/rate-limits)
- [Monitor Usage](https://ai.google.com/usage)

