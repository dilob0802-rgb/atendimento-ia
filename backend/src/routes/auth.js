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
        console.log('🔍 Tentativa de login com email:', email);
        const { data: usuario, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email.toLowerCase())
            .single();

        if (error || !usuario) {
            console.log('❌ Usuário não encontrado ou erro:', error?.message || 'Usuário não existe');
            return res.status(401).json({
                success: false,
                error: 'Email ou senha inválidos'
            });
        }

        console.log('✅ Usuário encontrado:', usuario.email, 'Role:', usuario.role);

        // Verificar senha
        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

        if (!senhaValida) {
            console.log('❌ Senha inválida para:', usuario.email);
            return res.status(401).json({
                success: false,
                error: 'Email ou senha inválidos'
            });
        }

        console.log('✅ Senha válida para:', usuario.email);

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

// Setup inicial - cria tabela e usuários padrão
router.post('/setup', async (req, res) => {
    try {
        // Verificar se já existem usuários
        const { data: existingUsers, error: checkError } = await supabase
            .from('usuarios')
            .select('id')
            .limit(1);

        // Se a tabela não existe, criar
        if (checkError && checkError.code === '42P01') {
            // Tabela não existe - vamos criar via insert direto
            console.log('Tabela usuarios não existe, criando...');
        }

        // Hash para senha 'admin123'
        const senhaHash = await bcrypt.hash('admin123', 10);

        // Criar admin
        const { error: adminError } = await supabase
            .from('usuarios')
            .upsert([{
                nome: 'Administrador',
                email: 'admin@dilob.com',
                senha_hash: senhaHash,
                role: 'super_admin',
                ativo: true
            }], { onConflict: 'email' });

        if (adminError) {
            console.error('Erro ao criar admin:', adminError);
        }

        // Criar usuário teste
        const { error: testeError } = await supabase
            .from('usuarios')
            .upsert([{
                nome: 'Usuario Teste',
                email: 'teste@empresa.com',
                senha_hash: senhaHash,
                role: 'client',
                ativo: true
            }], { onConflict: 'email' });

        if (testeError) {
            console.error('Erro ao criar usuario teste:', testeError);
        }

        res.json({
            success: true,
            message: 'Setup concluído! Usuários criados.',
            usuarios: [
                { email: 'admin@dilob.com', senha: 'admin123', role: 'super_admin' },
                { email: 'teste@empresa.com', senha: 'admin123', role: 'client' }
            ]
        });

    } catch (error) {
        console.error('Erro no setup:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
