import { Router } from 'express';
import { verifyAdmin, verifyToken } from '../middlewares/authmiddleware.js';
import { createProject, getProject, joinProject, getProjectPersonal } from '../controllers/projectController.js';
const router = Router()

router.post('/proyectos',verifyAdmin,createProject);
router.get('/proyectos', getProject);
router.post('/proyectos/unirse',verifyToken, joinProject);
router.get('/proyectos-personales',verifyToken,getProjectPersonal);

export default router;

