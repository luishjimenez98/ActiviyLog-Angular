import { Router } from 'express';
import { login } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/authmiddleware.js';

const router = Router();

router.post('/login', login);


// Retorna los datos del usuario autenticado según su token
router.get('/auth/me', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

export default router;