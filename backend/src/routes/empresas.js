import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Listar todas as empresas
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('empresas')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ success: true, data });
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
