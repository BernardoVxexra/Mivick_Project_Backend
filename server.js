import dotenv from 'dotenv';
import express from 'express';
import twilio from "twilio";
import { setupDatabase } from './database/schema.js';
import userRoutes from './routes/userRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import iotRoutes from './routes/iotRoutes.js';
import { error } from './middlewares/error.js';

dotenv.config();




// - - - - - - - - - - - - - - - - - - - - - - - - 


const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Servidor funcionando corretamente ' });
});

// - - - - - - - - - - - - - - - - - - - - - - - - 

// Rotas de usuário
app.use('/app/mivick/user', userRoutes);

// Rotas de contato
app.use('/app/mivick/contact', contactRoutes);

// Rotas de IoT
app.use('/app/mivick/iot', iotRoutes);

app.use(error);

//  - - - - - - - - - - - - - - - - - - - - - - - - 

const client = twilio(
  process.env.TWILIO.ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Rota de teste para enviar SMS
app.post("/send-sms", async (req, res) => {
  try {
    const { to, message } = req.body;

    const msg = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to, // Exemplo: +5511999999999
    });

    res.json({ success: true, sid: msg.sid });
  } catch (error) {
    console.error("Erro ao enviar SMS:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// - - - - - - - - - - - - - - - - - - - - - - - - 

// Inicializa o banco e depois inicia o servidor
const startServer = async () => {
  try {
    await setupDatabase(); 
    console.log(' Banco de dados pronto!');
    
    app.listen(port, () => {
      console.log(` Servidor rodando na porta ${port}`);
    });
  } catch (err) {
    console.error(' Erro ao inicializar o banco de dados:', err);
    process.exit(1); // encerra caso o DB falhe
  }
};

// - - - - - - - - - - - - - - - - - - - - - - - - 

startServer();
