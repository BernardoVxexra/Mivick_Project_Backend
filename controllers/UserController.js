import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/UserModel.js';

export class AuthUser {
    // Cadastro 
    static async register(req, res) {
        const { nome, telefone, email, senha, foto } = req.body; // foto opcional

        console.log('Verificando usuário existente:', email);
        const userExist = await UserModel.findByEmail(email);
        console.log('Resultado do findByEmail:', userExist);
        if (userExist) return res.status(400).json({
            error: "Email já cadastrado"
        });

        const senhaHash = await bcrypt.hash(senha, 10);
        await UserModel.createUser({ nome, telefone, email, senhaHash, foto });

        res.status(201).json({
            message: "Usuário cadastrado com sucesso"
        });
    }

    static async login(req, res) {
        const { email, senha } = req.body;

        const user = await UserModel.findByEmail(email);
        if (!user) return res.status(400).json({
            error: "Usuário não encontrado"
        });

        const validPassword = await bcrypt.compare(senha, user.senha);
        if (!validPassword) return res.status(401).json({
            error: "Senha Incorreta"
        });

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
        if (!user) return res.status(404).json({
            error: "Usuário não encontrado"
        });

        res.json({ user });
    }

    // Atualizar perfil
    static async update(req, res) {
        try {
            const id_cliente = req.user.id_cliente;
            const { nome, email, telefone } = req.body;

            // pega o nome do arquivo da imagem (caso tenha)
            const foto = req.file ? `/uploads/${req.file.filename}` : req.body.foto;

            await UserModel.updateUser(id_cliente, { nome, email, telefone, foto });
            const updatedUser = await UserModel.findById(id_cliente);

            res.json({ message: 'Usuário atualizado com sucesso', user: updatedUser });
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            res.status(500).json({ error: 'Falha ao atualizar usuário' });
        }
    }

}

