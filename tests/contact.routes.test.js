// tests/contact.routes.test.js
import { jest } from "@jest/globals";
import request from "supertest";

jest.unstable_mockModule("../models/ContactModel.js", () => ({
  ContactModel: {
    createContact: jest.fn(),
    findAllByUser: jest.fn(),
    updateContact: jest.fn(),
    deleteContact: jest.fn()
  }
}));

jest.unstable_mockModule("../middlewares/auth.js", () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id_cliente: 1 };
    next();
  }
}));


const { ContactModel } = await import("../models/ContactModel.js");
const app = (await import("../app.js")).default;

describe("Contact routes (Supertest)", () => {
  beforeAll(() => jest.spyOn(console, "error").mockImplementation(() => {}));
  afterEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  test("POST /app/mivick/contact - criar contato (protegido)", async () => {
    ContactModel.createContact.mockResolvedValue(true);

    const res = await request(app)
      .post("/app/mivick/contact")
      .send({ nome: "João", email: "j@j.com", telefone: "99999" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message", "Contato criado com sucesso");
    expect(ContactModel.createContact).toHaveBeenCalledWith(expect.objectContaining({
      nome: "João", email: "j@j.com", telefone: "99999", id_cliente: 1
    }));
  });

  test("GET /app/mivick/contact - listar", async () => {
    ContactModel.findAllByUser.mockResolvedValue([{ id: 1, nome: "C1" }]);

    const res = await request(app).get("/app/mivick/contact");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("contacts");
    expect(ContactModel.findAllByUser).toHaveBeenCalledWith(1);
  });
});
