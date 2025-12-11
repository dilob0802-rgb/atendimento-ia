import Head from 'next/head';
import { useState, useEffect } from 'react';
import styles from '../styles/Dashboard.module.css';
import kanbanStyles from '../styles/Kanban.module.css';
import Sidebar from '../components/Sidebar';
import ProtectedRoute from '../components/ProtectedRoute';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Etapas do Kanban
const STAGES = [
    { id: 'novo', label: 'Novo Lead', color: '#3b82f6' },
    { id: 'em_atendimento', label: 'Em Atendimento', color: '#f59e0b' },
    { id: 'qualificado', label: 'Qualificado', color: '#8b5cf6' },
    { id: 'proposta', label: 'Proposta Enviada', color: '#06b6d4' },
    { id: 'fechado', label: 'Fechado', color: '#22c55e' },
    { id: 'perdido', label: 'Perdido', color: '#ef4444' }
];

export default function Atendimento() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ nome: '', telefone: '', email: '' });
    const [saving, setSaving] = useState(false);
    const [companyId, setCompanyId] = useState(null);

    useEffect(() => {
        const storedCompanyId = localStorage.getItem('company_id');
        setCompanyId(storedCompanyId);
        fetchLeads(storedCompanyId);
    }, []);

    const fetchLeads = async (empresaId) => {
        try {
            // Buscar conversas/leads da empresa
            const res = await fetch(`${API_URL}/api/conversas?empresa_id=${empresaId || 'demo'}`);
            const data = await res.json();
            if (data.success) {
                // Mapear conversas para formato de leads com etapas
                const mappedLeads = data.data.map(conv => ({
                    id: conv.id,
                    nome: conv.cliente_nome || 'Cliente sem nome',
                    telefone: conv.cliente_telefone || '',
                    email: conv.cliente_email || '',
                    etapa: conv.status === 'encerrada' ? 'fechado' :
                        conv.status === 'humano' ? 'em_atendimento' : 'novo',
                    created_at: conv.created_at,
                    updated_at: conv.updated_at
                }));
                setLeads(mappedLeads);
            }
        } catch (error) {
            console.error('Erro ao buscar leads:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Criar nova conversa/lead
            const res = await fetch(`${API_URL}/api/chat/mensagem`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    empresa_id: companyId || 'demo',
                    cliente_nome: formData.nome,
                    cliente_telefone: formData.telefone,
                    cliente_email: formData.email,
                    mensagem: 'Olá, gostaria de mais informações.',
                    canal: 'web'
                })
            });

            const data = await res.json();
            if (data.success) {
                // Redirecionar para o chat com este lead
                localStorage.setItem('current_lead', JSON.stringify({
                    nome: formData.nome,
                    telefone: formData.telefone,
                    email: formData.email,
                    conversa_id: data.data.conversa_id
                }));
                window.location.href = '/chat-demo';
            } else {
                alert('Erro ao criar lead: ' + data.error);
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao criar lead.');
        } finally {
            setSaving(false);
        }
    };

    const handleCardClick = (lead) => {
        // Ao clicar em um lead, abre o chat com ele
        localStorage.setItem('current_lead', JSON.stringify(lead));
        window.location.href = '/chat-demo';
    };

    const moveCard = async (leadId, newStage) => {
        // Atualizar etapa do lead localmente
        setLeads(prev => prev.map(lead =>
            lead.id === leadId ? { ...lead, etapa: newStage } : lead
        ));

        try {
            await fetch(`${API_URL}/api/conversas/${leadId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStage })
            });
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            // Reverter em caso de erro (opcional)
        }
    };

    const getLeadsByStage = (stageId) => {
        return leads.filter(lead => lead.etapa === stageId);
    };

    // Drag and Drop Handlers
    const handleDragStart = (e, leadId) => {
        e.dataTransfer.setData('leadId', leadId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, stageId) => {
        e.preventDefault();
        const leadId = e.dataTransfer.getData('leadId');
        if (leadId) {
            moveCard(leadId, stageId);
        }
    };

    return (
        <ProtectedRoute>
            <Head>
                <title>Atendimento - Kanban de Leads</title>
            </Head>

            <div className={styles.container}>
                <Sidebar />

                <main className={styles.main}>
                    <div className={styles.header}>
                        <div>
                            <h2>Atendimento</h2>
                            <p className="text-secondary">Gerencie seus leads e atendimentos</p>
                        </div>
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                            <span>+</span> Novo Lead
                        </button>
                    </div>

                    {/* Kanban Board */}
                    <div className={kanbanStyles.kanbanContainer}>
                        {STAGES.map(stage => (
                            <div
                                key={stage.id}
                                className={kanbanStyles.column}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, stage.id)}
                            >
                                <div className={kanbanStyles.columnHeader} style={{ borderTopColor: stage.color }}>
                                    <h4>{stage.label}</h4>
                                    <span className={kanbanStyles.count}>{getLeadsByStage(stage.id).length}</span>
                                </div>
                                <div className={kanbanStyles.cardList}>
                                    {loading ? (
                                        <div className={kanbanStyles.loading}>Carregando...</div>
                                    ) : (
                                        getLeadsByStage(stage.id).map(lead => (
                                            <div
                                                key={lead.id}
                                                className={kanbanStyles.card}
                                                onClick={() => handleCardClick(lead)}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, lead.id)}
                                            >
                                                <div className={kanbanStyles.cardName}>{lead.nome}</div>
                                                {lead.telefone && (
                                                    <div className={kanbanStyles.cardInfo}>
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                                        {lead.telefone}
                                                    </div>
                                                )}
                                                {lead.email && (
                                                    <div className={kanbanStyles.cardInfo}>
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                                        {lead.email}
                                                    </div>
                                                )}
                                                <div className={kanbanStyles.cardTime}>
                                                    {new Date(lead.updated_at || lead.created_at).toLocaleDateString('pt-BR')}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    {!loading && getLeadsByStage(stage.id).length === 0 && (
                                        <div className={kanbanStyles.empty}>Nenhum lead</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>

            {/* Modal de Novo Lead */}
            {showModal && (
                <div className={kanbanStyles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={kanbanStyles.modal} onClick={e => e.stopPropagation()}>
                        <div className={kanbanStyles.modalHeader}>
                            <h3>Novo Lead</h3>
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
                                    placeholder="Nome do cliente"
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
                                    {saving ? 'Criando...' : 'Criar e Iniciar Atendimento'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </ProtectedRoute>
    );
}
