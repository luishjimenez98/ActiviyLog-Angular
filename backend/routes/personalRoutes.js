import { Router } from 'express';
import { verifyAdmin,verifyToken } from '../middlewares/authmiddleware.js';
import { getPersonal,createPersonal, getPersonalProject, getPermisos,crearPermisos,getPersonalProyectoPermisos,updatePermisosPersonal } from '../controllers/personalController.js';

const router = Router();

// Ruta exclusiva de Administrador para crear usuarios
router.post('/', verifyAdmin, createPersonal);

router.get('/', verifyAdmin, getPersonal);
router.post('/proyecto',verifyToken, getPersonalProject);
router.get('/permisos',verifyToken,getPermisos);
router.post('/proyecto/permisos',verifyAdmin,getPersonalProyectoPermisos);
router.post('/proyecto/permisos/actualizar', verifyAdmin,updatePermisosPersonal)
export default router;