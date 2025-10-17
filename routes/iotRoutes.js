import express from 'express';
import { IoTController } from '../controllers/IoTController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Dispositivo IoT envia leitura (pode ser autenticado por token do dispositivo)
router.post("/leituras", authenticateToken, IoTController.receiveData);

export default router;
