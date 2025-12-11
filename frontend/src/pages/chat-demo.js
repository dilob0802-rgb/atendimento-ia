import Head from 'next/head';
import { useState, useRef, useEffect } from 'react';
import styles from '../styles/ChatDemo.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ChatDemo() {
    const [currentLead, setCurrentLead] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [empresaId, setEmpresaId] = useState(null);
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

        if (storedLead) {
            try {
                const lead = JSON.parse(storedLead);
                setCurrentLead(lead);
                setMessages([{
                    tipo: 'bot',
                    mensagem: `Olá ${lead.nome}! 👋 Sou seu assistente virtual. Como posso ajudar hoje?`,
                    timestamp: new Date()
                }]);
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

        // Usar company_id do localStorage ou buscar primeira empresa
        if (storedCompanyId && storedCompanyId !== 'demo') {
            setEmpresaId(storedCompanyId);
        } else {
            fetch(`${API_URL}/api/empresas`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.data.length > 0) {
                        setEmpresaId(data.data[0].id);
                    }
                })
                .catch(err => console.error('Erro ao buscar empresa:', err));
        }
    }, []);

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
        <>
            <Head>
                <title>Chat Demo - Dilob</title>
                <meta name="description" content="Demonstração do chat com IA" />
            </Head>

            <div className={styles.container}>
                <div className={styles.sidebar}>
                    <div className={styles.logo}>
                        {/* Ícone de prédio/empresa genérico */}
                        <span style={{ marginRight: '0.5rem', color: 'var(--primary)', background: 'rgba(59, 130, 246, 0.1)', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="21" width="18" height="2"></rect><path d="M5 21V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14"></path><path d="M5 10a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2"></path></svg>
                        </span>
                        <h3 style={{ fontSize: '1.2rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {typeof window !== 'undefined' ? (localStorage.getItem('user_name') || 'Sua Empresa') : 'Sua Empresa'}
                        </h3>
                    </div>

                    <nav className={styles.nav}>
                        <a href="/dashboard" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start' }}>
                            ← Voltar
                        </a>
                    </nav>

                    <div className={styles.info + ' glass-card'}>
                        <h4>💡 Dica</h4>
                        <p className="text-secondary" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                            Este chat usa IA real (Google Gemini). Configure o backend para testar!
                        </p>
                    </div>

                    <div className={styles.suggestions}>
                        <h4 style={{ marginBottom: '1rem' }}>Sugestões de perguntas:</h4>
                        <button
                            className="btn btn-secondary"
                            style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '0.5rem' }}
                            onClick={() => setInputValue('Quais são os horários de atendimento?')}
                        >
                            Horários de atendimento
                        </button>
                        <button
                            className="btn btn-secondary"
                            style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '0.5rem' }}
                            onClick={() => setInputValue('Como funciona o sistema?')}
                        >
                            Como funciona
                        </button>
                        <button
                            className="btn btn-secondary"
                            style={{ width: '100%', justifyContent: 'flex-start' }}
                            onClick={() => setInputValue('Preciso falar com um atendente')}
                        >
                            Falar com atendente
                        </button>
                    </div>
                </div>

                <div className={styles.chatContainer}>
                    <div className={styles.chatHeader + ' glass-card'}>
                        <div className={styles.chatHeaderInfo}>
                            <div className={styles.chatHeaderAvatar} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img src="/logo.png" alt="Bot" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0 }}>Assistente Virtual</h3>
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
        </>
    );
}
