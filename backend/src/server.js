import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/supabase.js';

// Rotas
import empresasRoutes from './routes/empresas.js';
import conversasRoutes from './routes/conversas.js';
import chatRoutes from './routes/chat.js';
import whatsappRoutes from './routes/whatsapp.js';

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
            empresas: '/api/empresas',
            conversas: '/api/conversas',
            chat: '/api/chat',
            whatsapp: '/api/whatsapp'
        }
    });
});

// Rotas da API
app.use('/api/empresas', empresasRoutes);
app.use('/api/conversas', conversasRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/whatsapp', whatsappRoutes);

// Middleware de erro
app.use((err, req, res, next) => {
    console.error('❌ Erro:', err);
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: err.message
    });
});

// Inicia o servidor
async function iniciarServidor() {
    console.log('🚀 Iniciando servidor...\n');

    // Testa conexão com Supabase
    await testConnection();

    app.listen(PORT, () => {
        console.log(`\n✅ Servidor rodando em http://localhost:${PORT}`);
        console.log(`📚 Documentação: http://localhost:${PORT}/`);
        console.log('\n💡 Dica: Configure o arquivo .env antes de começar!\n');
    });
}

iniciarServidor();
