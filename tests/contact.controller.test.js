import { jest } from "@jest/globals";


jest.unstable_mockModule("../models/ContactModel.js", () => ({
  ContactModel: {
    createContact: jest.fn(),
    findAllByUser: jest.fn(),
    updateContact: jest.fn(),
    deleteContact: jest.fn()
  }
}));

const { ContactModel } = await import("../models/ContactModel.js");
const { ContactController } = await import("../controllers/ContactController.js");

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

// Testes sobre o ContactController
describe("ContactController", () => {

  // Create
  describe("create()", () => {

    test("Deve criar contato com sucesso", async () => {
      ContactModel.createContact.mockResolvedValue(true);

      const req = {
        body: {
          nome: "João",
          email: "j@j.com",
          telefone: "99999",
          foto: null
        },
        user: { id_cliente: 1 }
      };

      const res = mockResponse();

      await ContactController.create(req, res);

      expect(ContactModel.createContact).toHaveBeenCalledWith({
        nome: "João",
        email: "j@j.com",
        telefone: "99999",
        foto: null,
        id_cliente: 1
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Contato criado com sucesso"
      });
    });

    test("Deve retornar erro interno ao criar contato", async () => {
      ContactModel.createContact.mockRejectedValue(new Error("DB error"));

      const req = {
        body: { nome: "A", email: "a@a.com", telefone: "", foto: null },
        user: { id_cliente: 1 }
      };
      const res = mockResponse();

      await ContactController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Erro interno ao criar contato"
      });
    });

  });

  // List
  describe("list()", () => {

    test("Deve listar contatos do usuário", async () => {
      ContactModel.findAllByUser.mockResolvedValue([
        { id: 1, nome: "Contato 1" },
        { id: 2, nome: "Contato 2" }
      ]);

      const req = { user: { id_cliente: 10 } };
      const res = mockResponse();

      await ContactController.list(req, res);

      expect(ContactModel.findAllByUser).toHaveBeenCalledWith(10);
      expect(res.json).toHaveBeenCalledWith({
        contacts: [
          { id: 1, nome: "Contato 1" },
          { id: 2, nome: "Contato 2" }
        ]
      });
    });

    test("Deve retornar erro ao listar contatos", async () => {
      ContactModel.findAllByUser.mockRejectedValue(new Error("DB error"));

      const req = { user: { id_cliente: 10 } };
      const res = mockResponse();

      await ContactController.list(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Erro ao listar contatos"
      });
    });

  });

  // Update
  describe("update()", () => {

    test("Deve atualizar contato com sucesso", async () => {
      ContactModel.updateContact.mockResolvedValue(true);

      const req = {
        params: { id: 5 },
        body: { nome: "Novo", email: "n@n.com", telefone: "98765", foto: null }
      };

      const res = mockResponse();

      await ContactController.update(req, res);

      expect(ContactModel.updateContact).toHaveBeenCalledWith(5, {
        nome: "Novo",
        email: "n@n.com",
        telefone: "98765",
        foto: null
      });

      expect(res.json).toHaveBeenCalledWith({
        message: "Contato atualizado com sucesso"
      });
    });

    test("Deve retornar erro ao atualizar contato", async () => {
      ContactModel.updateContact.mockRejectedValue(new Error("DB error"));

      const req = {
        params: { id: 5 },
        body: { nome: "x", email: "y", telefone: "", foto: null }
      };

      const res = mockResponse();

      await ContactController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Erro ao atualizar contato"
      });
    });

  });

  // Delete
  describe("delete()", () => {

    test("Deve deletar contato com sucesso", async () => {
      ContactModel.deleteContact.mockResolvedValue(true);

      const req = { params: { id: 9 } };
      const res = mockResponse();

      await ContactController.delete(req, res);

      expect(ContactModel.deleteContact).toHaveBeenCalledWith(9);
      expect(res.json).toHaveBeenCalledWith({
        message: "Contato deletado com sucesso!"
      });
    });

    test("Deve retornar erro ao deletar contato", async () => {
      ContactModel.deleteContact.mockRejectedValue(new Error("DB error"));

      const req = { params: { id: 9 } };
      const res = mockResponse();

      await ContactController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Erro ao deletar contato"
      });
    });

  });

});
