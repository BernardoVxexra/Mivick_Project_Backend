import { validarEmail, validarSenha } from "../utils/Validators/validators.js";

describe("Testes do validador de Email", () => {

  test("Deve aceitar e-mail válido", () => {
    expect(validarEmail("robertin@gmail.com")).toBe(true);
    expect(validarEmail("usuario.teste+1@empresa.tech")).toBe(true);
  });

  test("Deve rejeitar e-mails inválidos", () => {
    const invalids = [
      "robertin@domain",
      "usuario@",
      "@gmail.com",
      "user@@gmail.com",
      "user@.com",
      "usergmail.com",
      "user@domain.c",
      "user@domain.toolongextensiontoolong"
    ];

    invalids.forEach(email => {
      expect(validarEmail(email)).toBe(false);
    });
  });

});


describe("Testes do validador de Senha", () => {

  test("Deve aceitar senha forte", () => {
    expect(validarSenha("julio123A@")).toBe(true);
    expect(validarSenha("SenhaForte2025!")).toBe(true);
  });

  test("Deve rejeitar senhas fracas", () => {
    const invalids = [
      "123456789",            // só números
      "senhaaaaaa",           // sem maiúscula, número e símbolo
      "SENHA12345",           // sem minúscula e símbolo
      "SenhaSemNumero!",      // sem número
      "Senha12345",           // sem símbolo
      "Aa1!",                 // muito curta
    ];

    invalids.forEach(senha => {
      expect(validarSenha(senha)).toBe(false);
    });
  });

});
