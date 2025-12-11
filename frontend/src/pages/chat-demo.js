import Head from 'next/head';
import { useState, useRef, useEffect } from 'react';
import styles from '../styles/ChatDemo.module.css';
import ProtectedRoute from '../components/ProtectedRoute';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ChatDemo() {
    const [currentLead, setCurrentLead] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [empresaId, setEmpresaId] = useState(null);
    const [companyName, setCompanyName] = useState('Sua Empresa');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Buscar lead atual do localStorage (vindo do Kanban)
        const storedLead = localStorage.getItem('current_lead');
        const storedCompanyId = localStorage.getItem('company_id');
        const storedCompanyName = localStorage.getItem('user_name');

        if (storedCompanyName) {
            setCompanyName(storedCompanyName);
        }

        if (storedCompanyId && storedCompanyId !== 'demo') {
            setEmpresaId(storedCompanyId);
        }

        if (storedLead) {
            try {
                const lead = JSON.parse(storedLead);
                setCurrentLead(lead);

                // Normaliza o ID da conversa (pode vir como .conversa_id do modal ou .id do Kanban)
                const conversaId = lead.conversa_id || lead.id;

                // Se o lead tem um ID de conversa, busca o histórico
                if (conversaId) {
                    console.log('🔄 Buscando histórico da conversa:', conversaId);

                    // Atualiza o lead no estado para garantir que tenhamos o ID certo para futuros envios
                    if (!lead.conversa_id) {
                        lead.conversa_id = conversaId;
                        setCurrentLead(prev => ({ ...prev, conversa_id: conversaId }));
                    }

                    fetch(`${API_URL}/api/chat/conversa/${conversaId}`)
                        .then(res => res.json())
                        .then(data => {
                            if (data.success && data.data && data.data.length > 0) {
                                // Mapeia mensagens do DB para formato do chat
                                const dbMessages = data.data.map(m => ({
                                    tipo: m.tipo,
                                    mensagem: m.mensagem,
                                    timestamp: new Date(m.created_at)
                                }));
                                setMessages(dbMessages);
                                setTimeout(scrollToBottom, 500);
                            } else {
                                // Se não tem histórico, mostra saudação
                                setMessages([{
                                    tipo: 'bot',
                                    mensagem: `Olá ${lead.nome}! 👋 Sou seu assistente virtual. Como posso ajudar hoje?`,
                                    timestamp: new Date()
                                }]);
                            }
                        })
                        .catch(err => {
                            console.error('Erro ao buscar histórico:', err);
                            // Fallback para saudação
                            setMessages([{
                                tipo: 'bot',
                                mensagem: `Olá ${lead.nome}! 👋 Sou seu assistente virtual. Como posso ajudar hoje?`,
                                timestamp: new Date()
                            }]);
                        });
                } else {
                    // Lead sem conversa iniciada (novo)
                    setMessages([{
                        tipo: 'bot',
                        mensagem: `Olá ${lead.nome}! 👋 Sou seu assistente virtual. Como posso ajudar hoje?`,
                        timestamp: new Date()
                    }]);
                }
            } catch (e) {
                console.error('Erro ao carregar lead:', e);
            }
        } else {
            setMessages([{
                tipo: 'bot',
                mensagem: 'Olá! 👋 Sou seu assistente virtual. Como posso ajudar hoje?',
                timestamp: new Date()
            }]);
        }
    }, [empresaId]);

    const handleSend = async () => {
        if (!inputValue.trim() || loading) return;

        const userMessage = {
            tipo: 'cliente',
            mensagem: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/chat/mensagem`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    empresa_id: empresaId || 'demo',
                    conversa_id: currentLead?.conversa_id || currentLead?.id, // Envia ID se existir para manter contexto
                    cliente_nome: currentLead?.nome || 'Visitante',
                    cliente_telefone: currentLead?.telefone || 'web-demo',
                    cliente_email: currentLead?.email || '',
                    mensagem: inputValue,
                    canal: 'web'
                })
            });

            const data = await response.json();

            if (data.success) {
                const botMessage = {
                    tipo: 'bot',
                    mensagem: data.data.resposta,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, botMessage]);
            } else {
                throw new Error('Erro ao enviar mensagem');
            }
        } catch (error) {
            console.error('Erro:', error);
            const errorMessage = {
                tipo: 'bot',
                mensagem: '❌ Desculpe, houve um erro. Verifique se o backend está rodando e configurado corretamente.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <ProtectedRoute>
            <Head>
                <title>Chat Demo - Dilob</title>
                <meta name="description" content="Demonstração do chat com IA" />
            </Head>

            <div className={styles.container}>
                <div className={styles.sidebar}>
                    <div className={styles.logo}>
                        {/* Ícone de prédio/empresa genérico mais moderno */}
                        <span style={{ marginRight: '0.5rem', color: 'var(--primary)', background: 'rgba(59, 130, 246, 0.1)', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" /><path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" /><path d="M10 18h4" /></svg>
                        </span>
                        <h3 style={{ fontSize: '1.2rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {companyName}
                        </h3>
                    </div>

                    <nav className={styles.nav}>
                        <a href="/dashboard" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start' }}>
                            ← Voltar
                        </a>
                    </nav>
                </div>

                <div className={styles.chatContainer}>
                    <div className={styles.chatHeader + ' glass-card'}>
                        <div className={styles.chatHeaderInfo}>
                            <div className={styles.chatHeaderAvatar} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" /><path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" /><path d="M10 18h4" /></svg>
                            </div>
                            <div>
                                <h3 style={{ margin: 0 }}>{companyName}</h3>
                                <span className={styles.chatStatus}>
                                    <span className={styles.statusDot}></span>
                                    Online
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.chatMessages}>
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`${styles.messageWrapper} ${msg.tipo === 'cliente' ? styles.messageWrapperUser : styles.messageWrapperBot
                                    }`}
                            >
                                {msg.tipo === 'bot' && (
                                    <div className={styles.messageAvatar}>🤖</div>
                                )}
                                <div className={`chat-bubble ${msg.tipo === 'cliente' ? 'chat-bubble-user' : 'chat-bubble-bot'}`}>
                                    {msg.mensagem}
                                </div>
                                {msg.tipo === 'cliente' && (
                                    <div className={styles.messageAvatar}>👤</div>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div className={styles.messageWrapperBot}>
                                <div className={styles.messageAvatar}>🤖</div>
                                <div className={styles.typing}>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className={styles.chatInput + ' glass-card'}>
                        <input
                            type="text"
                            className="input"
                            placeholder="Digite sua mensagem..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                            style={{ marginBottom: 0 }}
                        />
                        <button
                            className="btn btn-primary"
                            onClick={handleSend}
                            disabled={loading || !inputValue.trim()}
                        >
                            {loading ? '...' : '📤'}
                        </button>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
