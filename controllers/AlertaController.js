// controllers/AlertaController.js
import { IoTModel } from "../models/IoTModel.js";
import { sendWhatsAppAlert } from "../utils/send_whatsapp.js";
import { getDbConnection } from "../database/db.js";

export class AlertaController {
  static async enviarAlerta(req, res) {
    try {
      const { id_dispositivo, descricao, codigo } = req.body;
      if (!id_dispositivo || !descricao) {
        return res.status(400).json({ error: "id_dispositivo e descricao são obrigatórios" });
      }

      const db = await getDbConnection();

      // Pega o cliente do dispositivo
      const dispositivo = await db.get(
        `SELECT id_cliente FROM Dispositivo WHERE id_dispositivo = ?`,
        [id_dispositivo]
      );
      if (!dispositivo) return res.status(404).json({ error: "Dispositivo não encontrado" });

      // Pega todos os contatos do cliente
      const contatos = await IoTModel.getContatosByCliente(dispositivo.id_cliente);

      // Cria alerta para cada contato e envia via Twilio
      for (const contato of contatos) {
        await IoTModel.createAlerta({ descricao, codigo, id_contato: contato.id_contato });
        await sendWhatsAppAlert(contato.telefone, {
          descricao: "",
          dispositivo: "",
          distancia: 2.5,
          impacto: 7.8,
          movimentacao: 0.0
        });
      }

      return res.json({ success: true, message: "Alerta enviado para todos os contatos!" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao enviar alerta" });
    }
  }
}
