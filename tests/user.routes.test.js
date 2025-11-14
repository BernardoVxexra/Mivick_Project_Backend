import { jest } from "@jest/globals";
import request from "supertest";

jest.unstable_mockModule("../models/UserModel.js", () => ({
  UserModel: {
    findById: jest.fn(),
    updateUser: jest.fn(),
    findByEmail: jest.fn()
  }
}));

jest.unstable_mockModule("../middlewares/auth.js", () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id_cliente: 1 };
    next();
  }
}));

const { UserModel } = await import("../models/UserModel.js");
const app = (await import("../app.js")).default;

describe("User routes (Supertest)", () => {
  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => jest.clearAllMocks());

  afterAll(() => jest.restoreAllMocks());

  test("GET /app/mivick/user/profile - retorna o perfil do usuário", async () => {
    UserModel.findById.mockResolvedValue({
      id_cliente: 1,
      nome: "Bernardo"
    });

    const res = await request(app).get("/app/mivick/user/profile");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("user");
    expect(res.body.user.nome).toBe("Bernardo");
    expect(UserModel.findById).toHaveBeenCalledWith(1);
  });

  test("PUT /app/mivick/user - atualiza dados do usuário", async () => {
    UserModel.updateUser.mockResolvedValue(true);

    UserModel.findById.mockResolvedValue({
      id_cliente: 1,
      nome: "Novo"
    });

    const res = await request(app)
      .put("/app/mivick/user")
      .send({ nome: "Novo", email: "novo@e.com" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("user");
    expect(res.body.user.nome).toBe("Novo");
    expect(UserModel.updateUser).toHaveBeenCalled();
  });
});
