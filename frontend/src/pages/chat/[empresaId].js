import Head from 'next/head';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/ChatPublico.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ChatPublico() {
    const router = useRouter();
    const { empresaId } = router.query;

    const [empresa, setEmpresa] = useState(null);
    const [currentLead, setCurrentLead] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (empresaId) {
            fetchEmpresa();
            loadLead();
        }
    }, [empresaId]);

    const fetchEmpresa = async () => {
        try {
            const res = await fetch(`${API_URL}/api/empresas/${empresaId}`);
            const data = await res.json();

            if (data.success) {
                setEmpresa(data.data);
            }
        } catch (error) {
            console.error('Erro ao buscar empresa:', error);
        }
    };

    const loadLead = () => {
        const storedLead = localStorage.getItem('current_lead');
        if (storedLead) {
            try {
                const lead = JSON.parse(storedLead);
                setCurrentLead(lead);
                setMessages([{
                    tipo: 'bot',
                    mensagem: `Olá ${lead.nome}! 👋 Sou seu assistente virtual. Como posso ajudar?`,
                    timestamp: new Date()
                }]);
            } catch (e) {
                console.error('Erro ao carregar lead:', e);
            }
        } else {
            setMessages([{
                tipo: 'bot',
                mensagem: 'Olá! 👋 Sou seu assistente virtual. Como posso ajudar?',
                timestamp: new Date()
            }]);
        }
        setInitialLoading(false);
    };

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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    empresa_id: empresaId,
                    cliente_nome: currentLead?.nome || 'Visitante',
                    cliente_telefone: currentLead?.telefone || 'web',
                    cliente_email: currentLead?.email || '',
                    mensagem: inputValue,
                    canal: 'landing'
                })
            });

            const data = await response.json();

            if (data.success) {
                setMessages(prev => [...prev, {
                    tipo: 'bot',
                    mensagem: data.data.resposta,
                    timestamp: new Date()
                }]);
            } else {
                throw new Error('Erro ao enviar mensagem');
            }
        } catch (error) {
            console.error('Erro:', error);
            setMessages(prev => [...prev, {
                tipo: 'bot',
                mensagem: '❌ Desculpe, houve um erro. Por favor, tente novamente.',
                timestamp: new Date()
            }]);
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

    if (initialLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>{empresa?.nome || 'Atendimento'} - Chat</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <div className={styles.container}>
                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.headerLogo}>
                        {empresa?.nome?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div className={styles.headerInfo}>
                        <h1>{empresa?.nome || 'Atendimento'}</h1>
                        <span className={styles.status}>
                            <span className={styles.statusDot}></span>
                            Online
                        </span>
                    </div>
                </header>

                {/* Messages */}
                <div className={styles.messages}>
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`${styles.message} ${msg.tipo === 'cliente' ? styles.messageUser : styles.messageBot}`}
                        >
                            {msg.tipo === 'bot' && (
                                <div className={styles.botAvatar}>🤖</div>
                            )}
                            <div className={styles.messageContent}>
                                <p>{msg.mensagem}</p>
                                <span className={styles.messageTime}>
                                    {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className={`${styles.message} ${styles.messageBot}`}>
                            <div className={styles.botAvatar}>🤖</div>
                            <div className={styles.typing}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className={styles.inputArea}>
                    <input
                        type="text"
                        placeholder="Digite sua mensagem..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={loading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !inputValue.trim()}
                        className={styles.sendBtn}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>

                {/* Footer */}
                <footer className={styles.footer}>
                    Powered by <strong>Dilob</strong>
                </footer>
            </div>
        </>
    );
}
