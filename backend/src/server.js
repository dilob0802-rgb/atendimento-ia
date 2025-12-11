import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Rotas
import empresasRoutes from './routes/empresas.js';
import conversasRoutes from './routes/conversas.js';
import chatRoutes from './routes/chat.js';
import whatsappRoutes from './routes/whatsapp.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Rota de health check
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        message: '🤖 API de Atendimento Automatizado',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            empresas: '/api/empresas',
            conversas: '/api/conversas',
            chat: '/api/chat',
            whatsapp: '/api/whatsapp'
        }
    });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/empresas', empresasRoutes);
app.use('/api/conversas', conversasRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/whatsapp', whatsappRoutes);

// Rota de Teste da IA (Para Debug)
// Rota de Teste da IA (Para Debug)
app.get('/api/test-ai', async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('GEMINI_API_KEY is missing');

        // Importação dinâmica para garantir que estamos usando a lib instalada
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);

        // Tenta modelo 2.5
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            const result = await model.generateContent('Teste de conexão.');
            const response = await result.response;
            return res.json({
                status: 'success',
                model: 'gemini-2.5-flash',
                message: response.text()
            });
        } catch (e2) {
            console.error('Falha no 2.5, tentando 1.5...', e2);
            // Tenta fallback para 1.5
            try {
                const model15 = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
                const result15 = await model15.generateContent('Teste de conexão fallback.');
                const response15 = await result15.response;
                return res.json({
                    status: 'success_fallback',
                    model: 'gemini-1.5-flash',
                    previous_error: e2.message,
                    message: response15.text()
                });
            } catch (e3) {
                throw new Error(`Falha em ambos modelos. 2.5: ${e2.message} | 1.5: ${e3.message}`);
            }
        }

    } catch (error) {
        res.status(500).json({
            status: 'critical_error',
            error: error.message,
            stack: error.stack,
            env_key_length: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0
        });
    }
});

// Middleware de erro
app.use((err, req, res, next) => {
    console.error('❌ Erro:', err);
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: err.message
    });
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log('✅ Servidor rodando em http://localhost:' + PORT);
    console.log('📚 Documentação: http://localhost:' + PORT + '/');
});
