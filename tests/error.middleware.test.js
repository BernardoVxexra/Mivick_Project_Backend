import { jest } from "@jest/globals";
import { error } from "../middlewares/error.js";

describe("Middleware error", () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test("Erro padrão → 500", () => {
    const err = new Error("Falha interna");

    error(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Falha interna",
    });
  });

  test("Erro com status definido", () => {
    const err = new Error("Erro custom");
    err.statusCode = 400;

    error(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Erro custom",
    });
  });
});
