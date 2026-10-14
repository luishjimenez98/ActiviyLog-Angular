import { Router } from 'express';
import { verifyAdmin, verifyToken } from '../middlewares/authmiddleware.js';
import { createProject, getProject, joinProject, getProjectPersonal,updateProject } from '../controllers/projectController.js';
const router = Router()

router.post('/crear',verifyAdmin,createProject);
router.post('/', verifyToken, getProject);
router.post('/unirse',verifyToken, joinProject);
router.get('/personal',verifyToken,getProjectPersonal);
router.put('/actualizar',verifyAdmin,updateProject)

export default router;

