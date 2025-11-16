import { ContactModel } from "../models/ContactModel.js";


// Criação do Controller de Contatos
export class ContactController {
  static async create(req, res) {
    try {
      const { nome, email, telefone, foto } = req.body;
      const id_cliente = req.user.id_cliente;

      await ContactModel.createContact({ nome, email, telefone, foto, id_cliente });

      res.status(201).json({ message: "Contato criado com sucesso" });
    } catch (error) {
      console.error("Erro ao criar contato:", error);
      res.status(500).json({ error: "Erro interno ao criar contato" });
    }
  }

  // Listagem de contatos 
  static async list(req, res) {
    try {
      const id_cliente = req.user.id_cliente;
      const contacts = await ContactModel.findAllByUser(id_cliente);
      res.json({ contacts });
    } catch (error) {
      console.error("Erro ao listar contatos:", error);
      res.status(500).json({ error: "Erro ao listar contatos" });
    }
  }

  // Update Contatos
  static async update(req, res) {
    try {
      const id_contato = req.params.id;
      const { nome, email, telefone, foto } = req.body;

      await ContactModel.updateContact(id_contato, { nome, email, telefone, foto });

      res.json({ message: "Contato atualizado com sucesso" });
    } catch (error) {
      console.error("Erro ao atualizar contato:", error);
      res.status(500).json({ error: "Erro ao atualizar contato" });
    }
  }

  // Deletar contatos
  static async delete(req, res) {
    try {
      const id_contato = req.params.id;
      await ContactModel.deleteContact(id_contato);
      res.json({ message: "Contato deletado com sucesso!" });
    } catch (error) {
      console.error("Erro ao deletar contato:", error);
      res.status(500).json({ error: "Erro ao deletar contato" });
    }
  }
}
