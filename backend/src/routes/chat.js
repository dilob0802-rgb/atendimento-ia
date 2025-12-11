import express from 'express';
import { supabase } from '../config/supabase.js';
import { gerarResposta } from '../config/gemini.js';

const router = express.Router();

// Enviar mensagem e receber resposta da IA
router.post('/mensagem', async (req, res) => {
    try {
        const { empresa_id, cliente_nome, cliente_telefone, cliente_email, mensagem, canal } = req.body;

        if (!empresa_id || !mensagem) {
            return res.status(400).json({
                success: false,
                error: 'empresa_id e mensagem são obrigatórios'
            });
        }

        // Busca configurações da empresa
        const { data: empresa, error: empresaError } = await supabase
            .from('empresas')
            .select('contexto_ia, configuracoes')
            .eq('id', empresa_id)
            .single();

        if (empresaError) throw new Error('Empresa não encontrada');

        // Busca ou cria conversa
        let conversaId;
        const { data: conversaExistente } = await supabase
            .from('conversas')
            .select('id')
            .eq('empresa_id', empresa_id)
            .eq('cliente_telefone', cliente_telefone)
            .eq('status', 'ativa')
            .single();

        if (conversaExistente) {
            conversaId = conversaExistente.id;
        } else {
            const { data: novaConversa, error: conversaError } = await supabase
                .from('conversas')
                .insert([{
                    empresa_id,
                    cliente_nome: cliente_nome || 'Cliente',
                    cliente_telefone,
                    cliente_email: cliente_email || null,
                    canal: canal || 'web',
                    status: 'ativa'
                }])
                .select()
                .single();

            if (conversaError) throw conversaError;
            conversaId = novaConversa.id;
        }

        // Salva mensagem do cliente
        console.log(`📝 Salvando mensagem do cliente [${conversaId}]:`, mensagem.substring(0, 50));
        const { error: insertError } = await supabase
            .from('mensagens')
            .insert([{
                conversa_id: conversaId,
                tipo: 'cliente',
                mensagem: mensagem // CORRIGIDO: Era 'conteudo', mudado para 'mensagem' para consistência
            }]);

        if (insertError) {
            console.error('❌ Erro ao salvar mensagem no DB:', insertError);
            throw new Error(`Erro de banco de dados: ${insertError.message}`);
        }

        // Busca histórico recente
        const { data: historico } = await supabase
            .from('mensagens')
            .select('tipo, mensagem') // CORRIGIDO
            .eq('conversa_id', conversaId)
            .order('created_at', { ascending: false })
            .limit(10);

        const historicoFormatado = historico?.reverse().map(h => ({
            role: h.tipo === 'cliente' ? 'Cliente' : 'Assistente',
            message: h.mensagem // CORRIGIDO
        })) || [];

        // Gera resposta da IA
        console.log('🤖 Gerando resposta da IA...');
        const respostaIA = await gerarResposta(
            mensagem,
            empresa.contexto_ia,
            historicoFormatado
        );
        console.log('🤖 Resposta gerada:', respostaIA.substring(0, 50));

        // Salva resposta da IA
        const { error: botInsertError } = await supabase
            .from('mensagens')
            .insert([{
                conversa_id: conversaId,
                tipo: 'bot',
                mensagem: respostaIA // CORRIGIDO
            }]);

        if (botInsertError) console.error('⚠️ Erro ao salvar resposta do bot:', botInsertError);

        res.json({
            success: true,
            data: {
                conversa_id: conversaId,
                resposta: respostaIA
            }
        });

    } catch (error) {
        console.error('Erro ao processar mensagem:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Buscar histórico de uma conversa
router.get('/conversa/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('mensagens')
            .select('*')
            .eq('conversa_id', id)
            .order('created_at', { ascending: true });

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
