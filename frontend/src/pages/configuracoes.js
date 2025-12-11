import Head from 'next/head';
import { useState, useEffect } from 'react';
import styles from '../styles/Dashboard.module.css';
import Sidebar from '../components/Sidebar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function Configuracoes() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [companyId, setCompanyId] = useState(null);
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        contexto_ia: '',
        mensagem_captura: '',
        openai_key: '', // Future use
        business_hours: { start: '09:00', end: '18:00' } // Simulation for now
    });

    useEffect(() => {
        // Obter ID da empresa do localStorage
        const storedCompanyId = localStorage.getItem('company_id');
        const role = localStorage.getItem('user_role');

        if (storedCompanyId && role !== 'super_admin') {
            setCompanyId(storedCompanyId);
            fetchCompanyData(storedCompanyId);
        } else {
            // Se for super admin ou não tiver empresa, redirecionar ou mostrar aviso
            // Por enquanto, vamos carregar a primeira empresa para demonstração se for dev
            setLoading(false);
        }
    }, []);

    const fetchCompanyData = async (id) => {
        try {
            const res = await fetch(`${API_URL}/api/empresas/${id}`);
            const data = await res.json();
            if (data.success) {
                setFormData(prev => ({
                    ...prev,
                    nome: data.data.nome || '',
                    email: data.data.email || '',
                    telefone: data.data.telefone || '',
                    contexto_ia: data.data.contexto_ia || '',
                    mensagem_captura: data.data.mensagem_captura || ''
                }));
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            alert('Erro ao carregar configurações.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`${API_URL}/api/empresas/${companyId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nome: formData.nome,
                    telefone: formData.telefone,
                    contexto_ia: formData.contexto_ia,
                    mensagem_captura: formData.mensagem_captura
                })
            });

            const data = await res.json();
            if (data.success) {
                alert('Configurações salvas com sucesso!');
            } else {
                alert('Erro ao salvar: ' + data.error);
            }
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar configurações.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className={styles.container}><div style={{ padding: '2rem' }}>Carregando...</div></div>;

    return (
        <>
            <Head>
                <title>Configurações - Dilob</title>
            </Head>

            <div className={styles.container}>
                <Sidebar />

                <main className={styles.main}>
                    <div className={styles.header}>
                        <div>
                            <h2>Configurações da Empresa</h2>
                            <p className="text-secondary">Gerencie suas preferências e comportamento da IA</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.contentGrid} style={{ gridTemplateColumns: '1fr', maxWidth: '800px' }}>

                        {/* Dados Gerais */}
                        <div className={styles.sectionCard}>
                            <div className={styles.sectionHeader}>
                                <h3>🏢 Dados Gerais</h3>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Nome da Empresa</label>
                                    <input
                                        type="text"
                                        name="nome"
                                        className="input"
                                        value={formData.nome}
                                        onChange={handleInputChange}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Telefone (WhatsApp Conectado)</label>
                                    <input
                                        type="text"
                                        name="telefone"
                                        className="input"
                                        value={formData.telefone}
                                        onChange={handleInputChange}
                                        placeholder="55..."
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                                    />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginTop: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Email Administrativo</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="input"
                                    value={formData.email}
                                    readOnly
                                    disabled
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-secondary)', cursor: 'not-allowed' }}
                                />
                                <small style={{ color: 'var(--text-tertiary)' }}>Contate o suporte para alterar o email cadastrado.</small>
                            </div>
                        </div>

                        {/* Inteligência Artificial */}
                        <div className={styles.sectionCard}>
                            <div className={styles.sectionHeader}>
                                <h3>🤖 Configuração da Inteligência Artificial</h3>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                                    Prompt do Sistema (Personalidade da IA)
                                </label>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>
                                    Defina como a IA deve se comportar, o nome dela, o tom de voz e as informações básicas sobre sua empresa que ela deve saber para responder aos clientes.
                                </p>
                                <textarea
                                    name="contexto_ia"
                                    value={formData.contexto_ia}
                                    onChange={handleInputChange}
                                    rows="10"
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--bg-primary)',
                                        color: 'var(--text-primary)',
                                        lineHeight: '1.5',
                                        resize: 'vertical'
                                    }}
                                    placeholder="Ex: Você é o assistente virtual da Loja X. Seu nome é Bolt. Responda sempre de forma educada e prestativa..."
                                />
                            </div>
                        </div>

                        {/* Página de Captura */}
                        <div className={styles.sectionCard}>
                            <div className={styles.sectionHeader}>
                                <h3>📝 Página de Captura de Leads</h3>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                                    Mensagem de Boas-Vindas
                                </label>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>
                                    Esta mensagem será exibida na página pública onde novos leads preenchem seus dados. Use quebras de linha para separar parágrafos.
                                </p>
                                <textarea
                                    name="mensagem_captura"
                                    value={formData.mensagem_captura}
                                    onChange={handleInputChange}
                                    rows="5"
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--bg-primary)',
                                        color: 'var(--text-primary)',
                                        lineHeight: '1.5',
                                        resize: 'vertical'
                                    }}
                                    placeholder="Ex: Bem-vindo à nossa escola!\n\nEsta página irá responder todas as suas dúvidas sobre matrículas."
                                />
                            </div>

                            {companyId && (
                                <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                                        🔗 Link da sua página de captura:
                                    </label>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <input
                                            type="text"
                                            readOnly
                                            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/captura/${companyId}`}
                                            style={{
                                                flex: 1,
                                                padding: '0.75rem',
                                                borderRadius: '6px',
                                                border: '1px solid var(--border-color)',
                                                background: 'var(--bg-primary)',
                                                color: 'var(--text-primary)',
                                                fontSize: '0.9rem'
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                navigator.clipboard.writeText(`${window.location.origin}/captura/${companyId}`);
                                                alert('Link copiado!');
                                            }}
                                        >
                                            Copiar
                                        </button>
                                        <a
                                            href={`/captura/${companyId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-ghost"
                                        >
                                            Visualizar
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Botão de Salvar */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                            <button
                                type="button"
                                className="btn btn-destructive"
                                onClick={() => window.history.back()}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={saving}
                                style={{ minWidth: '150px' }}
                            >
                                {saving ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </>
    );
}
