import { getDbConnection } from './database/db.js';

export class UserModel {
    static async createUser(name, email, password) {
        const db = await getDbConnection();
        await db.run(
            'INSERT INTO Cliente (nome, telefone, email, senha) VALUES (?, ?, ?, ?)',
            [name, telefone, email, password]
        );
    }

    static async findByEmail(email) {
        const db = await getDbConnection();
        return db.get(`SELECT * FROM Cliente WHERE email = ?`, [email]);
    }

    static async findById(id_cliente) {
        const db = await getDbConnection();
        return db.get(`SELECT * FROM Cliente WHERE id_cliente = ?`, [id_cliente]);
    }

    static async updateUser(id_cliente, {nome, telefone, email}) {
        const db = await getDbConnection();
        await db.run(
            `UPDATE Cliente SET nome = ?, telefone = ?, email = ? WHERE id_cliente = ?`,
            [nome, telefone, email, id_cliente] 
        )
    }


}