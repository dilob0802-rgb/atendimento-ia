import Head from 'next/head';
import { useState, useEffect } from 'react';
import styles from '../styles/Dashboard.module.css';
import Sidebar from '../components/Sidebar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function Empresas() {
    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        contexto_ia: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchEmpresas();
    }, []);

    const fetchEmpresas = async () => {
        try {
            const res = await fetch(`${API_URL}/api/empresas`);
            const data = await res.json();
            if (data.success) {
                setEmpresas(data.data);
            }
        } catch (error) {
            console.error('Erro ao buscar empresas:', error);
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
        setSubmitting(true);

        try {
            const res = await fetch(`${API_URL}/api/empresas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (data.success) {
                setShowModal(false);
                setFormData({ nome: '', email: '', telefone: '', contexto_ia: '' });
                fetchEmpresas();
                alert('Empresa cadastrada com sucesso!');
            } else {
                alert('Erro: ' + data.error);
            }
        } catch (error) {
            console.error('Erro ao criar empresa:', error);
            alert('Erro ao criar empresa.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza que deseja remover esta empresa?')) return;

        try {
            const res = await fetch(`${API_URL}/api/empresas/${id}`, {
                method: 'DELETE'
            });
            const data = await res.json();

            if (data.success) {
                fetchEmpresas();
            } else {
                alert('Erro ao remover: ' + data.error);
            }
        } catch (error) {
            console.error('Erro:', error);
        }
    };

    return (
        <>
            <Head>
                <title>Gestão de Empresas - Dilob</title>
            </Head>

            <div className={styles.container}>
                <Sidebar />

                <main className={styles.main}>
                    <div className={styles.header}>
                        <div>
                            <h2>Gestão de Empresas</h2>
                            <p className="text-secondary">Cadastre e gerencie as organizações do sistema</p>
                        </div>
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                            <span>+</span> Nova Empresa
                        </button>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>Carregando...</div>
                    ) : (
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Nome</th>
                                        <th>Email</th>
                                        <th style={{ textAlign: 'center' }}>Leads</th>
                                        <th style={{ textAlign: 'center' }}>Msgs</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'right' }}>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {empresas.map((empresa) => (
                                        <tr key={empresa.id}>
                                            <td style={{ fontWeight: 500 }}>
                                                {empresa.nome}
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                    {empresa.telefone || '-'}
                                                </div>
                                            </td>
                                            <td>{empresa.email}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span style={{ fontWeight: '600' }}>{empresa.stats?.leads || 0}</span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span style={{ fontWeight: '600' }}>{empresa.stats?.mensagens || 0}</span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '1rem',
                                                        fontSize: '0.8rem',
                                                        background: empresa.ativo ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                        color: empresa.ativo ? 'var(--success)' : 'var(--error)',
                                                        width: 'fit-content'
                                                    }}>
                                                        {empresa.ativo ? 'Ativo' : 'Inativo'}
                                                    </span>
                                                    {empresa.stats?.ultima_interacao && (
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                                            Última: {new Date(empresa.stats.ultima_interacao).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button
                                                    className="btn btn-destructive"
                                                    style={{ padding: '0.5rem' }}
                                                    onClick={() => handleDelete(empresa.id)}
                                                    title="Excluir Empresa"
                                                >
                                                    <span style={{ color: 'white' }}>🗑️</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {empresas.length === 0 && (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                                Nenhuma empresa cadastrada.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {showModal && (
                        <div style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.6)',
                            backdropFilter: 'blur(4px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '1rem'
                        }} onClick={(e) => {
                            if (e.target === e.currentTarget) setShowModal(false);
                        }}>
                            <div style={{
                                background: 'var(--bg-secondary)',
                                borderRadius: '16px',
                                width: '100%',
                                maxWidth: '480px',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                border: '1px solid var(--border-color)',
                                overflow: 'hidden'
                            }}>
                                {/* Header */}
                                <div style={{
                                    padding: '1.5rem',
                                    borderBottom: '1px solid var(--border-color)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>Nova Empresa</h3>
                                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                            Cadastre uma nova organização
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        style={{
                                            background: 'var(--bg-tertiary)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            width: '36px',
                                            height: '36px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--text-secondary)',
                                            fontSize: '1.25rem',
                                            transition: 'all 0.2s'
                                        }}
                                    >×</button>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                                    <div style={{ marginBottom: '1.25rem' }}>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '0.5rem',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            Nome da Empresa *
                                        </label>
                                        <input
                                            type="text"
                                            name="nome"
                                            value={formData.nome}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Ex: Loja do João"
                                            style={{
                                                width: '100%',
                                                padding: '0.875rem 1rem',
                                                borderRadius: '10px',
                                                border: '1px solid var(--border-color)',
                                                background: 'var(--bg-primary)',
                                                color: 'var(--text-primary)',
                                                fontSize: '0.95rem',
                                                transition: 'border-color 0.2s'
                                            }}
                                        />
                                    </div>

                                    <div style={{ marginBottom: '1.25rem' }}>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '0.5rem',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            Email do Administrador *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="admin@empresa.com"
                                            style={{
                                                width: '100%',
                                                padding: '0.875rem 1rem',
                                                borderRadius: '10px',
                                                border: '1px solid var(--border-color)',
                                                background: 'var(--bg-primary)',
                                                color: 'var(--text-primary)',
                                                fontSize: '0.95rem'
                                            }}
                                        />
                                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                            Este será o email de login do cliente
                                        </p>
                                    </div>

                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '0.5rem',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            WhatsApp (Opcional)
                                        </label>
                                        <input
                                            type="text"
                                            name="telefone"
                                            value={formData.telefone}
                                            onChange={handleInputChange}
                                            placeholder="5511999999999"
                                            style={{
                                                width: '100%',
                                                padding: '0.875rem 1rem',
                                                borderRadius: '10px',
                                                border: '1px solid var(--border-color)',
                                                background: 'var(--bg-primary)',
                                                color: 'var(--text-primary)',
                                                fontSize: '0.95rem'
                                            }}
                                        />
                                    </div>

                                    {/* Info Box */}
                                    <div style={{
                                        padding: '1rem',
                                        background: 'rgba(59, 130, 246, 0.1)',
                                        border: '1px solid rgba(59, 130, 246, 0.2)',
                                        borderRadius: '10px',
                                        marginBottom: '1.5rem'
                                    }}>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            💡 O cliente poderá configurar a <strong>personalidade da IA</strong> e outras opções na página de <strong>Configurações</strong> após o cadastro.
                                        </p>
                                    </div>

                                    {/* Buttons */}
                                    <div style={{
                                        display: 'flex',
                                        gap: '1rem',
                                        justifyContent: 'flex-end'
                                    }}>
                                        <button
                                            type="button"
                                            className="btn btn-destructive"
                                            onClick={() => setShowModal(false)}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={submitting}
                                        >
                                            {submitting ? 'Criando...' : '🚀 Criar Empresa'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
