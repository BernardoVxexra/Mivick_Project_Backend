require('dotenv').config();
const express = require('express');
const setupDatabase = require('./config/schema');
const db = require('./config/db');
const app = express();
const port = 3000;


app.use(express.json());

// Inicializa o banco
setupDatabase();


// Criar rotas




app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
