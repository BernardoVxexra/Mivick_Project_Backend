import { getDbConnection } from '../database/db.js';

export class ContactModel {

  // Criar contato
  static async createContact({ nome, telefone, email, foto, id_cliente }) {
    const db = await getDbConnection();
    await db.run(
      'INSERT INTO Contato (nome, telefone, email, foto, id_cliente) VALUES (?, ?, ?, ?, ?)',
      [nome, telefone, email, foto, id_cliente]
    );
  }

  static async findAll() {
    const db = await getDbConnection();
    return await db.all('SELECT * FROM Contato');
  }

  static async findAllByUser(id_cliente) {
    const db = await getDbConnection();
    return await db.all('SELECT * FROM Contato WHERE id_cliente = ?', [id_cliente]);
  }

  static async findById(id_contato) {
    const db = await getDbConnection();
    return await db.get('SELECT * FROM Contato WHERE id_contato = ?', [id_contato]);
  }

  static async updateContact(id_contato, { nome, telefone, email, foto }) {
    const db = await getDbConnection();
    const result = await db.run(
      'UPDATE Contato SET nome = ?, telefone = ?, email = ?, foto = ? WHERE id_contato = ?',
      [nome, telefone, email, foto, id_contato]
    );
    return result;
  }

  static async deleteContact(id_contato) {
    const db = await getDbConnection();
    const result = await db.run('DELETE FROM Contato WHERE id_contato = ?', [id_contato]);
    return result;
  }
}
