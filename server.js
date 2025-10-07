const express = require('express');
const setupDatabase = require('./config/schema');
const db = require('./config/db');

const app = express();
const port = 3000;

app.use(express.json());

// Inicializa o banco
setupDatabase();

app.get('/', (req, res) => {
  res.json({ message: 'API rodando com SQLite!' });
});

// Exemplo de rota: listar clientes
app.get('/clientes', (req, res) => {
  db.all('SELECT * FROM Cliente', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
