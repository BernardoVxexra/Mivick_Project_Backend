// routes/authRoutes.js
import express from "express";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const router = express.Router();

// Cliente Google
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


router.post("/google", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: "Token ausente" });
    }

    
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { name, email, picture } = payload;

    
    const appToken = jwt.sign(
      { name, email, picture },
      process.env.JWT_SECRET, 
      { expiresIn: "1d" }
    );

   
    res.json({
      success: true,
      message: "Login com Google bem-sucedido",
      user: { name, email, picture },
      token: appToken,
    });
  } catch (error) {
    console.error("❌ Erro ao validar token Google:", error);
    res.status(401).json({ success: false, message: "Token inválido" });
  }
});

export default router;
