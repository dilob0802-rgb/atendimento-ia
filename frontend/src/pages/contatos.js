import Head from 'next/head';
import { useState, useEffect } from 'react';
import styles from '../styles/Dashboard.module.css';
import contatosStyles from '../styles/Contatos.module.css';
import kanbanStyles from '../styles/Kanban.module.css';
import Sidebar from '../components/Sidebar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function Contatos() {
    const [contatos, setContatos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedContato, setSelectedContato] = useState(null);
    const [mensagens, setMensagens] = useState([]);
    const [loadingMensagens, setLoadingMensagens] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ nome: '', telefone: '', email: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchContatos();
    }, []);

    const fetchContatos = async () => {
        try {
            const companyId = localStorage.getItem('company_id');
            const res = await fetch(`${API_URL}/api/conversas?empresa_id=${companyId || 'demo'}`);
            const data = await res.json();

            if (data.success) {
                // Agrupar por cliente (telefone único)
                const contatosMap = {};
                data.data.forEach(conv => {
                    const key = conv.cliente_telefone || conv.id;
                    if (!contatosMap[key]) {
                        contatosMap[key] = {
                            id: key,
                            nome: conv.cliente_nome || 'Cliente sem nome',
                            telefone: conv.cliente_telefone || '',
                            email: conv.cliente_email || '',
                            conversas: [],
                            total_mensagens: 0,
                            ultima_interacao: conv.updated_at
                        };
                    }
                    contatosMap[key].conversas.push(conv);
                    contatosMap[key].total_mensagens += conv.total_mensagens || 0;

                    // Atualizar última interação se mais recente
                    if (new Date(conv.updated_at) > new Date(contatosMap[key].ultima_interacao)) {
                        contatosMap[key].ultima_interacao = conv.updated_at;
                    }
                });

                setContatos(Object.values(contatosMap));
            }
        } catch (error) {
            console.error('Erro ao buscar contatos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectContato = async (contato) => {
        setSelectedContato(contato);
        setLoadingMensagens(true);

        try {
            // Buscar mensagens de todas as conversas deste contato
            const allMensagens = [];

            for (const conv of contato.conversas) {
                const res = await fetch(`${API_URL}/api/conversas/${conv.id}`);
                const data = await res.json();

                if (data.success && data.data.mensagens) {
                    allMensagens.push(...data.data.mensagens.map(m => ({
                        ...m,
                        conversa_id: conv.id
                    })));
                }
            }

            // Ordenar por data
            allMensagens.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            setMensagens(allMensagens);
        } catch (error) {
            console.error('Erro ao buscar mensagens:', error);
        } finally {
            setLoadingMensagens(false);
        }
    };

    const filteredContatos = contatos.filter(c =>
        c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.telefone.includes(searchTerm) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const companyId = localStorage.getItem('company_id');

            // Criar nova conversa/lead
            const res = await fetch(`${API_URL}/api/chat/mensagem`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    empresa_id: companyId || 'demo',
                    cliente_nome: formData.nome,
                    cliente_telefone: formData.telefone,
                    cliente_email: formData.email,
                    mensagem: 'Contato adicionado manualmente.',
                    canal: 'manual'
                })
            });

            const data = await res.json();
            if (data.success) {
                setShowModal(false);
                setFormData({ nome: '', telefone: '', email: '' });
                fetchContatos(); // Recarregar lista
            } else {
                alert('Erro ao criar contato: ' + data.error);
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao criar contato.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Head>
                <title>Contatos - Dilob</title>
            </Head>

            <div className={styles.container}>
                <Sidebar />

                <main className={styles.main}>
                    <div className={styles.header}>
                        <div>
                            <h2>Contatos</h2>
                            <p className="text-secondary">Gerencie seus leads e histórico de conversas</p>
                        </div>
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                            <span>+</span> Novo Contato
                        </button>
                    </div>

                    <div className={contatosStyles.layout}>
                        {/* Lista de Contatos */}
                        <div className={contatosStyles.listPanel}>
                            <div className={contatosStyles.searchBox}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <path d="M21 21l-4.35-4.35"></path>
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Buscar contato..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className={contatosStyles.list}>
                                {loading ? (
                                    <div className={contatosStyles.loading}>Carregando contatos...</div>
                                ) : filteredContatos.length === 0 ? (
                                    <div className={contatosStyles.empty}>
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="9" cy="7" r="4"></circle>
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                        </svg>
                                        <p>Nenhum contato encontrado</p>
                                    </div>
                                ) : (
                                    filteredContatos.map(contato => (
                                        <div
                                            key={contato.id}
                                            className={`${contatosStyles.contactCard} ${selectedContato?.id === contato.id ? contatosStyles.active : ''}`}
                                            onClick={() => handleSelectContato(contato)}
                                        >
                                            <div className={contatosStyles.avatar}>
                                                {contato.nome.charAt(0).toUpperCase()}
                                            </div>
                                            <div className={contatosStyles.info}>
                                                <div className={contatosStyles.name}>{contato.nome}</div>
                                                <div className={contatosStyles.phone}>{contato.telefone || contato.email || 'Sem contato'}</div>
                                            </div>
                                            <div className={contatosStyles.meta}>
                                                <span className={contatosStyles.badge}>{contato.conversas.length} conv.</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Detalhes do Contato */}
                        <div className={contatosStyles.detailPanel}>
                            {selectedContato ? (
                                <>
                                    <div className={contatosStyles.detailHeader}>
                                        <div className={contatosStyles.avatarLarge}>
                                            {selectedContato.nome.charAt(0).toUpperCase()}
                                        </div>
                                        <div className={contatosStyles.detailInfo}>
                                            <h3>{selectedContato.nome}</h3>
                                            <div className={contatosStyles.contactDetails}>
                                                {selectedContato.telefone && (
                                                    <span>
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                                        </svg>
                                                        {selectedContato.telefone}
                                                    </span>
                                                )}
                                                {selectedContato.email && (
                                                    <span>
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                                            <polyline points="22,6 12,13 2,6"></polyline>
                                                        </svg>
                                                        {selectedContato.email}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={contatosStyles.statsRow}>
                                        <div className={contatosStyles.stat}>
                                            <span className={contatosStyles.statValue}>{selectedContato.conversas.length}</span>
                                            <span className={contatosStyles.statLabel}>Conversas</span>
                                        </div>
                                        <div className={contatosStyles.stat}>
                                            <span className={contatosStyles.statValue}>{mensagens.length}</span>
                                            <span className={contatosStyles.statLabel}>Mensagens</span>
                                        </div>
                                        <div className={contatosStyles.stat}>
                                            <span className={contatosStyles.statValue}>
                                                {formatDate(selectedContato.ultima_interacao).split(' ')[0]}
                                            </span>
                                            <span className={contatosStyles.statLabel}>Última Interação</span>
                                        </div>
                                    </div>

                                    <div className={contatosStyles.messagesSection}>
                                        <h4>Histórico de Conversas</h4>
                                        <div className={contatosStyles.messagesList}>
                                            {loadingMensagens ? (
                                                <div className={contatosStyles.loading}>Carregando mensagens...</div>
                                            ) : mensagens.length === 0 ? (
                                                <div className={contatosStyles.emptyMessages}>Nenhuma mensagem encontrada</div>
                                            ) : (
                                                mensagens.map((msg, index) => (
                                                    <div
                                                        key={index}
                                                        className={`${contatosStyles.message} ${msg.tipo === 'cliente' ? contatosStyles.messageUser : contatosStyles.messageBot}`}
                                                    >
                                                        <div className={contatosStyles.messageContent}>
                                                            {msg.conteudo}
                                                        </div>
                                                        <div className={contatosStyles.messageTime}>
                                                            {formatDate(msg.created_at)}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className={contatosStyles.noSelection}>
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="9" cy="7" r="4"></circle>
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                    </svg>
                                    <h3>Selecione um contato</h3>
                                    <p>Clique em um contato à esquerda para ver os detalhes e histórico de conversas</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Modal de Novo Contato */}
            {showModal && (
                <div className={kanbanStyles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={kanbanStyles.modal} onClick={e => e.stopPropagation()}>
                        <div className={kanbanStyles.modalHeader}>
                            <h3>Novo Contato</h3>
                            <button className={kanbanStyles.closeBtn} onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className={kanbanStyles.formGroup}>
                                <label>Nome *</label>
                                <input
                                    type="text"
                                    name="nome"
                                    value={formData.nome}
                                    onChange={handleInputChange}
                                    placeholder="Nome do contato"
                                    required
                                    className="input"
                                />
                            </div>
                            <div className={kanbanStyles.formGroup}>
                                <label>Telefone *</label>
                                <input
                                    type="tel"
                                    name="telefone"
                                    value={formData.telefone}
                                    onChange={handleInputChange}
                                    placeholder="(00) 00000-0000"
                                    required
                                    className="input"
                                />
                            </div>
                            <div className={kanbanStyles.formGroup}>
                                <label>E-mail</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="email@exemplo.com"
                                    className="input"
                                />
                            </div>
                            <div className={kanbanStyles.formActions}>
                                <button type="button" className="btn btn-destructive" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Salvando...' : 'Adicionar Contato'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
