import express from 'express';
import { ContactController } from '../controllers/ContactController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

// Criar contato com foto
router.post(
    '/',
    authenticateToken,
    upload.single('foto'),
    ContactController.create
);

// Listar contatos do usuário logado
router.get(
    '/',
    authenticateToken,
    ContactController.list
);

// Atualizar contato com foto
router.put(
    '/:id',
    authenticateToken,
    upload.single('foto'),
    ContactController.update
);

// Deletar contato
router.delete(
    '/:id',
    authenticateToken,
    ContactController.delete
);


export default router;
