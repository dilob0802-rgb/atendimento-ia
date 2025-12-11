import express from 'express';
import { supabase } from '../config/supabase.js';
import { gerarResposta } from '../config/gemini.js';

import { processWebhook, enviarMensagemWhatsApp } from '../services/whatsappService.js';

const router = express.Router();

/**
 * Webhook para receber mensagens do WhatsApp (Evolution API)
 * Este endpoint será chamado quando uma nova mensagem chegar
 */
router.post('/webhook', async (req, res) => {
    try {
        const result = await processWebhook(req.body);

        if (result.success) {
            res.json(result);
        } else {
            // Se houver erro de lógica de negócio (ex: empresa não encontrada) mas processamento ok
            res.status(result.error ? 400 : 200).json(result);
        }

    } catch (error) {
        console.error('❌ Erro no webhook WhatsApp:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

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
