# Configuración con MySQL Workbench - DidactIA

## 🗄️ **Paso 1: Conectar a MySQL**

1. **Abre MySQL Workbench**
2. **Crea una nueva conexión** (si no tienes una):
   - Hostname: `localhost`
   - Port: `3306`
   - Username: `root`
   - Password: `Mazerunner12` (o tu contraseña)
3. **Conecta a la base de datos**

## 🏗️ **Paso 2: Crear la base de datos**

Ejecuta estos comandos en Workbench:

```sql
-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS didactia;
USE didactia;

-- Verificar que se creó
SHOW DATABASES;
```

## 📋 **Paso 3: Ejecutar el script SQL**

1. **Abrir el script:**
   - File → Open SQL Script
   - Navega a: `database/setup.sql`
   - Abre el archivo

2. **Ejecutar el script:**
   - Selecciona todo el contenido (Ctrl+A)
   - Ejecuta (Ctrl+Shift+Enter)
   - O ejecuta por secciones

3. **Verificar las tablas:**
   ```sql
   USE didactia;
   SHOW TABLES;
   ```

## ✅ **Paso 4: Verificar los datos**

```sql
-- Verificar maestros
SELECT * FROM maestros;

-- Verificar clases
SELECT * FROM clases;

-- Verificar actividades
SELECT * FROM actividades;
```

Deberías ver:
- **3 maestros** (Prof. María García, Prof. Juan López, Prof. Ana Martínez)
- **4 clases** (Matemáticas Básicas, Álgebra, Ciencias Naturales, Lengua y Literatura)
- **5 actividades** (Ejercicios de Suma, Multiplicación, etc.)

## 🚀 **Paso 5: Probar la conexión desde el backend**

1. **Asegúrate de que el archivo `.env` esté configurado:**
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASS=Mazerunner12
   DB_NAME=didactia
   PORT=4000
   ```

2. **Inicia el servidor:**
   ```bash
   cd backend
   npm start
   ```

3. **Deberías ver:**
   ```
   ✅ Conectado a MySQL exitosamente
   ✅ Servidor backend corriendo en puerto 4000
   ```

## 🧪 **Paso 6: Probar los endpoints**

### Con Postman:
- `GET http://localhost:4000/maestros`
- `GET http://localhost:4000/clases`
- `GET http://localhost:4000/actividades`

### Con Workbench:
```sql
-- Verificar que los datos se están leyendo correctamente
SELECT COUNT(*) as total_maestros FROM maestros;
SELECT COUNT(*) as total_clases FROM clases;
SELECT COUNT(*) as total_actividades FROM actividades;
```

## 🔧 **Solución de problemas**

### Error: "Access denied for user 'root'@'localhost'"
- Verifica la contraseña en `.env`
- Asegúrate de que MySQL esté ejecutándose
- Verifica que el usuario `root` tenga permisos

### Error: "Unknown database 'didactia'"
- Ejecuta: `CREATE DATABASE didactia;`
- Verifica que estés usando la base de datos correcta

### Error: "Table doesn't exist"
- Ejecuta el script `database/setup.sql` completo
- Verifica que estés en la base de datos `didactia`

## 📊 **Estructura de las tablas**

### Tabla `maestros`:
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `nombre` (VARCHAR(100))
- `email` (VARCHAR(100), UNIQUE)
- `telefono` (VARCHAR(20))
- `especialidad` (VARCHAR(100))
- `created_at` (TIMESTAMP)

### Tabla `clases`:
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `id_maestro` (INT, FOREIGN KEY)
- `nombre` (VARCHAR(100))
- `grado` (VARCHAR(20))
- `materia` (VARCHAR(100))
- `created_at` (TIMESTAMP)

### Tabla `actividades`:
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `id_clase` (INT, FOREIGN KEY)
- `titulo` (VARCHAR(200))
- `descripcion` (TEXT)
- `fecha` (DATE)
- `created_at` (TIMESTAMP)
