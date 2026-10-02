import { Router } from 'express';
import { verifyAdmin, verifyToken } from '../middlewares/authmiddleware.js';
import { addTime} from '../controllers/timeController.js';
const router = Router()

router.post('/',verifyToken,addTime);

export default router;