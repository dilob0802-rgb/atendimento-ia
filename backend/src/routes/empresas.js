import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Listar todas as empresas com estatísticas
router.get('/', async (req, res) => {
    try {
        // 1. Buscar empresas
        const { data: empresas, error } = await supabase
            .from('empresas')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // 2. Buscar estatísticas para cada empresa
        const empresasComStats = await Promise.all(empresas.map(async (empresa) => {
            // Contar conversas (Leads)
            const { count: totalConversas } = await supabase
                .from('conversas')
                .select('*', { count: 'exact', head: true })
                .eq('empresa_id', empresa.id);

            // Contar mensagens (Interações) - precisamos fazer um join ou query separada
            // Como 'mensagens' não tem direto empresa_id (tem conversa_id), precisamos de um hack ou query melhor
            // Simplificação: vamos buscar todas as conversas e somar mensagens (pode ser pesado, mas funcional pra MVP)
            // Alternativa eficiente: criar uma view no SQL. Mas aqui via código:

            // Buscar conversas da empresa para contar mensagens
            const { data: conversas } = await supabase
                .from('conversas')
                .select('id, updated_at')
                .eq('empresa_id', empresa.id);

            let totalMensagens = 0;
            let ultimaInteracao = null;

            if (conversas && conversas.length > 0) {
                const conversaIds = conversas.map(c => c.id);

                // Contar mensagens dessas conversas
                const { count } = await supabase
                    .from('mensagens')
                    .select('*', { count: 'exact', head: true })
                    .in('conversa_id', conversaIds);

                totalMensagens = count || 0;

                // Pegar a data mais recente
                conversas.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
                ultimaInteracao = conversas[0].updated_at;
            }

            return {
                ...empresa,
                stats: {
                    leads: totalConversas || 0,
                    mensagens: totalMensagens || 0,
                    ultima_interacao: ultimaInteracao
                }
            };
        }));

        res.json({ success: true, data: empresasComStats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Buscar empresa por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('empresas')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        res.status(404).json({ success: false, error: 'Empresa não encontrada' });
    }
});

// Criar nova empresa
router.post('/', async (req, res) => {
    try {
        const { nome, email, telefone, contexto_ia, configuracoes, senha } = req.body;

        if (!nome || !email) {
            return res.status(400).json({
                success: false,
                error: 'Nome e email são obrigatórios'
            });
        }

        if (!senha) {
            return res.status(400).json({
                success: false,
                error: 'Senha é obrigatória'
            });
        }

        // Verificar se já existe um usuário com este email
        const { data: existingUser } = await supabase
            .from('usuarios')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Já existe um usuário com este email'
            });
        }

        // 1. Criar a empresa
        const { data: empresa, error: empresaError } = await supabase
            .from('empresas')
            .insert([{
                nome,
                email,
                telefone,
                contexto_ia: contexto_ia || 'Seja cordial e prestativo.',
                configuracoes: configuracoes || {},
                ativo: true
            }])
            .select()
            .single();

        if (empresaError) throw empresaError;

        // 2. Criar usuário para a empresa
        const bcrypt = await import('bcryptjs');
        const senhaHash = await bcrypt.hash(senha, 10);

        const { data: usuario, error: usuarioError } = await supabase
            .from('usuarios')
            .insert([{
                email: email,
                senha_hash: senhaHash,
                nome: nome,
                role: 'client',
                empresa_id: empresa.id,
                ativo: true
            }])
            .select()
            .single();

        if (usuarioError) {
            // Se falhar ao criar usuário, remover empresa criada
            await supabase.from('empresas').delete().eq('id', empresa.id);
            throw usuarioError;
        }

        res.status(201).json({
            success: true,
            data: empresa,
            message: 'Empresa e usuário criados com sucesso'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Atualizar empresa
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nova_senha, email, ...updates } = req.body;

        // 1. Atualizar dados da empresa
        const { data: empresa, error: empresaError } = await supabase
            .from('empresas')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (empresaError) throw empresaError;

        // 2. Se houver email ou senha, atualizar o usuário associado
        if (email || nova_senha) {
            // Buscar usuário da empresa
            const { data: usuario } = await supabase
                .from('usuarios')
                .select('id')
                .eq('empresa_id', id)
                .eq('role', 'client')
                .single();

            if (usuario) {
                const userUpdates = {};

                // Atualizar email se fornecido
                if (email) {
                    userUpdates.email = email;
                }

                // Atualizar senha se fornecida
                if (nova_senha) {
                    const bcrypt = await import('bcryptjs');
                    userUpdates.senha_hash = await bcrypt.hash(nova_senha, 10);
                }

                const { error: userError } = await supabase
                    .from('usuarios')
                    .update(userUpdates)
                    .eq('id', usuario.id);

                if (userError) {
                    console.error('Erro ao atualizar usuário:', userError);
                    // Não falhar a requisição, apenas logar o erro
                }
            }
        }

        res.json({ success: true, data: empresa });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Deletar empresa
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('empresas')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ success: true, message: 'Empresa removida com sucesso' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
