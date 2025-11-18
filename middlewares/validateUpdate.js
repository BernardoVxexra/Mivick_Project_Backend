// middlewares/validateUpdate.js
import { validarEmail } from "../utils/Validators/validators.js";

export function validateUpdate(req, res, next) {
    const { email, nome, telefone } = req.body;

    if (email && !validarEmail(email)) {
        return res.status(400).json({ error: "E-mail inválido." });
    }

    if (nome && nome.length < 2) {
        return res.status(400).json({ error: "Nome muito curto." });
    }

    if (telefone && telefone.length < 8) {
        return res.status(400).json({ error: "Telefone inválido." });
    }

    next();
}
