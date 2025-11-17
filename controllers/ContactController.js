import { ContactModel } from "../models/ContactModel.js";

export class ContactController {

  // Criar contato
  static async create(req, res) {
    try {
      const { nome, email, telefone } = req.body;
      const id_cliente = req.user.id_cliente;

      // Foto enviada pelo multer
      const foto = req.file ? `/uploads/${req.file.filename}` : null;

      await ContactModel.createContact({
        nome,
        email,
        telefone,
        foto,
        id_cliente
      });

      res.status(201).json({ message: "Contato criado com sucesso" });

    } catch (error) {
      console.error("Erro ao criar contato:", error);
      res.status(500).json({ error: "Erro interno ao criar contato" });
    }
  }

  // Listar contatos
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

  // Atualizar contato
  static async update(req, res) {
    try {
      const id_contato = req.params.id;
      const { nome, email, telefone } = req.body;

      // Se o usuário enviar nova foto
      const foto = req.file ? `/uploads/${req.file.filename}` : null;

      await ContactModel.updateContact(
        id_contato,
        { nome, email, telefone, foto }
      );

      res.json({ message: "Contato atualizado com sucesso" });

    } catch (error) {
      console.error("Erro ao atualizar contato:", error);
      res.status(500).json({ error: "Erro ao atualizar contato" });
    }
  }

  // Deletar contato
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
