import { upload } from "../middlewares/upload.js";

describe("Middleware upload (multer)", () => {

  test("Permite imagens", (done) => {
    const file = { mimetype: "image/png" };

    upload.fileFilter({}, file, (err, allowed) => {
      expect(err).toBeNull();
      expect(allowed).toBe(true);
      done();
    });
  });

  test("Bloqueia arquivos não imagem", (done) => {
    const file = { mimetype: "application/pdf" };

    upload.fileFilter({}, file, (err, allowed) => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe("Apenas imagens são permitidas");
      expect(allowed).toBe(false);
      done();
    });
  });

});
