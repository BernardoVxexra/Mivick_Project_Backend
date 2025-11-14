import { jest } from "@jest/globals";

jest.unstable_mockModule("../models/UserModel.js", () => ({
  UserModel: {
    findByEmail: jest.fn(),
    createUser: jest.fn(),
    findById: jest.fn(),
    updateUser: jest.fn()
  }
}));

jest.unstable_mockModule("bcrypt", () => ({
  default: {
    hash: jest.fn(),
    compare: jest.fn()
  }
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign: jest.fn()
  }
}));

jest.unstable_mockModule("../utils/Validators/validators.js", () => ({
  validarEmail: jest.fn(),
  validarSenha: jest.fn()
}));


const { UserModel } = await import("../models/UserModel.js");
const bcrypt = (await import("bcrypt")).default;
const jwt = (await import("jsonwebtoken")).default;

const { validarEmail, validarSenha } = await import("../utils/Validators/validators.js");
const { AuthUser } = await import("../controllers/UserController.js");

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}


// Teste de AuthUsewr


describe("AuthUser Controller", () => {

  //Teste do Register
  describe("register()", () => {

    test("Deve retornar erro se o email for inválido", async () => {
      validarEmail.mockReturnValue(false);

      const req = { body: { email: "aaaa", senha: "Senha123!", nome: "bernardo" } };
      const res = mockResponse();

      await AuthUser.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "E-mail inválido. Ex: usuario@email.com"
      });
    });

    test("Deve retornar erro se a senha for inválida", async () => {
      validarEmail.mockReturnValue(true);
      validarSenha.mockReturnValue(false);

      const req = { body: { email: "a@a.com", senha: "123", nome: "bernardo" } };
      const res = mockResponse();

      await AuthUser.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Senha fraca. A senha deve conter no mínimo 8 caracteres, incluindo letra maiúscula, minúscula, número e caractere especial."
      });
    });

    test("Deve retornar erro se o email já existir", async () => {
      validarEmail.mockReturnValue(true);
      validarSenha.mockReturnValue(true);
      UserModel.findByEmail.mockResolvedValue({ id_cliente: 1 });

      const req = { body: { email: "a@a.com", senha: "Senha123!", nome: "bernardo" } };
      const res = mockResponse();

      await AuthUser.register(req, res);

      expect(UserModel.findByEmail).toHaveBeenCalledWith("a@a.com");
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Email já cadastrado" });
    });

    test("Deve cadastrar usuário com sucesso", async () => {
      validarEmail.mockReturnValue(true);
      validarSenha.mockReturnValue(true);

      UserModel.findByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("senhaHash");
      UserModel.createUser.mockResolvedValue(true);

      const req = {
        body: {
          email: "a@a.com",
          senha: "Senha123!",
          nome: "bernardo",
          telefone: "9999",
          foto: null
        }
      };

      const res = mockResponse();

      await AuthUser.register(req, res);

      expect(bcrypt.hash).toHaveBeenCalled();
      expect(UserModel.createUser).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Usuário cadastrado com sucesso"
      });
    });

  });

  // Teste de login
  describe("login()", () => {

    test("Deve retornar erro se o usuário não existir", async () => {
      UserModel.findByEmail.mockResolvedValue(null);

      const req = { body: { email: "a@a.com", senha: "123" } };
      const res = mockResponse();

      await AuthUser.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Usuário não encontrado"
      });
    });

    test("Deve retornar erro se a senha estiver errada", async () => {
      UserModel.findByEmail.mockResolvedValue({ email: "a@a.com", senha: "hash123" });
      bcrypt.compare.mockResolvedValue(false);

      const req = { body: { email: "a@a.com", senha: "123" } };
      const res = mockResponse();

      await AuthUser.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Senha Incorreta"
      });
    });

    test("Deve fazer login com sucesso", async () => {
      UserModel.findByEmail.mockResolvedValue({
        id_cliente: 1,
        email: "a@a.com",
        senha: "hash123"
      });

      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("fake_token");

      const req = { body: { email: "a@a.com", senha: "Senha123!" } };
      const res = mockResponse();

      await AuthUser.login(req, res);

      expect(res.json).toHaveBeenCalledWith({
        token: "fake_token",
        user: expect.any(Object)
      });
    });

  });

  //Teste Profile
  describe("profile()", () => {

    test("Deve retornar erro se o usuário não existir", async () => {
      UserModel.findById.mockResolvedValue(null);

      const req = { user: { id_cliente: 1 } };
      const res = mockResponse();

      await AuthUser.profile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Usuário não encontrado"
      });
    });

    test("Deve retornar perfil do usuário", async () => {
      UserModel.findById.mockResolvedValue({ id_cliente: 1, nome: "Bernardo" });

      const req = { user: { id_cliente: 1 } };
      const res = mockResponse();

      await AuthUser.profile(req, res);

      expect(res.json).toHaveBeenCalledWith({
        user: { id_cliente: 1, nome: "Bernardo" }
      });
    });

  });

  //Teste Update
  describe("update()", () => {

    test("Deve retornar erro se email for inválido", async () => {
      validarEmail.mockReturnValue(false);

      const req = {
        user: { id_cliente: 1 },
        body: { email: "a" }
      };
      const res = mockResponse();

      await AuthUser.update(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "E-mail inválido." });
    });

    test("Deve atualizar usuário com sucesso", async () => {
      validarEmail.mockReturnValue(true);

      const req = {
        user: { id_cliente: 1 },
        body: { nome: "Novo", email: "novo@email.com" },
        file: null
      };

      UserModel.updateUser.mockResolvedValue(true);
      UserModel.findById.mockResolvedValue({ id_cliente: 1, nome: "Novo" });

      const res = mockResponse();

      await AuthUser.update(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: "Usuário atualizado com sucesso",
        user: { id_cliente: 1, nome: "Novo" }
      });
    });

  });

});
