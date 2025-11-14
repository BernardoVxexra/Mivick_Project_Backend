// tests/auth.routes.test.js
import { jest } from "@jest/globals";
import request from "supertest";

// 1) mockar modules usados pelos controllers BEFORE importing app
jest.unstable_mockModule("../models/UserModel.js", () => ({
  UserModel: {
    findByEmail: jest.fn(),
    createUser: jest.fn(),
    findById: jest.fn(),
    updateUser: jest.fn()
  }
}));

jest.unstable_mockModule("bcrypt", () => ({
  default: { hash: jest.fn(), compare: jest.fn() }
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: { sign: jest.fn() }
}));

// opcional: se seus controllers usam validators importados
jest.unstable_mockModule("../utils/Validators/validators.js", () => ({
  validarEmail: jest.fn(),
  validarSenha: jest.fn()
}));

// 2) agora importar módulos (após mocks)
const { UserModel } = await import("../models/UserModel.js");
const bcrypt = (await import("bcrypt")).default;
const jwt = (await import("jsonwebtoken")).default;
const { validarEmail, validarSenha } = await import("../utils/Validators/validators.js");
const app = (await import("../app.js")).default;

describe("Auth routes (Supertest)", () => {
  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  test("POST /app/mivick/auth/register - validação de email deve falhar", async () => {
    validarEmail.mockReturnValue(false);

    const res = await request(app)
      .post("/app/mivick/auth/register")
      .send({ nome: "X", email: "invalid", senha: "Senha123!" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("POST /app/mivick/auth/register - sucesso", async () => {
    validarEmail.mockReturnValue(true);
    validarSenha.mockReturnValue(true);
    UserModel.findByEmail.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashed");
    UserModel.createUser.mockResolvedValue(true);

    const res = await request(app)
      .post("/app/mivick/auth/register")
      .send({ nome: "Bernardo", email: "b@b.com", senha: "Senha123!" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message", "Usuário cadastrado com sucesso");
    expect(UserModel.createUser).toHaveBeenCalled();
  });

  test("POST /app/mivick/auth/login - sucesso", async () => {
    UserModel.findByEmail.mockResolvedValue({ id_cliente: 1, email: "b@b.com", senha: "hash" });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("token123");

    const res = await request(app)
      .post("/app/mivick/auth/login")
      .send({ email: "b@b.com", senha: "Senha123!" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token", "token123");
    expect(res.body).toHaveProperty("user");
  });
});
