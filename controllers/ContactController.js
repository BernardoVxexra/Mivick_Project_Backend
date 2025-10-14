import { ContactModel } from "../models/ContactModel";

export class ContactController {
    static async create(req, res){
        const {nome, email , telefone} = req.body;
        const id_cliente = req.user.id_cliente
        await ContactModel.create({nome, email, telefone, id_cliente});
        res.status(201).json({
            message: 'Contato criado com sucesso'
        });
    }

    static async list(req, res){
        const id_cliente = req.user.id_cliente;
        const contacts = await ContactModel.findAllByUser(id_cliente);
        res.json({ contacts });
    }

    static async update(req,res) {
        const id_contato = req.params.id;
        const {nome, email, telefone} = req.body;
        await ContactModel.update(id_contato, {nome, email , telefone});
        res.json({message: 'Contato Atualizado'});
    }

    static async delete (req,res){
        const id_contato = req.params.id;
        await ContactModel.delete(id_contato);
        res.json({
            message: 'Contato deletado com sucesso!'
        })
    }

}