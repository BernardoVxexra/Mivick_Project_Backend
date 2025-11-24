// test_twilio.js
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function testWhatsApp() {
  try {
    const message = await client.messages.create({
      from: "whatsapp:+14155238886", // Sandbox do Twilio
      to: "whatsapp:+5511913536175", // SEU NÚMERO EM FORMATO INTERNACIONAL
      body: "🚀 Teste de WhatsApp via Twilio funcionando!"
    });

    console.log("Mensagem enviada! SID:", message.sid);
  } catch (error) {
    console.error("Erro ao enviar:", error.message);
  }
}

testWhatsApp();
