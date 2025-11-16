import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/UserModel.js";
import { validarEmail, validarSenha } from "../utils/Validators/validators.js";

export class AuthUser {

    // Cadastro tradicional
    static async register(req, res) {
        const { nome, telefone, email, senha, foto } = req.body;

        if (!validarEmail(email)) {
            return res.status(400).json({ error: "E-mail inválido." });
        }

        if (!validarSenha(senha)) {
            return res.status(400).json({
                error: "Senha fraca. A senha deve conter no mínimo 8 caracteres, incluindo letra maiúscula, minúscula, número e caractere especial."
            });
        }

        const userExist = await UserModel.findByEmail(email);
        if (userExist) {
            return res.status(400).json({ error: "Email já cadastrado" });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        await UserModel.createUser({
            nome,
            telefone,
            email,
            senhaHash,
            foto
        });

        return res.status(201).json({
            message: "Usuário cadastrado com sucesso"
        });
    }

    // Login tradicional
    static async login(req, res) {
        const { email, senha } = req.body;

        const user = await UserModel.findByEmail(email);
        if (!user) {
            return res.status(400).json({ error: "Usuário não encontrado" });
        }

        // Usuário Google NÃO TEM SENHA
        if (user.senha === null) {
            return res.status(403).json({
                error: "Esta conta foi criada com Google. Faça login com Google."
            });
        }

        const validPassword = await bcrypt.compare(senha, user.senha);
        if (!validPassword) {
            return res.status(401).json({ error: "Senha incorreta" });
        }

        const token = jwt.sign(
            { id_cliente: user.id_cliente, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.json({ token, user });
    }

    // Perfil autenticado
    static async profile(req, res) {
        const user = await UserModel.findById(req.user.id_cliente);

        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }

        res.json({ user });
    }

    // Atualizar perfil (para usuários Google ou normais)
    static async update(req, res) {
        try {
            const id_cliente = req.user.id_cliente;
            const { nome, email, telefone } = req.body;

            // Foto enviada no upload, ou manter foto atual
            const foto = req.file ? `/uploads/${req.file.filename}` : req.body.foto;

            await UserModel.updateUser(id_cliente, { nome, email, telefone, foto });
            const updatedUser = await UserModel.findById(id_cliente);

            res.json({
                message: 'Usuário atualizado com sucesso',
                user: updatedUser
            });

        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            res.status(500).json({ error: 'Falha ao atualizar usuário' });
        }
    }
}
