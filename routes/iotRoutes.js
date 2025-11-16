import express from "express";
import { IoTController } from "../controllers/IoTController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/leituras", authenticateToken, IoTController.receiveData);
router.post("/registrar-dispositivo", authenticateToken, IoTController.registrarDispositivo);
router.get("/wifi/:id_dispositivo", authenticateToken, IoTController.listarWifi);

export default router;
