import express from 'express';
import { AuthUser } from '../controllers/UserController.js';

const router = express.Router();

// Rota de cadastro
router.post('/register', AuthUser.register);

// Rota de login
router.post('/login', AuthUser.login);

// Rota de perfiç
router.get('/profile', AuthUser.profile);

export default router;
