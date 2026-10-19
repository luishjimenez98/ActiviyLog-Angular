import { Router } from 'express';
import { verifyAdmin } from '../middlewares/authmiddleware.js';
import { getPersonal,createPersonal, getPersonalProject, getPermisos,crearPermisos } from '../controllers/personalController.js';

const router = Router();

// Ruta exclusiva de Administrador para crear usuarios
router.post('/', verifyAdmin, createPersonal);

router.get('/', verifyAdmin, getPersonal);
router.post('/proyecto',verifyAdmin, getPersonalProject);
router.get('/permisos',getPermisos);
router.post('/permisos',crearPermisos)
export default router;