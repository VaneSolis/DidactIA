import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { db } from './db.js';
import maestrosRoutes from './routes/maestros.js';
import clasesRoutes from './routes/clases.js';
import actividadesRoutes from './routes/actividades.js';
import iaRoutes from './routes/ia.js';

const app = express();

// Configuración de CORS
// Permite solicitudes desde el frontend (normalmente en puerto 5173 para Vite)
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Middleware para parsear JSON (debe estar antes de las rutas)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de depuración (solo para desarrollo)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT') {
      console.log('📨 Body recibido:', req.body);
      console.log('📋 Content-Type:', req.get('Content-Type'));
    }
    next();
  });
}

// Ruta de prueba para verificar CORS y conexión
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Rutas principales
app.use('/maestros', maestrosRoutes);
app.use('/clases', clasesRoutes);

// IMPORTANTE: Las rutas específicas deben ir ANTES de las generales
// Ruta específica para generar actividades con IA
app.use('/actividades', iaRoutes);

// Rutas generales de actividades (GET /actividades, POST /actividades)
app.use('/actividades', actividadesRoutes);

app.listen(process.env.PORT || 4000, () => {
  console.log(`✅ Servidor backend corriendo en puerto ${process.env.PORT || 4000}`);
  console.log(`🌐 CORS habilitado para: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

