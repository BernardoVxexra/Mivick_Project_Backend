import { getDbConnection } from './database/db.js';

export class ContactModel {
    static async createContact(nome, telefone, email){
        const db = await getDbConnection();
        await db.run(
            'INSERT INTO Contato (nome, telefone, email) VALUES (? , ? , ?)' , 
            [nome, telefone, email]
        );
    }

}