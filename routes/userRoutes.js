import express from 'express';
import { AuthUser } from '../controllers/UserController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import { lockGoogleEmail} from '../middlewares/lockGoogleEmail.js';
import { validateUpdate } from '../middlewares/validateUpdate.js';

const router = express.Router();

router.post('/register', AuthUser.register);
router.post('/login', AuthUser.login);

// Rotas protegidas
router.get('/profile', authenticateToken, AuthUser.profile);
router.put(
    '/profile',
    authenticateToken,
    upload.single('foto'),
    lockGoogleEmail,
    validateUpdate,
    AuthUser.update
);


export default router;


