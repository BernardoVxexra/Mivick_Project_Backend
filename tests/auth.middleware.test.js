import { authenticateToken } from "../middlewares/auth.js";
import jwt from "jsonwebtoken";
import { jest } from "@jest/globals";

describe("Middleware authenticateToken", () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  test("Sem token → 401", () => {
    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Token não encontrado" });
  });

  test("Token inválido → 403", () => {
    req.headers.authorization = "Bearer INVALIDO";

    jest.spyOn(jwt, "verify").mockImplementation((token, secret, cb) => {
      cb(new Error("Token inválido"), null);
    });

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Token inválido" });
  });

  test("Token válido → next()", () => {
    req.headers.authorization = "Bearer TESTE";

    const fakeUser = { id: 10 };

    jest.spyOn(jwt, "verify").mockImplementation((token, secret, cb) => {
      cb(null, fakeUser);
    });

    authenticateToken(req, res, next);

    expect(req.user).toEqual(fakeUser);
    expect(next).toHaveBeenCalled();
  });
});
