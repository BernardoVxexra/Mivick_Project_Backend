import dotenv from 'dotenv';
import express from 'express';
import {setupDatabase} from './database/schema.js';
import db from './database/db.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();
const port = 3000;

// Middleware
app.use(express.json());

// Inicializa o banco de dados
setupDatabase(db);

// Rotas
app.use('/app/mivick/user', userRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Servidor funcionando corretamente 🚀' });
});


app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
