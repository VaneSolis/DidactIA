import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🔧 Configurando la base de datos MySQL...');
    
    // Conectar sin especificar base de datos para crearla
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || ''
    });

    console.log('✅ Conectado a MySQL');

    // Crear la base de datos si no existe
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'didactia'}`);
    console.log('✅ Base de datos creada/verificada');

    // Usar la base de datos
    await connection.execute(`USE ${process.env.DB_NAME || 'didactia'}`);

    // Leer y ejecutar el script SQL
    const sqlPath = path.join(process.cwd(), '..', 'database', 'setup.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Dividir el script en declaraciones individuales
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }

    console.log('✅ Tablas creadas exitosamente');
    console.log('✅ Datos de ejemplo insertados');
    
    // Verificar las tablas creadas
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Tablas creadas:', tables.map(t => Object.values(t)[0]));

    // Verificar datos
    const [maestros] = await connection.execute('SELECT COUNT(*) as count FROM maestros');
    const [clases] = await connection.execute('SELECT COUNT(*) as count FROM clases');
    const [actividades] = await connection.execute('SELECT COUNT(*) as count FROM actividades');
    
    console.log(`📊 Datos insertados:`);
    console.log(`   - Maestros: ${maestros[0].count}`);
    console.log(`   - Clases: ${clases[0].count}`);
    console.log(`   - Actividades: ${actividades[0].count}`);

    console.log('🎉 ¡Base de datos configurada exitosamente!');
    console.log('💡 Ahora puedes ejecutar: npm start');

  } catch (error) {
    console.error('❌ Error configurando la base de datos:', error.message);
    console.log('💡 Asegúrate de que MySQL esté instalado y ejecutándose');
    console.log('📋 Sigue las instrucciones en docs/INSTALL_MYSQL.md');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();
