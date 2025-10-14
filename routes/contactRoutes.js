import express from 'express';
import {ContactControlle } from '../controllers/ContactController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Todas as rotas protegidas
router.post('/', authenticateToken, ContactController.create);
router.get('/', authenticateToken, ContactController.list);
router.patch('/:id', authenticateToken, ContactController.update);
router.delete('/:id', authenticateToken, ContactController.delete);

export default router;
