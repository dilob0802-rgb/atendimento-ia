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

    async function tryGenerate(modelName) {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }

    try {
        // Tenta o modelo mais novo primeiro
        return await tryGenerate('gemini-2.5-flash');
    } catch (error1) {
        console.warn('⚠️ Falha no gemini-2.5-flash, tentando fallback para 1.5-flash:', error1.message);
        try {
            return await tryGenerate('gemini-1.5-flash');
        } catch (error2) {
            console.error('❌ Erro fatual na IA (ambos modelos):', error2);
            return 'Desculpe, estou com dificuldades técnicas momentâneas. Por favor, aguarde um instante.';
        }
    }
}

/**
 * Analisa sentimento da mensagem
 */
export async function analisarSentimento(mensagem) {
    if (!genAI) return 'neutro';

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Usando 1.5 que é mais estável para tarefas simples
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
