import { supabase } from '../config/supabase.js';
import { gerarResposta } from '../config/gemini.js';

/**
 * Enviar mensagem via WhatsApp (Evolution API)
 */
export async function enviarMensagemWhatsApp(instance, telefone, mensagem) {
    const evolutionUrl = process.env.EVOLUTION_API_URL;
    const evolutionKey = process.env.EVOLUTION_API_KEY;

    if (!evolutionUrl || !evolutionKey) {
        throw new Error('Evolution API não configurada');
    }

    const response = await fetch(`${evolutionUrl}/message/sendText/${instance}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': evolutionKey
        },
        body: JSON.stringify({
            number: `${telefone}@s.whatsapp.net`,
            text: mensagem
        })
    });

    if (!response.ok) {
        throw new Error('Erro ao enviar mensagem WhatsApp');
    }

    return await response.json();
}

/**
 * Processar Webhook do WhatsApp
 */
export async function processWebhook(body) {
    console.log('📱 Webhook WhatsApp recebido:', body);

    const { event, instance, data } = body;

    // Verifica se é uma mensagem recebida
    if (event === 'messages.upsert' && data?.message) {
        const { key, message, pushName } = data;
        const telefone = key.remoteJid.replace('@s.whatsapp.net', '');
        const mensagemTexto = message.conversation || message.extendedTextMessage?.text;

        if (!mensagemTexto) {
            return { success: true, message: 'Mensagem sem texto ignorada' };
        }

        // Identifica empresa pela instância do WhatsApp
        const { data: empresa } = await supabase
            .from('empresas')
            .select('*')
            .eq('whatsapp_instance', instance)
            .single();

        if (!empresa) {
            console.log('⚠️ Empresa não encontrada para instância:', instance);
            return { success: false, error: 'Empresa não encontrada' };
        }

        // Busca ou cria conversa
        let conversaId;
        const { data: conversaExistente } = await supabase
            .from('conversas')
            .select('id')
            .eq('empresa_id', empresa.id)
            .eq('cliente_telefone', telefone)
            .eq('status', 'ativa')
            .single();

        if (conversaExistente) {
            conversaId = conversaExistente.id;
        } else {
            const { data: novaConversa } = await supabase
                .from('conversas')
                .insert([{
                    empresa_id: empresa.id,
                    cliente_nome: pushName || 'Cliente WhatsApp',
                    cliente_telefone: telefone,
                    canal: 'whatsapp',
                    status: 'ativa'
                }])
                .select()
                .single();

            conversaId = novaConversa.id;
        }

        // Salva mensagem do cliente
        await supabase
            .from('mensagens')
            .insert([{
                conversa_id: conversaId,
                tipo: 'cliente',
                mensagem: mensagemTexto
            }]);

        // Busca histórico
        const { data: historico } = await supabase
            .from('mensagens')
            .select('tipo, mensagem')
            .eq('conversa_id', conversaId)
            .order('created_at', { ascending: false })
            .limit(10);

        const historicoFormatado = historico?.reverse().map(h => ({
            role: h.tipo === 'cliente' ? 'Cliente' : 'Assistente',
            message: h.mensagem
        })) || [];

        // Gera resposta da IA
        const respostaIA = await gerarResposta(
            mensagemTexto,
            empresa.contexto_ia,
            historicoFormatado
        );

        // Salva resposta
        await supabase
            .from('mensagens')
            .insert([{
                conversa_id: conversaId,
                tipo: 'bot',
                mensagem: respostaIA
            }]);

        // Envia resposta via WhatsApp (se Evolution API estiver configurado)
        if (process.env.EVOLUTION_API_URL) {
            try {
                await enviarMensagemWhatsApp(instance, telefone, respostaIA);
            } catch (error) {
                console.error('Erro ao enviar mensagem WhatsApp:', error);
            }
        }

        return { success: true, message: 'Mensagem processada' };
    } else {
        return { success: true, message: 'Evento ignorado' };
    }
}
