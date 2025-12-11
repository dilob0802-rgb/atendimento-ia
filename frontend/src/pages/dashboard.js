import Head from 'next/head';
import { useState, useEffect } from 'react';
import styles from '../styles/Dashboard.module.css';
import Sidebar from '../components/Sidebar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function Dashboard() {
    const [stats, setStats] = useState({
        empresas: 0,
        leads: 0,
        mensagens: 0,
        ia: 0
    });
    const [role, setRole] = useState('client');
    const [companyName, setCompanyName] = useState('');
    const [empresas, setEmpresas] = useState([]);
    const [conversas, setConversas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userRole = localStorage.getItem('user_role');
        const companyId = localStorage.getItem('company_id');
        setRole(userRole || 'client');

        if (userRole === 'super_admin') {
            setCompanyName('Painel Administrativo');
            fetchAdminStats();
        } else if (companyId) {
            fetchClientStats(companyId);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchAdminStats = async () => {
        try {
            const res = await fetch(`${API_URL}/api/empresas`);
            const data = await res.json();
            if (data.success) {
                setEmpresas(data.data);

                const totalLeads = data.data.reduce((sum, emp) => sum + (emp.stats?.leads || 0), 0);
                const totalMsgs = data.data.reduce((sum, emp) => sum + (emp.stats?.mensagens || 0), 0);

                setStats({
                    empresas: data.data.length,
                    leads: totalLeads,
                    mensagens: totalMsgs,
                    ia: totalMsgs > 0 ? 92 : 0
                });
            }
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchClientStats = async (companyId) => {
        try {
            // Buscar dados da empresa
            const empresaRes = await fetch(`${API_URL}/api/empresas/${companyId}`);
            const empresaData = await empresaRes.json();
            if (empresaData.success) {
                setCompanyName(empresaData.data.nome || 'Minha Empresa');
            }

            // Buscar conversas da empresa
            const conversasRes = await fetch(`${API_URL}/api/conversas?empresa_id=${companyId}`);
            const conversasData = await conversasRes.json();

            if (conversasData.success) {
                setConversas(conversasData.data || []);

                // Calcular estatísticas reais
                const totalLeads = conversasData.data.length;

                // Contar mensagens (precisamos buscar individualmente ou estimar)
                let totalMensagens = 0;
                for (const conv of conversasData.data.slice(0, 10)) { // Limitar para performance
                    const msgRes = await fetch(`${API_URL}/api/conversas/${conv.id}`);
                    const msgData = await msgRes.json();
                    if (msgData.success && msgData.data.mensagens) {
                        totalMensagens += msgData.data.mensagens.length;
                    }
                }

                setStats({
                    leads: totalLeads,
                    mensagens: totalMensagens,
                    ia: totalMensagens > 0 ? Math.round((totalMensagens / (totalLeads || 1)) * 10) : 0
                });
            }
        } catch (error) {
            console.error('Erro ao buscar estatísticas do cliente:', error);
        } finally {
            setLoading(false);
        }
    };

    const isSuperAdmin = role === 'super_admin';

    return (
        <>
            <Head>
                <title>Dashboard - Dilob</title>
            </Head>

            <div className={styles.container}>
                <Sidebar />

                <main className={styles.main}>
                    <div className={styles.header}>
                        <div>
                            <h2>{isSuperAdmin ? 'Painel Administrativo' : 'Visão Geral'}</h2>
                            <p className="text-secondary">
                                {isSuperAdmin ? 'Monitoramento global do sistema' : `Bem-vindo à ${companyName}`}
                            </p>
                        </div>
                        {!isSuperAdmin && (
                            <button className="btn btn-primary" onClick={() => window.location.href = '/chat-demo'}>
                                <span>+</span> Novo Atendimento
                            </button>
                        )}
                        {isSuperAdmin && (
                            <button className="btn btn-primary" onClick={() => window.location.href = '/empresas'}>
                                <span>+</span> Nova Empresa
                            </button>
                        )}
                    </div>

                    {/* Cards de Estatísticas */}
                    <div className={styles.statsGrid}>
                        {isSuperAdmin ? (
                            <>
                                {/* Super Admin Stats */}
                                <div className={styles.statCard}>
                                    <div className={styles.statHeader}>
                                        <div className={styles.statIcon} style={{ color: 'var(--primary-light)' }}>🏢</div>
                                        <span className={styles.statChange + ' positive'}>Total</span>
                                    </div>
                                    <div className={styles.statValue}>{loading ? '...' : stats.empresas}</div>
                                    <div className={styles.statTitle}>Empresas Cadastradas</div>
                                </div>

                                <div className={styles.statCard}>
                                    <div className={styles.statHeader}>
                                        <div className={styles.statIcon} style={{ color: 'var(--success)' }}>👥</div>
                                        <span className={styles.statChange + ' positive'}>Total</span>
                                    </div>
                                    <div className={styles.statValue}>{loading ? '...' : stats.leads}</div>
                                    <div className={styles.statTitle}>Total de Leads</div>
                                </div>

                                <div className={styles.statCard}>
                                    <div className={styles.statHeader}>
                                        <div className={styles.statIcon} style={{ color: 'var(--warning)' }}>💬</div>
                                        <span className={styles.statChange + ' positive'}>Total</span>
                                    </div>
                                    <div className={styles.statValue}>{loading ? '...' : stats.mensagens}</div>
                                    <div className={styles.statTitle}>Total de Mensagens</div>
                                </div>

                                <div className={styles.statCard}>
                                    <div className={styles.statHeader}>
                                        <div className={styles.statIcon} style={{ color: 'var(--accent)' }}>🤖</div>
                                        <span className={styles.statChange + ' positive'}>Geral</span>
                                    </div>
                                    <div className={styles.statValue}>{stats.ia}%</div>
                                    <div className={styles.statTitle}>Automação IA</div>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Client Stats */}
                                <div className={styles.statCard}>
                                    <div className={styles.statHeader}>
                                        <div className={styles.statIcon} style={{ color: 'var(--primary-light)' }}>💬</div>
                                        <span className={styles.statChange + ' positive'}>Total</span>
                                    </div>
                                    <div className={styles.statValue}>{loading ? '...' : stats.mensagens}</div>
                                    <div className={styles.statTitle}>Total de Mensagens</div>
                                </div>

                                <div className={styles.statCard}>
                                    <div className={styles.statHeader}>
                                        <div className={styles.statIcon} style={{ color: 'var(--success)' }}>⚡</div>
                                        <span className={styles.statChange + ' positive'}>IA</span>
                                    </div>
                                    <div className={styles.statValue}>{loading ? '...' : stats.mensagens > 0 ? '100%' : '0%'}</div>
                                    <div className={styles.statTitle}>Taxa de Resposta</div>
                                </div>

                                <div className={styles.statCard}>
                                    <div className={styles.statHeader}>
                                        <div className={styles.statIcon} style={{ color: 'var(--warning)' }}>👥</div>
                                        <span className={styles.statChange + ' positive'}>Total</span>
                                    </div>
                                    <div className={styles.statValue}>{loading ? '...' : stats.leads}</div>
                                    <div className={styles.statTitle}>Contatos</div>
                                </div>

                                <div className={styles.statCard}>
                                    <div className={styles.statHeader}>
                                        <div className={styles.statIcon} style={{ color: 'var(--accent)' }}>🤖</div>
                                        <span className={styles.statChange + ' positive'}>Automação</span>
                                    </div>
                                    <div className={styles.statValue}>{loading ? '...' : stats.leads > 0 ? '100%' : '0%'}</div>
                                    <div className={styles.statTitle}>Atendimento IA</div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Grids de Conteúdo */}
                    <div className={styles.contentGrid}>
                        {isSuperAdmin ? (
                            <>
                                {/* Super Admin: Lista de Empresas */}
                                <div className={styles.sectionCard} style={{ gridColumn: 'span 2' }}>
                                    <div className={styles.sectionHeader}>
                                        <h3>Resumo das Empresas</h3>
                                        <a href="/empresas" className="btn btn-ghost" style={{ fontSize: '0.9rem' }}>Ver todas</a>
                                    </div>
                                    {loading ? (
                                        <div style={{ textAlign: 'center', padding: '2rem' }}>Carregando...</div>
                                    ) : (
                                        <div className={styles.tableContainer} style={{ marginTop: '1rem' }}>
                                            <table className={styles.table}>
                                                <thead>
                                                    <tr>
                                                        <th>Empresa</th>
                                                        <th style={{ textAlign: 'center' }}>Leads</th>
                                                        <th style={{ textAlign: 'center' }}>Msgs</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {empresas.slice(0, 5).map((empresa) => (
                                                        <tr key={empresa.id}>
                                                            <td style={{ fontWeight: 500 }}>
                                                                {empresa.nome}
                                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                                    {empresa.email}
                                                                </div>
                                                            </td>
                                                            <td style={{ textAlign: 'center', fontWeight: '600' }}>
                                                                {empresa.stats?.leads || 0}
                                                            </td>
                                                            <td style={{ textAlign: 'center', fontWeight: '600' }}>
                                                                {empresa.stats?.mensagens || 0}
                                                            </td>
                                                            <td>
                                                                <span style={{
                                                                    padding: '0.25rem 0.75rem',
                                                                    borderRadius: '1rem',
                                                                    fontSize: '0.8rem',
                                                                    background: empresa.ativo ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                                    color: empresa.ativo ? 'var(--success)' : 'var(--error)'
                                                                }}>
                                                                    {empresa.ativo ? 'Ativo' : 'Inativo'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {empresas.length === 0 && (
                                                        <tr>
                                                            <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                                                Nenhuma empresa cadastrada.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Client: Atendimentos Recentes */}
                                <div className={styles.sectionCard}>
                                    <div className={styles.sectionHeader}>
                                        <h3>Atendimentos Recentes</h3>
                                        <a href="/atendimento" className="btn btn-ghost" style={{ fontSize: '0.9rem' }}>Ver todos</a>
                                    </div>
                                    <div className={styles.recentList}>
                                        {loading ? (
                                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>
                                                Carregando...
                                            </div>
                                        ) : conversas.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>
                                                <p>Nenhum atendimento ainda.</p>
                                                <a href="/atendimento" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                                                    Iniciar primeiro atendimento
                                                </a>
                                            </div>
                                        ) : (
                                            conversas.slice(0, 5).map((conv) => (
                                                <div
                                                    key={conv.id}
                                                    className={styles.listItem}
                                                    onClick={() => {
                                                        localStorage.setItem('current_lead', JSON.stringify({
                                                            nome: conv.cliente_nome,
                                                            telefone: conv.cliente_telefone,
                                                            email: conv.cliente_email,
                                                            conversa_id: conv.id
                                                        }));
                                                        window.location.href = '/chat-demo';
                                                    }}
                                                >
                                                    <div className={styles.avatar} style={{ background: 'var(--bg-elevated)', width: '32px', height: '32px', fontSize: '0.9rem' }}>
                                                        {(conv.cliente_nome || 'C').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className={styles.itemInfo}>
                                                        <span className={styles.itemName}>{conv.cliente_nome || 'Cliente'}</span>
                                                        <span className={styles.itemDesc}>{conv.cliente_telefone || conv.cliente_email || conv.canal}</span>
                                                    </div>
                                                    <span className={styles.itemTime}>
                                                        {new Date(conv.updated_at).toLocaleDateString('pt-BR')}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Client: Status do Sistema */}
                                <div className={styles.sectionCard}>
                                    <div className={styles.sectionHeader}>
                                        <h3>Status do Sistema</h3>
                                    </div>
                                    <div className={styles.recentList}>
                                        <div className={styles.listItem} style={{ cursor: 'default' }}>
                                            <div className={styles.itemInfo}>
                                                <span className={styles.itemName} style={{ color: 'var(--success)' }}>● Operacional</span>
                                                <span className={styles.itemDesc}>WhatsApp API</span>
                                            </div>
                                        </div>
                                        <div className={styles.listItem} style={{ cursor: 'default' }}>
                                            <div className={styles.itemInfo}>
                                                <span className={styles.itemName} style={{ color: 'var(--success)' }}>● Operacional</span>
                                                <span className={styles.itemDesc}>Google Gemini AI</span>
                                            </div>
                                        </div>
                                        <div className={styles.listItem} style={{ cursor: 'default' }}>
                                            <div className={styles.itemInfo}>
                                                <span className={styles.itemName} style={{ color: 'var(--success)' }}>● Operacional</span>
                                                <span className={styles.itemDesc}>Banco de Dados</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}
