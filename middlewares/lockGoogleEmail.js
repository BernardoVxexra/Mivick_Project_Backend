// middlewares/lockGoogleEmail.js
import { UserModel } from "../models/UserModel.js";

export async function lockGoogleEmail(req, res, next) {
    try {
        const user = await UserModel.findById(req.user.id_cliente);

        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        // Conta Google: senha = null
        const isGoogleUser = user.senha === null;

        // Tentou alterar e-mail → bloquear
        if (isGoogleUser && req.body.email && req.body.email !== user.email) {
            return res.status(403).json({
                error: "Usuários autenticados pelo Google não podem alterar o e-mail."
            });
        }

        next();
    } catch (e) {
        console.error("Erro lockGoogleEmail:", e);
        res.status(500).json({ error: "Erro interno na validação de conta Google." });
    }
}
