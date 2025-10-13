import  getDbConnection  from './db.js';

export function setupDatabase() {
  const db = getDbConnection();


  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS Cliente (
        id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        telefone TEXT,
        email TEXT UNIQUE,
        senha TEXT NOT NULL
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS Dispositivo (
        id_dispositivo INTEGER PRIMARY KEY AUTOINCREMENT,
        condicao TEXT,
        id_cliente INTEGER,
        FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente)
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS Leitura (
        id_leitura INTEGER PRIMARY KEY AUTOINCREMENT,
        data_hora TEXT,
        distancia REAL,
        impacto REAL,
        movimentacao REAL,
        acidente_identificado BOOLEAN,
        id_dispositivo INTEGER,
        FOREIGN KEY (id_dispositivo) REFERENCES Dispositivo(id_dispositivo)
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS Foto (
        id_image INTEGER PRIMARY KEY AUTOINCREMENT,
        image BLOB,
        data_hora TEXT,
        id_leitura INTEGER,
        FOREIGN KEY (id_leitura) REFERENCES Leitura(id_leitura)
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS Contato (
        id_contato INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        telefone TEXT,
        email TEXT,
        id_cliente INTEGER,
        FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente)
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS Alerta (
        id_alerta INTEGER PRIMARY KEY AUTOINCREMENT,
        descricao TEXT,
        codigo TEXT,
        id_contato INTEGER,
        FOREIGN KEY (id_contato) REFERENCES Contato(id_contato)
      );
    `);

    console.log('✅ Banco de dados configurado com sucesso!');
  });
}
