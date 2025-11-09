// routes/authRoutes.js
import express from "express";
import { OAuth2Client } from "google-auth-library";

const router = express.Router();


const client = new OAuth2Client(
  "361690709955-92l95olnj2mbh7mo2d3ube4sbk9eran8.apps.googleusercontent.com"
);

// Rota para validar o token do Google
router.post("/google", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: "Token ausente" });
    }

    // Verifica o token com o Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience:
        "361690709955-92l95olnj2mbh7mo2d3ube4sbk9eran8.apps.googleusercontent.com",
    });

    const payload = ticket.getPayload();

    console.log("✅ Usuário autenticado com Google:", payload);


    res.json({
      success: true,
      message: "Token verificado com sucesso",
      user: {
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
      },
    });
  } catch (error) {
    console.error("❌ Erro ao validar token:", error);
    res.status(401).json({ success: false, message: "Token inválido" });
  }
});

export default router;
