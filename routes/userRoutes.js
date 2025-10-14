import express from 'express';
import { AuthUser } from '../controllers/UserController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', AuthUser.register);
router.post('/login', AuthUser.login);

// 🔒 rota protegida
router.get('/profile', authenticateToken, AuthUser.profile);

export default router;
