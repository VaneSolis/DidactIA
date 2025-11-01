import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { db } from './db.js';
import maestrosRoutes from './routes/maestros.js';
import clasesRoutes from './routes/clases.js';
import actividadesRoutes from './routes/actividades.js';
import iaRoutes from './routes/ia.js';

const app = express();

// Ruta para generar actividades
app.use('/actividades', iaRoutes);

// Configuración de CORS
// Permite solicitudes desde el frontend (normalmente en puerto 5173 para Vite)
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Ruta de prueba para verificar CORS y conexión
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

app.use('/maestros', maestrosRoutes);
app.use('/clases', clasesRoutes);
app.use('/actividades', actividadesRoutes);

app.listen(process.env.PORT || 4000, () => {
  console.log(`✅ Servidor backend corriendo en puerto ${process.env.PORT || 4000}`);
  console.log(`🌐 CORS habilitado para: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

