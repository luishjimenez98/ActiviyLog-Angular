import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import personalRoutes from './routes/personalRoutes.js';
import projectsRoutes from './routes/projectRoutes.js';
import timeRoutes from './routes/timeRoutes.js';


const allowedOrigins = [
  'http://localhost:4200',
  'http://localhost:3001',
  'http://activitylog.itecordurango.com'
];

dotenv.config();


const app = express();

app.use(cors({
  origin: (origin, callback) => {
    // Permite peticiones sin Origin, como algunas llamadas de servidor a servidor.
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origen no permitido por CORS'));
  }
}));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ONLINE' }));

app.use('/auth', authRoutes);
app.use('/personal', personalRoutes);
app.use('/proyectos', projectsRoutes);
app.use('/horas', timeRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});




