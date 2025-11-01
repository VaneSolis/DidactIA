import { Router } from 'express';
import { db, mockData } from '../db.js';

const router = Router();

// Ruta para obtener todos los maestros
router.get('/', async (req, res) => {
  try {
    if (db) {
      const [rows] = await db.query('SELECT * FROM maestros');
      res.json(rows);
    } else {
      // Usar datos de ejemplo si no hay conexión a la base de datos
      console.log('📋 Usando datos de ejemplo para maestros');
      res.json(mockData.maestros);
    }
  } catch (error) {
    console.error('❌ Error al obtener maestros:', error);
    // En caso de error, devolver datos de ejemplo
    console.log('📋 Usando datos de ejemplo por error');
    res.json(mockData.maestros);
  }
});

// POST: crear nuevo maestro
router.post('/', async (req, res) => {
  try {
    const { nombre, email } = req.body;
    
    // Validar campos requeridos
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ message: 'El nombre es requerido' });
    }

    // Si email está vacío o solo espacios, generar un email por defecto o hacerlo requerido
    // Para compatibilidad con la BD que requiere email NOT NULL
    let emailFinal = email && email.trim() !== '' ? email.trim() : `${nombre.trim().toLowerCase().replace(/\s+/g, '.')}@didactia.local`;
    
    if (db) {
      try {
        const [result] = await db.query(
          'INSERT INTO maestros (nombre, email) VALUES (?, ?)',
          [nombre.trim(), emailFinal]
        );
        res.json({ 
          id: result.insertId, 
          message: 'Maestro creado correctamente',
          data: { id: result.insertId, nombre: nombre.trim(), email: emailFinal }
        });
      } catch (dbError) {
        // Si es error de email duplicado
        if (dbError.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ 
            message: 'Ya existe un maestro con ese email. Por favor, usa otro email.' 
          });
        }
        // Otros errores de BD
        console.error('❌ Error en la base de datos:', dbError);
        throw dbError;
      }
    } else {
      // Simular creación con datos de ejemplo
      const newId = (mockData.maestros.length + 1);
      const newMaestro = { id: newId, nombre: nombre.trim(), email: emailFinal };
      mockData.maestros.push(newMaestro);
      res.json({ 
        id: newId, 
        message: 'Maestro creado correctamente (modo demo)',
        data: newMaestro
      });
    }
  } catch (error) {
    console.error('❌ Error al crear maestro:', error);
    const errorMessage = error.message || 'Error al crear el maestro';
    res.status(500).json({ message: errorMessage });
  }
});

export default router;
