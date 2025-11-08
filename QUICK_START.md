# 🚀 Guía de Inicio Rápido - DidactIA

## Opción 1: Usar sin MySQL (Modo Demo) ⚡

Si quieres probar la API inmediatamente sin instalar MySQL:

```bash
cd backend
npm start
```

La API funcionará con datos de ejemplo en `http://localhost:4000`

## Opción 2: Conectar a MySQL (Modo Producción) 🗄️

### Paso 1: Instalar MySQL

**Opción A: XAMPP (Más fácil)**
1. Descarga XAMPP: https://www.apachefriends.org/download.html
2. Instala y ejecuta XAMPP
3. Inicia MySQL desde el panel de control

**Opción B: MySQL Community Server**
1. Descarga MySQL: https://dev.mysql.com/downloads/mysql/
2. Instala con contraseña para root
3. Inicia el servicio MySQL

### Paso 2: Configurar la base de datos

```bash
# Ejecutar el script de configuración automática
cd backend
npm run setup-db
```

### Paso 3: Iniciar el servidor

```bash
npm start
```

Deberías ver:
```
✅ Conectado a MySQL exitosamente
✅ Servidor backend corriendo en puerto 4000
```

## Probar la API

### Con Postman:
1. Importa la colección: `docs/DidactIA_API.postman_collection.json`
2. Prueba los endpoints:
   - `GET http://localhost:4000/maestros`
   - `GET http://localhost:4000/clases`
   - `GET http://localhost:4000/actividades`
   - `POST http://localhost:4000/clases`
   - `POST http://localhost:4000/actividades`

### Con curl:
```bash
curl http://localhost:4000/maestros
curl http://localhost:4000/clases
curl http://localhost:4000/actividades
```

## Estructura del Proyecto

```
DidactIA/
├── backend/           # API Node.js + Express
├── didactia-frontend/ # React App (Vite)
├── database/          # Scripts SQL
├── docs/             # Documentación
└── scripts/          # Scripts de configuración
```

## Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/maestros` | Obtener todos los maestros |
| GET | `/clases` | Obtener todas las clases |
| GET | `/actividades` | Obtener todas las actividades |
| POST | `/clases` | Crear nueva clase |
| POST | `/actividades` | Crear nueva actividad |

## Solución de Problemas

### Error: "No se pudo conectar a MySQL"
- Verifica que MySQL esté ejecutándose
- Revisa las credenciales en `backend/.env`
- Ejecuta `npm run setup-db` para configurar la base de datos

### Error: "Missing script: start"
- Asegúrate de estar en la carpeta `backend/`
- Ejecuta `cd backend` antes de `npm start`

### Puerto 4000 ocupado
- Cambia el puerto en `backend/.env`: `PORT=4001`
- O mata el proceso que usa el puerto 4000
