import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Datos de ejemplo para testing sin base de datos
export const mockData = {
  maestros: [
    { id: 1, nombre: 'Prof. María García', email: 'maria.garcia@didactia.com', telefono: '555-0101', especialidad: 'Matemáticas' },
    { id: 2, nombre: 'Prof. Juan López', email: 'juan.lopez@didactia.com', telefono: '555-0102', especialidad: 'Ciencias' },
    { id: 3, nombre: 'Prof. Ana Martínez', email: 'ana.martinez@didactia.com', telefono: '555-0103', especialidad: 'Lengua' }
  ],
  clases: [
    { id: 1, id_maestro: 1, nombre: 'Matemáticas Básicas', grado: '5to', materia: 'Matemáticas' },
    { id: 2, id_maestro: 1, nombre: 'Álgebra', grado: '6to', materia: 'Matemáticas' },
    { id: 3, id_maestro: 2, nombre: 'Ciencias Naturales', grado: '5to', materia: 'Ciencias' },
    { id: 4, id_maestro: 3, nombre: 'Lengua y Literatura', grado: '5to', materia: 'Lengua' }
  ],
  actividades: [
    { id: 1, id_clase: 1, titulo: 'Ejercicios de Suma', descripcion: 'Resolver problemas de suma básica', fecha: '2024-01-15' },
    { id: 2, id_clase: 1, titulo: 'Multiplicación', descripcion: 'Aprender las tablas de multiplicar', fecha: '2024-01-20' },
    { id: 3, id_clase: 2, titulo: 'Ecuaciones Lineales', descripcion: 'Resolver ecuaciones de primer grado', fecha: '2024-01-18' },
    { id: 4, id_clase: 3, titulo: 'El Sistema Solar', descripcion: 'Estudiar los planetas y sus características', fecha: '2024-01-16' },
    { id: 5, id_clase: 4, titulo: 'Lectura Comprensiva', descripcion: 'Analizar textos narrativos', fecha: '2024-01-17' }
  ]
};

// Por ahora, siempre usar datos de ejemplo
export const db = null;

console.log('📋 Usando datos de ejemplo (modo demo)');
