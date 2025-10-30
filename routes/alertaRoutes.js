// routes/alerta.js
import express from "express";
import IoTModel from "../models/IoTModel.js";
import ContactModel from "../models/ContactModel.js";
import { sendWhatsAppAlert } from "../utils/twilioService.js";

const router = express.Router();

router.post("/alerta", async (req, res) => {
  try {
    const { descricao, codigo, id_contato } = req.body;

    // 1. Cria o alerta no banco
    await IoTModel.createAlerta({ descricao, codigo, id_contato });

    // 2. Busca todos os contatos cadastrados
    const contatos = await ContatoModel.findAllByUser();

    // 3. Envia alerta via Twilio
    for (const contato of contatos) {
      await sendWhatsAppAlert(contato.telefone, descricao);
    }

    res.json({ success: true, message: "Alerta criado e mensagens enviadas!" });
  } catch (error) {
    console.error("Erro ao criar alerta:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
