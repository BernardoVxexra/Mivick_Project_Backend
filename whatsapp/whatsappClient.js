// whatsapp/whatsappClient.js
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from "qrcode-terminal";

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    }
});

client.on("qr", (qr) => {
    console.log("📲 Escaneie o QR code abaixo para conectar:");
    qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
    console.log("✅ WhatsApp conectado e pronto para uso!");
});

client.on("auth_failure", () => {
    console.log("❌ Falha de autenticação! Escaneie o QR novamente.");
});

client.on("disconnected", () => {
    console.log("⚠ WhatsApp desconectado, reiniciando...");
    client.initialize();
});

client.initialize();

export default client;
