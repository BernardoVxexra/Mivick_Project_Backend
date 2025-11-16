import { getDbConnection } from "../database/db.js";

export class IoTModel {

  static async createLeitura({ id_dispositivo, distancia, impacto, movimentacao, acidente_identificado }) {
    const db = await getDbConnection();
    await db.run(`
      INSERT INTO Leitura (data_hora, distancia, impacto, movimentacao, acidente_identificado, id_dispositivo)
      VALUES (datetime('now'), ?, ?, ?, ?, ?)
    `, [distancia, impacto, movimentacao, acidente_identificado, id_dispositivo]);
  }

  static async createFoto({ imageBuffer, id_leitura }) {
    const db = await getDbConnection();
    await db.run(`
      INSERT INTO Foto (image, data_hora, id_leitura)
      VALUES (?, datetime('now'), ?)
    `, [imageBuffer, id_leitura]);
  }

  static async saveBLELog({ mensagem, id_dispositivo }) {
    const db = await getDbConnection();
    await db.run(`
      INSERT INTO LogBLE (mensagem, data_hora, id_dispositivo)
      VALUES (?, datetime('now'), ?)
    `, [mensagem, id_dispositivo]);
  }

  static async saveWSLog({ mensagem, id_dispositivo }) {
    const db = await getDbConnection();
    await db.run(`
      INSERT INTO LogWS (mensagem, data_hora, id_dispositivo)
      VALUES (?, datetime('now'), ?)
    `, [mensagem, id_dispositivo]);
  }

  static async saveWifiEnvio({ ssid, senha, id_dispositivo }) {
  const db = await getDbConnection();

  // VERIFICAR SE JÁ EXISTE
  const existe = await db.get(
    `SELECT id_envio FROM WifiEnvio
     WHERE ssid = ? AND senha = ? AND id_dispositivo = ?`,
    [ssid, senha, id_dispositivo]
  );

  if (existe) {
    console.log("⚠️ Wi-Fi já existe, não salvando novamente.");
    return;
  }

  // SALVAR SE NÃO EXISTE
  await db.run(
    `INSERT INTO WifiEnvio (ssid, senha, data_hora, id_dispositivo)
     VALUES (?, ?, datetime('now'), ?)`,
    [ssid, senha, id_dispositivo]
  );
}

  static async getLastLeitura(id_dispositivo) {
    const db = await getDbConnection();
    return db.get(`
      SELECT * FROM Leitura
      WHERE id_dispositivo = ?
      ORDER BY id_leitura DESC LIMIT 1
    `, [id_dispositivo]);
  }
  static async getWifiList(id_dispositivo) {
  const db = await getDbConnection();
  return db.all(
    "SELECT ssid, senha FROM WifiEnvio WHERE id_dispositivo = ? ORDER BY id_envio DESC LIMIT 5",
    [id_dispositivo]
  );
}

}
