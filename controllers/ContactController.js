import { ContactModel } from "../models/ContactModel.js";

export class ContactController {
    static async create(req, res){
        const {nome, email ,telefone} = req.body;
        const id_cliente = req.user.id_cliente
        await ContactModel.createContact({nome, email, telefone, id_cliente});
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
        console.log(req.body); // 👈 veja o que realmente chega do Postman
        const id_contato = req.params.id;
        const {nome, email, telefone} = req.body;
        await ContactModel.updateContact(id_contato, {nome, email , telefone});
        res.json({message: 'Contato Atualizado'});
    }

    static async delete (req,res){
        const id_contato = req.params.id;
        await ContactModel.deleteContact(id_contato);
        res.json({
            message: 'Contato deletado com sucesso!'
        })
    }

}


