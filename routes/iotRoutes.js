import express from 'express';
import { IoTController } from '../controllers/IoTController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/iot/data', authenticateToken, IoTController.handleData);

export default router;
