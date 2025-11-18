
import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function sendWhatsAppAlert(telefone, alerta) {

  try {
    const { descricao, dispositivo, distancia, impacto, movimentacao } = alerta;

    const messageBody = 
      `🚨 *ALERTA DE ACIDENTE DETECTADO!* 🚨\n\n` +
      `📌 Dispositivo: ${dispositivo}\n` +
      `📊 Distância: ${distancia ?? "N/A"} m\n` +
      `💥 Impacto: ${impacto ?? "N/A"}\n` +
      `🏃 Movimentação: ${movimentacao ?? "N/A"}\n\n` +
      `Descrição: ${descricao}\n` +
      `Por favor, entre em contato com o motociclista o mais rápido possível.`;

    const message = await client.messages.create({
      from: "whatsapp:+14155238886",
      to: `whatsapp:${telefone}`,
      body: messageBody
    });

    console.log(`Mensagem enviada para ${telefone}: ${message.sid}`);
  } catch (error) {
    console.error(`Erro ao enviar mensagem para ${telefone}:`, error.message);
  }
}

