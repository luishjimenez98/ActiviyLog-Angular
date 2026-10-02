import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import personalRoutes from './routes/personalRoutes.js';
import projectsRoutes from './routes/projectRoutes.js';
import timeRoutes from './routes/timeRoutes.js';

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('ERROR CRÍTICO: Falta definir JWT_SECRET en el archivo .env');
  process.exit(1);
}


const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ONLINE' }));

app.use('/', authRoutes);
app.use('/personal', personalRoutes);
app.use('/proyectos', projectsRoutes);
app.use('/horas', timeRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});




