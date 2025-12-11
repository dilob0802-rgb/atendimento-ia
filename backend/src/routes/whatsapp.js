import express from 'express';
import { supabase } from '../config/supabase.js';
import { gerarResposta } from '../config/gemini.js';

const router = express.Router();

/**
 * Webhook para receber mensagens do WhatsApp (Evolution API)
 * Este endpoint será chamado quando uma nova mensagem chegar
 */
router.post('/webhook', async (req, res) => {
    try {
        console.log('📱 Webhook WhatsApp recebido:', req.body);

        const { event, instance, data } = req.body;

        // Verifica se é uma mensagem recebida
        if (event === 'messages.upsert' && data?.message) {
            const { key, message, pushName } = data;
            const telefone = key.remoteJid.replace('@s.whatsapp.net', '');
            const mensagemTexto = message.conversation || message.extendedTextMessage?.text;

            if (!mensagemTexto) {
                return res.json({ success: true, message: 'Mensagem sem texto ignorada' });
            }

            // Identifica empresa pela instância do WhatsApp
            const { data: empresa } = await supabase
                .from('empresas')
                .select('*')
                .eq('whatsapp_instance', instance)
                .single();

            if (!empresa) {
                console.log('⚠️ Empresa não encontrada para instância:', instance);
                return res.json({ success: false, error: 'Empresa não encontrada' });
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

            res.json({ success: true, message: 'Mensagem processada' });
        } else {
            res.json({ success: true, message: 'Evento ignorado' });
        }

    } catch (error) {
        console.error('❌ Erro no webhook WhatsApp:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Enviar mensagem via WhatsApp (Evolution API)
 */
async function enviarMensagemWhatsApp(instance, telefone, mensagem) {
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

// Endpoint manual para enviar mensagem
router.post('/enviar', async (req, res) => {
    try {
        const { instance, telefone, mensagem } = req.body;

        if (!instance || !telefone || !mensagem) {
            return res.status(400).json({
                success: false,
                error: 'instance, telefone e mensagem são obrigatórios'
            });
        }

        const resultado = await enviarMensagemWhatsApp(instance, telefone, mensagem);

        res.json({ success: true, data: resultado });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Gerar QR Code (Integração Real com Evolution API)
 */
router.post('/qrcode', async (req, res) => {
    try {
        const { instanceName } = req.body;
        const evolutionUrl = process.env.EVOLUTION_API_URL;
        const evolutionKey = process.env.EVOLUTION_API_KEY;

        console.log(`🔄 [${instanceName}] Iniciando geração de QR Code...`);

        if (!evolutionUrl || !evolutionKey) {
            throw new Error('Evolution API não configurada no .env');
        }

        // 1. Tentar criar a instância
        try {
            console.log(`👉 Tentando criar instância: ${instanceName} em ${evolutionUrl}/instance/create`);

            const createResponse = await fetch(`${evolutionUrl}/instance/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': evolutionKey
                },
                body: JSON.stringify({
                    instanceName: instanceName,
                    qrcode: true,
                    integration: 'WHATSAPP-BAILEYS'
                })
            });

            console.log(`📥 Create Status: ${createResponse.status}`);
            const responseText = await createResponse.text();
            console.log(`📥 Create Body Raw: ${responseText.substring(0, 200)}...`);

            let createData;
            try {
                createData = JSON.parse(responseText);
            } catch (e) {
                console.error('❌ Erro ao fazer parse do JSON de criação');
            }

            if (createResponse.ok && createData && createData.qrcode && createData.qrcode.base64) {
                console.log('✅ Instância criada e QR Code recebido!');
                return res.json({
                    success: true,
                    data: { qrcode: createData.qrcode.base64 }
                });
            }

        } catch (e) {
            console.error('❌ Erro de rede ao criar:', e.message);
        }

        // 2. Se falhou, tentar conectar
        try {
            console.log(`🔌 Tentando endpoint connect: ${evolutionUrl}/instance/connect/${instanceName}`);
            const connectResponse = await fetch(`${evolutionUrl}/instance/connect/${instanceName}`, {
                method: 'GET',
                headers: {
                    'apikey': evolutionKey
                }
            });

            console.log(`📥 Connect Status: ${connectResponse.status}`);
            const responseText = await connectResponse.text();
            console.log(`📥 Connect Body Raw: ${responseText.substring(0, 200)}...`);

            let connectData;
            try {
                connectData = JSON.parse(responseText);
            } catch (e) {
                console.error('❌ Erro ao fazer parse do JSON de conexão');
            }

            if (connectData && (connectData.base64 || connectData.qrcode)) {
                const qr = connectData.base64 || connectData.qrcode;
                console.log('✅ QR Code recuperado via connect!');
                return res.json({
                    success: true,
                    data: { qrcode: qr }
                });
            }

            // Se já estiver conectada
            if (connectData && connectData.instance && connectData.instance.state === 'open') {
                console.log('✅ Instância já está conectada!');
                return res.json({
                    success: true,
                    data: { status: 'connected' }
                });
            }

        } catch (e) {
            console.error('❌ Erro de rede ao conectar:', e.message);
        }

        // Se chegou aqui, não conseguiu o QR Code
        res.json({ success: false, error: 'Não foi possível obter o QR Code. Consulte os logs do backend.' });

    } catch (error) {
        console.error('❌ Erro geral ao gerar QR Code:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Verificar Status da Conexão
 */
router.get('/status/:instanceName', async (req, res) => {
    try {
        const { instanceName } = req.params;
        const evolutionUrl = process.env.EVOLUTION_API_URL;
        const evolutionKey = process.env.EVOLUTION_API_KEY;

        if (!evolutionUrl || !evolutionKey) return res.json({ status: 'disconnected' });

        const response = await fetch(`${evolutionUrl}/instance/connectionState/${instanceName}`, {
            method: 'GET',
            headers: { 'apikey': evolutionKey }
        });

        const data = await response.json();

        if (data.instance && data.instance.state === 'open') {
            return res.json({ status: 'connected' });
        }

        return res.json({ status: 'disconnected' });

    } catch (error) {
        res.json({ status: 'disconnected', error: error.message });
    }
});

export default router;
