# Instalación y Configuración de MySQL para DidactIA

## Opción 1: Instalación Manual de MySQL

### 1. Descargar MySQL
- Ve a: https://dev.mysql.com/downloads/mysql/
- Descarga MySQL Community Server para Windows
- Ejecuta el instalador

### 2. Configuración durante la instalación
- **Config Type**: Development Computer
- **Authentication Method**: Use Strong Password Encryption
- **Root Password**: Crea una contraseña segura (ej: `Mazerunner12`)
- **Windows Service**: MySQL80 (por defecto)

### 3. Verificar la instalación
```bash
mysql --version
```

## Opción 2: Usar XAMPP (Recomendado para desarrollo)

### 1. Descargar XAMPP
- Ve a: https://www.apachefriends.org/download.html
- Descarga XAMPP para Windows

### 2. Instalar y ejecutar
- Instala XAMPP
- Abre el Panel de Control de XAMPP
- Inicia MySQL

### 3. Acceder a MySQL
- Usuario: `root`
- Contraseña: (deja vacío por defecto)
- Puerto: `3306`

## Opción 3: Usar Docker (Si tienes Docker instalado)

```bash
docker run --name mysql-didactia -e MYSQL_ROOT_PASSWORD=Mazerunner12 -e MYSQL_DATABASE=didactia -p 3306:3306 -d mysql:8.0
```

## Configuración de la Base de Datos

Una vez que MySQL esté funcionando:

### 1. Conectar a MySQL
```bash
mysql -u root -p
```

### 2. Crear la base de datos
```sql
CREATE DATABASE didactia;
USE didactia;
```

### 3. Ejecutar el script de configuración
```bash
mysql -u root -p didactia < database/setup.sql
```

### 4. Verificar las tablas
```sql
SHOW TABLES;
SELECT * FROM maestros;
```

## Configuración del archivo .env

Actualiza el archivo `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=tu_contraseña_aqui
DB_NAME=didactia
PORT=4000
```

## Probar la conexión

Después de configurar todo:

```bash
cd backend
npm start
```

Deberías ver:
```
✅ Conectado a MySQL
✅ Servidor backend corriendo en puerto 4000
```
