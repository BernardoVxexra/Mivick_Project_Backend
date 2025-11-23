import { getDbConnection } from './db.js';

export async function setupDatabase() {
  const db = await getDbConnection();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS Cliente (
      id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      telefone TEXT,
      email TEXT UNIQUE,
      senha TEXT,
      foto TEXT DEFAULT NULL
    );
  `);

    await db.exec(`
    CREATE TABLE IF NOT EXISTS Dispositivo (
      id_dispositivo INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      condicao TEXT,
      id_cliente INTEGER,
      FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente)
    );
  `);

 await db.exec(`
    CREATE TABLE IF NOT EXISTS Leitura (
      id_leitura INTEGER PRIMARY KEY AUTOINCREMENT,
      data_hora TEXT,
      distancia REAL,
      impacto REAL,
      movimentacao TEXT,
      acidente_identificado BOOLEAN,
      id_dispositivo INTEGER,
      FOREIGN KEY (id_dispositivo) REFERENCES Dispositivo(id_dispositivo)
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS Foto (
      id_image INTEGER PRIMARY KEY AUTOINCREMENT,
      image BLOB,
      data_hora TEXT,
      id_leitura INTEGER,
      FOREIGN KEY (id_leitura) REFERENCES Leitura(id_leitura)
    );
  `);

   await db.exec(`
    CREATE TABLE IF NOT EXISTS LogBLE (
      id_log INTEGER PRIMARY KEY AUTOINCREMENT,
      mensagem TEXT,
      data_hora TEXT,
      id_dispositivo INTEGER,
      FOREIGN KEY (id_dispositivo) REFERENCES Dispositivo(id_dispositivo)
    );
  `);

   await db.exec(`
    CREATE TABLE IF NOT EXISTS LogWS (
      id_log INTEGER PRIMARY KEY AUTOINCREMENT,
      mensagem TEXT,
      data_hora TEXT,
      id_dispositivo INTEGER,
      FOREIGN KEY (id_dispositivo) REFERENCES Dispositivo(id_dispositivo)
    );
  `);

    await db.exec(`
    CREATE TABLE IF NOT EXISTS WifiEnvio (
      id_envio INTEGER PRIMARY KEY AUTOINCREMENT,
      ssid TEXT,
      senha TEXT,
      data_hora TEXT,
      id_dispositivo INTEGER,
      FOREIGN KEY (id_dispositivo) REFERENCES Dispositivo(id_dispositivo)
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS Contato (
      id_contato INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      telefone TEXT,
      email TEXT,
      foto TEXT DEFAULT NULL,
      id_cliente INTEGER,
      FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente)
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS Alerta (
  id_alerta INTEGER PRIMARY KEY AUTOINCREMENT,
  descricao TEXT,
  codigo TEXT,
  data_hora TEXT,
  id_contato INTEGER,
  id_leitura INTEGER,
  FOREIGN KEY (id_contato) REFERENCES Contato(id_contato)
  -- note: constraint FK para id_leitura pode ser adicionada se recriar tabela
);

  `);
await db.exec(`
  CREATE TABLE IF NOT EXISTS VeiculoDetectado (
    id_detect INTEGER PRIMARY KEY AUTOINCREMENT,
    id_leitura INTEGER,
    id_alerta INTEGER,
    qtd_veiculos INTEGER,
    data_hora TEXT,
    FOREIGN KEY (id_leitura) REFERENCES Leitura(id_leitura),
    FOREIGN KEY (id_alerta) REFERENCES Alerta(id_alerta)
  );
`);

  console.log('✅ Banco de dados configurado com sucesso!');
}


