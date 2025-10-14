import { getDbConnection } from '../database/db.js';

export class UserModel {
  static async findByEmail(email) {
    const db = await getDbConnection();
    const user = await db.get('SELECT * FROM Cliente WHERE email = ?', [email]);
    return user;
  }

  static async createUser({ nome, telefone, email, senhaHash }) {
    const db = await getDbConnection();
    await db.run(
      'INSERT INTO Cliente (nome, telefone, email, senha) VALUES (?, ?, ?, ?)',
      [nome, telefone, email, senhaHash]
    );
  }

  static async findById(id_cliente) {
    const db = await getDbConnection();
    const user = await db.get('SELECT * FROM Cliente WHERE id_cliente = ?' , [id_cliente]);
    return user;
  }

  static async updateUser(id_cliente, {nome, telefone, email}){
    const db = await getDbConnection();
    const result = await db.run('UPDATE Cliente SET nome = ?, telefone = ?, email = ? WHERE id_cliente = ? ', [nome, telefone, email, id_cliente])
    return result;
  }
}
