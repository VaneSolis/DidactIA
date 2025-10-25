import express from 'express';
import cors from 'cors';
import { db } from './db.js';
import maestrosRoutes from './routes/maestros.js';
import clasesRoutes from './routes/clases.js';
import actividadesRoutes from './routes/actividades.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/maestros', maestrosRoutes);
app.use('/clases', clasesRoutes);
app.use('/actividades', actividadesRoutes);

app.listen(process.env.PORT || 4000, () => {
  console.log(`✅ Servidor backend corriendo en puerto ${process.env.PORT || 4000}`);
});

