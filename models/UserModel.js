import { getDbConnection } from '../database/db.js';

export class UserModel {
  // Buscar usuário pelo email
  static async findByEmail(email) {
    const db = await getDbConnection();
    const user = await db.get('SELECT * FROM Cliente WHERE email = ?', [email]);
    return user;
  }

  // Criar usuário (agora com foto opcional)
  static async createUser({ nome, telefone, email, senhaHash, foto = '' }) {
    const db = await getDbConnection();
    await db.run(
      'INSERT INTO Cliente (nome, telefone, email, senha, foto) VALUES (?, ?, ?, ?, ?)',
      [nome, telefone, email, senhaHash, foto]
    );
  }

  // Buscar usuário pelo id
  static async findById(id_cliente) {
    const db = await getDbConnection();
    const user = await db.get('SELECT * FROM Cliente WHERE id_cliente = ?', [id_cliente]);
    return user;
  }

  // Atualizar usuário (agora permite atualizar a foto)
  static async updateUser(id_cliente, { nome, telefone, email, foto }) {
    const db = await getDbConnection();
    const result = await db.run(
      'UPDATE Cliente SET nome = ?, telefone = ?, email = ?, foto = ? WHERE id_cliente = ?',
      [nome, telefone, email, foto, id_cliente]
    );
    return result;
  }
}
