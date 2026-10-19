import { Router } from 'express';
import { verifyAdmin, verifyToken } from '../middlewares/authmiddleware.js';
import { createProject, getProject, joinProject, getProjectPersonal,updateProject,getEstados } from '../controllers/projectController.js';
const router = Router()

router.post('/crear',verifyAdmin,createProject);
router.post('/', verifyToken, getProject);
router.post('/unirse',verifyToken, joinProject);
router.post('/personal',verifyToken,getProjectPersonal);
router.put('/actualizar',verifyAdmin,updateProject);
router.get('/estados', getEstados);

export default router;

