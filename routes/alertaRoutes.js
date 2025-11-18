// routes/alertaRoutes.js
import express from "express";
import { AlertaController } from "../controllers/AlertaController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/enviar", authenticateToken, AlertaController.enviarAlerta);

export default router;
