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
        const { nome, email, telefone, contexto_ia, configuracoes } = req.body;

        if (!nome || !email) {
            return res.status(400).json({
                success: false,
                error: 'Nome e email são obrigatórios'
            });
        }

        const { data, error } = await supabase
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

        if (error) throw error;

        res.status(201).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Atualizar empresa
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const { data, error } = await supabase
            .from('empresas')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, data });
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
