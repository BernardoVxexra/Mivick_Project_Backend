import { getDbConnection } from './database/db.js';

export class ContactModel {
    
    static async createContact(nome, telefone, email){
        const db = await getDbConnection();
        await db.run(
            'INSERT INTO Contato (nome, telefone, email) VALUES (? , ? , ?)' , 
            [nome, telefone, email]
        );
    }

    static async findByName(nome){
        const db = await getDbConnection();
        return db.get('SELECT * FROM Contato WHERE nome = ?', [nome])
    }

    static async updateByContact(id_contato, nome, telefone, email){
        const db = await getDbConnection();
        await db.run(
            'UPDATE Contato SET nome = ?, telefone = ?, email = ? WHERE id_contato = ?',
            [nome, telefone , email, id_contato]
        )
    }

    static async deleteByContact(id_contato){
        const db = await getDbConnection();
        await db.run('DELETE FROM Contato WHERE id_contato = ?', [id_contato]);
    }
}