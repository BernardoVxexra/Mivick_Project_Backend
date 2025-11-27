import { getDbConnection } from "../database/db.js";
import whatsappClient from "../whatsapp/whatsappClient.js";

export class AlertaController {
  static async enviarAlerta(req, res) {
    try {
      const { tipo, intensidade, latitude, longitude } = req.body;
      const id_cliente = req.user.id_cliente;

      const db = await getDbConnection();

      // 1️⃣ Registrar alerta no banco (SQLite usa .run)
      await db.run(
        "INSERT INTO Alerta (id_cliente, tipo, intensidade, latitude, longitude) VALUES (?, ?, ?, ?, ?)",
        [id_cliente, tipo, intensidade, latitude, longitude]
      );

      // 2️⃣ Buscar contatos vinculados ao cliente (SQLite usa .all)
      const contatos = await db.all(
        "SELECT nome, telefone FROM Contato WHERE id_cliente = ?",
        [id_cliente]
      );

      // 3️⃣ Mensagem de alerta
      const msg = `🚨 *ALERTA DE ACIDENTE DETECTADO*\n\n` +
                  `Tipo: ${tipo}\n` +
                  `Intensidade: ${intensidade}\n` +
                  `Localização: https://maps.google.com/?q=${latitude},${longitude}\n\n` +
                  `Envio automático pelo sistema Mivick.`;

      // 4️⃣ Enviar via WhatsApp
      for (const contato of contatos) {
        await whatsappClient.sendMessage(
          contato.telefone.replace(/\D/g, "") + "@c.us",
          msg
        );
      }

      res.json({ ok: true, message: "Alerta criado e enviado via WhatsApp." });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro ao enviar alerta." });
    }
  }
}
