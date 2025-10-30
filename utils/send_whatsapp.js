
import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function sendWhatsAppAlert(telefone, descricao) {
  try {
    const message = await client.messages.create({
      from: "whatsapp:+14155238886", // Sandbox Twilio
      to: `whatsapp:${telefone}`,    // Ex: whatsapp:+5511999999999
      body: ` Alerta de acidente detectado! 
Descrição: ${descricao}.
Por favor, entre em contato com o motociclista o mais rápido possível.`
    });

    console.log(` Mensagem enviada para ${telefone}: ${message.sid}`);
  } catch (error) {
    console.error(`Erro ao enviar mensagem para ${telefone}:`, error.message);
  }
}
