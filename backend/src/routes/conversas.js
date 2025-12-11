import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Listar todas as conversas (com filtro opcional por empresa_id)
router.get('/', async (req, res) => {
    try {
        const { empresa_id, status, limite = 50 } = req.query;

        let query = supabase
            .from('conversas')
            .select('*')
            .order('updated_at', { ascending: false })
            .limit(parseInt(limite));

        if (empresa_id) {
            query = query.eq('empresa_id', empresa_id);
        }

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Listar conversas de uma empresa
router.get('/empresa/:empresaId', async (req, res) => {
    try {
        const { empresaId } = req.params;
        const { status, limite = 50 } = req.query;

        let query = supabase
            .from('conversas')
            .select(`
        *,
        mensagens (count)
      `)
            .eq('empresa_id', empresaId)
            .order('updated_at', { ascending: false })
            .limit(parseInt(limite));

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Detalhes de uma conversa específica
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data: conversa, error: conversaError } = await supabase
            .from('conversas')
            .select('*')
            .eq('id', id)
            .single();

        if (conversaError) throw conversaError;

        const { data: mensagens, error: mensagensError } = await supabase
            .from('mensagens')
            .select('*')
            .eq('conversa_id', id)
            .order('created_at', { ascending: true });

        if (mensagensError) throw mensagensError;

        res.json({
            success: true,
            data: {
                ...conversa,
                mensagens
            }
        });
    } catch (error) {
        res.status(404).json({ success: false, error: 'Conversa não encontrada' });
    }
});

// Atualizar status da conversa
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['ativa', 'finalizada', 'aguardando'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Status inválido'
            });
        }

        const { data, error } = await supabase
            .from('conversas')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Estatísticas de conversas
router.get('/empresa/:empresaId/stats', async (req, res) => {
    try {
        const { empresaId } = req.params;

        const { data: conversas, error } = await supabase
            .from('conversas')
            .select('status, created_at')
            .eq('empresa_id', empresaId);

        if (error) throw error;

        const stats = {
            total: conversas.length,
            ativas: conversas.filter(c => c.status === 'ativa').length,
            finalizadas: conversas.filter(c => c.status === 'finalizada').length,
            aguardando: conversas.filter(c => c.status === 'aguardando').length,
            hoje: conversas.filter(c => {
                const hoje = new Date().toDateString();
                const criadaEm = new Date(c.created_at).toDateString();
                return hoje === criadaEm;
            }).length
        };

        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
