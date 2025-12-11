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
app.get('/api/test-ai', async (req, res) => {
    try {
        const { gerarResposta } = await import('./config/gemini.js');
        const resposta = await gerarResposta('Diga "Teste OK" se você estiver funcionando.');
        res.json({
            status: 'success',
            message: resposta,
            env_key_configured: !!process.env.GEMINI_API_KEY
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: error.message,
            stack: error.stack
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
