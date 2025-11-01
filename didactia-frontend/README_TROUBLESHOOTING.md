# Solución de Problemas - Error 404

## El backend no está corriendo

El error 404 significa que el servidor backend no está accesible. Sigue estos pasos:

### 1. Verificar que el backend esté corriendo

Abre una **nueva terminal** y ejecuta:

```bash
cd backend
npm run dev
```

Deberías ver:
```
✅ Servidor backend corriendo en puerto 4000
🌐 CORS habilitado para: http://localhost:5173
```

### 2. Probar el endpoint manualmente

Abre tu navegador y visita:
```
http://localhost:4000/health
```

Deberías ver:
```json
{
  "status": "OK",
  "message": "Backend funcionando correctamente",
  "timestamp": "..."
}
```

### 3. Probar el endpoint de maestros

Visita:
```
http://localhost:4000/maestros
```

Deberías ver una lista de maestros (JSON).

### 4. Reiniciar el servidor de desarrollo de Vite

**IMPORTANTE**: Si cambiaste el archivo `.env`, debes reiniciar el servidor de Vite:

1. Detén el servidor con `Ctrl+C`
2. Inicia nuevamente:
```bash
cd didactia-frontend
npm run dev
```

### 5. Verificar la URL en la consola del navegador

1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Console"
3. Deberías ver: `🔗 API Base URL: http://localhost:4000`
4. Si ves otra URL o no ves nada, el `.env` no se cargó correctamente

## Checklist rápido

- [ ] El backend está corriendo (terminal con `npm run dev`)
- [ ] Puedes acceder a `http://localhost:4000/health` en el navegador
- [ ] El servidor de Vite se reinició después de cambiar `.env`
- [ ] La consola muestra la URL correcta: `http://localhost:4000`

## Si aún no funciona

1. Verifica que no haya otro proceso usando el puerto 4000
2. Revisa que el archivo `.env` en `didactia-frontend/` tenga:
   ```
   VITE_API_URL=http://localhost:4000
   ```
3. Verifica que ambos servidores estén en terminales diferentes y corriendo simultáneamente

