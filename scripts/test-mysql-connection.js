import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  console.log('🔍 Probando conexión a MySQL...');
  console.log('📋 Configuración:');
  console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`   Puerto: ${process.env.DB_PORT || 3306}`);
  console.log(`   Usuario: ${process.env.DB_USER || 'root'}`);
  console.log(`   Base de datos: ${process.env.DB_NAME || 'didactia'}`);
  console.log('');

  let connection;
  
  try {
    // Intentar conectar
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'didactia'
    });

    console.log('✅ Conexión exitosa a MySQL!');

    // Probar la conexión
    await connection.ping();
    console.log('✅ Ping exitoso');

    // Verificar la base de datos
    const [databases] = await connection.execute('SHOW DATABASES');
    const dbExists = databases.some(db => Object.values(db)[0] === (process.env.DB_NAME || 'didactia'));
    
    if (dbExists) {
      console.log('✅ Base de datos "didactia" existe');
      
      // Verificar tablas
      const [tables] = await connection.execute('SHOW TABLES');
      console.log(`📋 Tablas encontradas: ${tables.length}`);
      
      if (tables.length > 0) {
        console.log('   Tablas:');
        tables.forEach(table => {
          console.log(`   - ${Object.values(table)[0]}`);
        });

        // Verificar datos
        try {
          const [maestros] = await connection.execute('SELECT COUNT(*) as count FROM maestros');
          const [clases] = await connection.execute('SELECT COUNT(*) as count FROM clases');
          const [actividades] = await connection.execute('SELECT COUNT(*) as count FROM actividades');
          
          console.log('📊 Datos en las tablas:');
          console.log(`   - Maestros: ${maestros[0].count}`);
          console.log(`   - Clases: ${clases[0].count}`);
          console.log(`   - Actividades: ${actividades[0].count}`);
        } catch (error) {
          console.log('⚠️ Error al verificar datos:', error.message);
        }
      } else {
        console.log('⚠️ No hay tablas en la base de datos');
        console.log('💡 Ejecuta el script database/setup.sql en MySQL Workbench');
      }
    } else {
      console.log('❌ Base de datos "didactia" no existe');
      console.log('💡 Crea la base de datos en MySQL Workbench:');
      console.log('   CREATE DATABASE didactia;');
    }

  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Verifica las credenciales en backend/.env');
      console.log('   - Usuario y contraseña correctos');
      console.log('   - Usuario tiene permisos para la base de datos');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 MySQL no está ejecutándose');
      console.log('   - Inicia MySQL desde MySQL Workbench');
      console.log('   - O inicia el servicio MySQL en Windows');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('💡 Base de datos no existe');
      console.log('   - Crea la base de datos: CREATE DATABASE didactia;');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testConnection();
