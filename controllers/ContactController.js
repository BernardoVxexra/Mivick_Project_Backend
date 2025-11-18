import { ContactModel } from "../models/ContactModel.js";

export class ContactController {

  // Criar contato
  static async create(req, res) {
    try {
      const { nome, email, telefone } = req.body;
      const id_cliente = req.user.id_cliente;

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

  

  static async getOne(req, res) {
  try {
    const id_contato = req.params.id;
    const contact = await ContactModel.findById(id_contato);

    if (!contact) {
      return res.status(404).json({ error: "Contato não encontrado" });
    }

    res.json({ contact });
  } catch (error) {
    console.error("Erro ao buscar contato:", error);
    res.status(500).json({ error: "Erro interno ao buscar contato" });
  }
}


  // Atualizar contato
  static async update(req, res) {
    try {
      const id_contato = req.params.id;
      const { nome, email, telefone } = req.body;

      // Foto somente se realmente houver upload
      const novaFoto = req.file ? `/uploads/${req.file.filename}` : undefined;

      await ContactModel.updateContact(id_contato, {
        nome,
        email,
        telefone,
        foto: novaFoto
      });

      res.json({ message: "Contato atualizado com sucesso" });

    } catch (error) {
      console.error("Erro ao atualizar contato:", error);
      res.status(500).json({ error: "Erro ao atualizar contato" });
    }
  }

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
