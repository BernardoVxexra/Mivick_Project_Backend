import whatsappClient from "../whatsapp/whatsappClient.js";

export async function sendWhatsAppAlert(telefone, msg) {
    const phone = "55" + telefone.replace(/\D/g, "");

    try {
        await whatsappClient.sendMessage(`${phone}@c.us`, msg);
        console.log("📨 Mensagem enviada para:", phone);
    } catch (err) {
        console.error("❌ Erro ao enviar WhatsApp:", err);
    }
}
