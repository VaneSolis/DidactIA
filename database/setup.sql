-- Script para crear la base de datos y tablas de DidactIA
CREATE DATABASE IF NOT EXISTS didactia;
USE didactia;

-- Tabla de maestros
CREATE TABLE IF NOT EXISTS maestros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    especialidad VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de clases
CREATE TABLE IF NOT EXISTS clases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_maestro INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    grado VARCHAR(20) NOT NULL,
    materia VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_maestro) REFERENCES maestros(id) ON DELETE CASCADE
);

-- Tabla de actividades
CREATE TABLE IF NOT EXISTS actividades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_clase INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_clase) REFERENCES clases(id) ON DELETE CASCADE
);

-- Insertar datos de ejemplo
INSERT INTO maestros (nombre, email, telefono, especialidad) VALUES
('Prof. María García', 'maria.garcia@didactia.com', '555-0101', 'Matemáticas'),
('Prof. Juan López', 'juan.lopez@didactia.com', '555-0102', 'Ciencias'),
('Prof. Ana Martínez', 'ana.martinez@didactia.com', '555-0103', 'Lengua');

INSERT INTO clases (id_maestro, nombre, grado, materia) VALUES
(1, 'Matemáticas Básicas', '5to', 'Matemáticas'),
(1, 'Álgebra', '6to', 'Matemáticas'),
(2, 'Ciencias Naturales', '5to', 'Ciencias'),
(3, 'Lengua y Literatura', '5to', 'Lengua');

INSERT INTO actividades (id_clase, titulo, descripcion, fecha) VALUES
(1, 'Ejercicios de Suma', 'Resolver problemas de suma básica', '2024-01-15'),
(1, 'Multiplicación', 'Aprender las tablas de multiplicar', '2024-01-20'),
(2, 'Ecuaciones Lineales', 'Resolver ecuaciones de primer grado', '2024-01-18'),
(3, 'El Sistema Solar', 'Estudiar los planetas y sus características', '2024-01-16'),
(4, 'Lectura Comprensiva', 'Analizar textos narrativos', '2024-01-17');
