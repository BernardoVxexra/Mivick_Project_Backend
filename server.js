import dotenv from 'dotenv';
import express from 'express';
import { setupDatabase } from './database/schema.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Servidor funcionando corretamente 🚀' });
});

// Rotas de usuário
app.use('/app/mivick/user', userRoutes);

// Inicializa o banco e depois inicia o servidor
const startServer = async () => {
  try {
    await setupDatabase(); 
    console.log('📦 Banco de dados pronto!');
    
    app.listen(port, () => {
      console.log(`🚀 Servidor rodando na porta ${port}`);
    });
  } catch (err) {
    console.error('❌ Erro ao inicializar o banco de dados:', err);
    process.exit(1); // encerra caso o DB falhe
  }
};

startServer();
