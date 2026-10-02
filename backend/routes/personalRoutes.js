import { Router } from 'express';
import { createPersonal } from '../controllers/personalController.js';
import { verifyAdmin } from '../middlewares/authmiddleware.js';
import { getPersonal } from '../controllers/personalController.js';

const router = Router();

// Ruta exclusiva de Administrador para crear usuarios
router.post('/', verifyAdmin, createPersonal);

router.get('/',getPersonal);

export default router;