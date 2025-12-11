import express from 'express';
import { supabase } from '../config/supabase.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dilob_secret_key_2024';

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                success: false,
                error: 'Email e senha são obrigatórios'
            });
        }

        // Buscar usuário pelo email
        const { data: usuario, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email.toLowerCase())
            .single();

        if (error || !usuario) {
            return res.status(401).json({
                success: false,
                error: 'Email ou senha inválidos'
            });
        }

        // Verificar senha
        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

        if (!senhaValida) {
            return res.status(401).json({
                success: false,
                error: 'Email ou senha inválidos'
            });
        }

        // Verificar se usuário está ativo
        if (!usuario.ativo) {
            return res.status(401).json({
                success: false,
                error: 'Usuário desativado. Contate o administrador.'
            });
        }

        // Gerar token JWT
        const token = jwt.sign(
            {
                id: usuario.id,
                email: usuario.email,
                role: usuario.role,
                empresa_id: usuario.empresa_id
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Atualizar último login
        await supabase
            .from('usuarios')
            .update({ ultimo_login: new Date().toISOString() })
            .eq('id', usuario.id);

        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    role: usuario.role,
                    empresa_id: usuario.empresa_id
                }
            }
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ success: false, error: 'Erro interno do servidor' });
    }
});

// Verificar token
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, error: 'Token não fornecido' });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, JWT_SECRET);

        // Buscar dados atualizados do usuário
        const { data: usuario, error } = await supabase
            .from('usuarios')
            .select('id, nome, email, role, empresa_id, ativo')
            .eq('id', decoded.id)
            .single();

        if (error || !usuario || !usuario.ativo) {
            return res.status(401).json({ success: false, error: 'Usuário não encontrado' });
        }

        res.json({ success: true, data: usuario });

    } catch (error) {
        return res.status(401).json({ success: false, error: 'Token inválido' });
    }
});

// Criar usuário (apenas admin pode criar)
router.post('/register', async (req, res) => {
    try {
        const { nome, email, senha, role, empresa_id } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({
                success: false,
                error: 'Nome, email e senha são obrigatórios'
            });
        }

        // Verificar se email já existe
        const { data: existente } = await supabase
            .from('usuarios')
            .select('id')
            .eq('email', email.toLowerCase())
            .single();

        if (existente) {
            return res.status(400).json({
                success: false,
                error: 'Este email já está cadastrado'
            });
        }

        // Hash da senha
        const senha_hash = await bcrypt.hash(senha, 10);

        // Criar usuário
        const { data: novoUsuario, error } = await supabase
            .from('usuarios')
            .insert([{
                nome,
                email: email.toLowerCase(),
                senha_hash,
                role: role || 'client',
                empresa_id: empresa_id || null,
                ativo: true
            }])
            .select('id, nome, email, role, empresa_id')
            .single();

        if (error) throw error;

        res.status(201).json({ success: true, data: novoUsuario });

    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Alterar senha
router.put('/change-password', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, error: 'Token não fornecido' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        const { senha_atual, nova_senha } = req.body;

        if (!senha_atual || !nova_senha) {
            return res.status(400).json({
                success: false,
                error: 'Senha atual e nova senha são obrigatórias'
            });
        }

        // Buscar usuário
        const { data: usuario, error } = await supabase
            .from('usuarios')
            .select('senha_hash')
            .eq('id', decoded.id)
            .single();

        if (error || !usuario) {
            return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
        }

        // Verificar senha atual
        const senhaValida = await bcrypt.compare(senha_atual, usuario.senha_hash);

        if (!senhaValida) {
            return res.status(401).json({ success: false, error: 'Senha atual incorreta' });
        }

        // Hash da nova senha
        const nova_senha_hash = await bcrypt.hash(nova_senha, 10);

        // Atualizar senha
        await supabase
            .from('usuarios')
            .update({ senha_hash: nova_senha_hash })
            .eq('id', decoded.id);

        res.json({ success: true, message: 'Senha alterada com sucesso' });

    } catch (error) {
        return res.status(401).json({ success: false, error: 'Token inválido' });
    }
});

export default router;
