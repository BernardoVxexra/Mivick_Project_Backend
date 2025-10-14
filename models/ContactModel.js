import { getDbConnection } from '../database/db.js';
export class ContactModel {
    
    //Criar contato 
   static async createContact({nome, telefone, email}){
    const db = getDbConnection();
    await db.run(
        'INSERT INTO Contato (nome, telefone, email) VALUES (?,?,?)',
        [nome, telefone, email]
    );
   }

    static async findById(id_contato) {
    const db = await getDbConnection();
    const user = await db.get('SELECT * FROM Contato WHERE id_contato = ?' , [id_contato]);
    return user;
  }

  static async updateContact(id_contato, {nome, telefone, email}){
    const db = getDbConnection;
    const result = await db.run('UPDATE Contato SET nome = ?, telefone = ? WHERE id_contato = ?', [nome, telefone, email, id_contato])
    return result;  
  }
  
  static async deleteContact(id_contato){
    const db = getDbConnection();
    const user = await db.run('DELETE FROM Contato WHERE id_contato = ? ', [id_contato])
    return result;
  }
}