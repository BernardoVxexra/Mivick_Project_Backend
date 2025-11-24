// utils/send_whatsapp.js
import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendWhatsAppAlert(telefone, alerta) {
  try {
    const { descricao, dispositivo, distancia, impacto, movimentacao } = alerta;

    const messageBody =
      `🚨 *ALERTA DE ACIDENTE DETECTADO!* 🚨\n\n` +
      `📌 Dispositivo: ${dispositivo ?? "N/A"}\n` +
      `📊 Distância: ${distancia ?? "N/A"} m\n` +
      `💥 Impacto: ${impacto ?? "N/A"}\n` +
      `🏃 Movimentação: ${movimentacao ?? "N/A"}\n\n` +
      `📝 Descrição: ${descricao ?? "Sem descrição"}\n\n` +
      `⚠️ Contate o motociclista imediatamente.`;

    const message = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${telefone}`, // telefone no formato +55119...
      body: messageBody
    });

    console.log(`Mensagem enviada para ${telefone}:`, message.sid);
    return true;

  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    return false;
  }
}
