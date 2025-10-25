# Configuración de la Base de Datos - DidactIA

## Requisitos previos
- MySQL Server instalado y ejecutándose
- Usuario root con acceso a MySQL

## Pasos para configurar la base de datos

### 1. Conectar a MySQL
```bash
mysql -u root -p
```

### 2. Ejecutar el script de configuración
```sql
source database/setup.sql
```

O alternativamente, puedes copiar y pegar el contenido del archivo `database/setup.sql` en tu cliente de MySQL.

### 3. Verificar que las tablas se crearon correctamente
```sql
USE didactia;
SHOW TABLES;
```

Deberías ver:
- maestros
- clases  
- actividades

### 4. Verificar los datos de ejemplo
```sql
SELECT * FROM maestros;
SELECT * FROM clases;
SELECT * FROM actividades;
```

## Configuración del archivo .env

El archivo `.env` en la carpeta `backend/` debe contener:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=tu_contraseña_aqui
DB_NAME=didactia
PORT=4000
```

**Nota:** Reemplaza `tu_contraseña_aqui` con tu contraseña real de MySQL.

## Iniciar el servidor

Una vez configurada la base de datos:

```bash
cd backend
npm start
```

El servidor debería iniciar en `http://localhost:4000` y mostrar:
```
✅ Conectado a MySQL
✅ Servidor backend corriendo en puerto 4000
```

## Probar los endpoints

Ahora puedes probar los endpoints en Postman:

- `GET http://localhost:4000/maestros` - Debería devolver 3 maestros
- `GET http://localhost:4000/clases` - Debería devolver 4 clases
- `GET http://localhost:4000/actividades` - Debería devolver 5 actividades
- `POST http://localhost:4000/clases` - Crear nueva clase
- `POST http://localhost:4000/actividades` - Crear nueva actividad
