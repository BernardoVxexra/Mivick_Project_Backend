import { getDbConnection }  from "../database/db";

export class IoTModel {
    
    // Método criar dispositivo (Vinculado a um cliente)
    static async createDispositivo({nome, id_cliente}) {
        const db = await getDbConnection();
        await db.run(
            'INSERT INTO Dispositivo (nome, id_cliente) VALUES (?, ?)',
            [nome, id_cliente]
        );
    }

    // Buscar todos os dispositivos de um cliente
    static async findDispositivosByCliente(id_cliente){
        const db = await getDbConnection();
        return await db.all('SELECT * FROM Dispositivo WHERE id_cliente = ?', [id_cliente]);
    }

     static async updateDevice(id_dispositivo, condicao) {
     const db = await getDbConnection();
     await db.run('UPDATE Dispositivo SET condicao = ? WHERE id_dispositivo = ?', [condicao, id_dispositivo]);
  }

  //Registra nova leitura do sensor 

  static async createLeitura({id_dispositivo, distancia, impacto, movimentacao, acidente_identificado}){
    const db = await getDbConnection();
    await db.run(
      'INSERT INTO Leitura (id_dispositivo, distancia, impacto, movimentacao, acidente_identificado) VALUES (?, ?, ?, ?, ?)',
      [id_dispositivo, distancia, impacto, movimentacao, acidente_identificado]
    );
  }

  // Para buscar todas as leituras de um dispositivo

  static async findLeiturasByDispositivo(id_dispositivo){
    const db = await getDbConnection();
    return await db.all('SELECT * FROM Leitura WHERE id_dispositivo = ?', [id_dispositivo]);

  }


  // Criando os alertas 

  static async createAlerta({descricao, codigo, id_contato}){
    const db = await getDbConnection();
    await db.run(
      'INSERT INTO Alerta (descricao, codigo, id_contato) VALUES (?, ?, ?)',
      [descricao, codigo, id_contato]
    );
  }

 static async createFoto({ imageBuffer, data_hora, id_leitura }) {
    const db = await getDbConnection();
    await db.run(`
      INSERT INTO Foto (image, data_hora, id_leitura)
      VALUES (?, ?, ?)
    `, [imageBuffer, data_hora, id_leitura]);
  }


   // Busca todos os alertas de um cliente (via join com contatos)
  static async findAlertasByClient(id_cliente) {
    const db = await getDbConnection();
    return await db.all(`
      SELECT a.id_alerta, a.descricao, a.codigo, c.nome AS contato_nome, c.email, c.telefone
      FROM Alerta a
      JOIN Contato c ON a.id_contato = c.id_contato
      WHERE c.id_cliente = ?
    `, [id_cliente]);
  }
}
