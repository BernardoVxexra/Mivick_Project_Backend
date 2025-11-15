import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { getDbConnection } from "../database/db.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


// Função para autenticação via Google
export async function googleLogin(req, res) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token ausente."
      });
    }

    // 1. Validar token com Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { name, email, picture } = payload;

    const db = await getDbConnection();

    // 2. Verificar se o e-mail já existe
    const existingUser = await db.get(
      "SELECT id_cliente, nome, email, telefone, foto FROM Cliente WHERE email = ?",
      [email]
    );

    let user;

    if (existingUser) {
      // Já existe → apenas retorna o usuário encontrado
      user = existingUser;
    } else {
      // 3. Criar novo usuário Google
      const result = await db.run(
        `INSERT INTO Cliente (nome, email, telefone, foto, senha)
         VALUES (?, ?, ?, ?, NULL)`,
        [name, email, null, picture]
      );

      user = {
        id_cliente: result.lastID,
        nome: name,
        email,
        telefone: null,
        foto: picture
      };
    }

    // 4. Criar token JWT
    const appToken = jwt.sign(
      { id_cliente: user.id_cliente, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      success: true,
      message: "Login com Google bem-sucedido",
      user,
      token: appToken,
    });

  } catch (error) {
    console.error("❌ Erro ao validar token Google:", error);

    return res.status(401).json({
      success: false,
      message: "Token inválido ou falha na autenticação."
    });
  }
}
