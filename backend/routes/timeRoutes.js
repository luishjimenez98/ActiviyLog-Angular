import { Router } from 'express';
import { verifyAdmin, verifyToken } from '../middlewares/authmiddleware.js';
import { addTime, getHorasPersonalProyecto} from '../controllers/timeController.js';
const router = Router()

router.post('/',verifyToken,addTime);

router.post('/personal/proyecto',verifyToken,getHorasPersonalProyecto)
export default router;