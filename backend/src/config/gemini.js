import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn('⚠️ AVISO: GEMINI_API_KEY não configurada. IA não funcionará.');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Gera resposta do chatbot usando Google Gemini
 * @param {string} mensagem - Mensagem do usuário
 * @param {string} contextoEmpresa - Contexto/instruções específicas da empresa
 * @param {Array} historico - Histórico de mensagens anteriores
 */
export async function gerarResposta(mensagem, contextoEmpresa = '', historico = []) {
    if (!genAI) {
        return 'Desculpe, o serviço de IA não está configurado no momento.';
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        // Monta o prompt com contexto da empresa
        const prompt = `
Você é um assistente virtual de atendimento ao cliente.

INSTRUÇÕES DA EMPRESA:
${contextoEmpresa || 'Seja cordial, prestativo e profissional.'}

HISTÓRICO DA CONVERSA:
${historico.map(h => `${h.role}: ${h.message}`).join('\n')}

MENSAGEM DO CLIENTE:
${mensagem}

Responda de forma natural, útil e amigável:
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return text;
    } catch (error) {
        console.error('❌ Erro ao gerar resposta IA:', error);
        return 'Desculpe, tive um problema ao processar sua mensagem. Tente novamente.';
    }
}

/**
 * Analisa sentimento da mensagem
 */
export async function analisarSentimento(mensagem) {
    if (!genAI) return 'neutro';

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const prompt = `Analise o sentimento desta mensagem e responda APENAS com uma palavra: positivo, negativo ou neutro.

Mensagem: "${mensagem}"

Sentimento:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const sentimento = response.text().trim().toLowerCase();

        return sentimento;
    } catch (error) {
        console.error('Erro ao analisar sentimento:', error);
        return 'neutro';
    }
}
