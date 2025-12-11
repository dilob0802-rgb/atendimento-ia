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
                                                    className="btn btn-ghost"
                                                    style={{ padding: '0.5rem', color: 'var(--error)' }}
                                                    onClick={() => handleDelete(empresa.id)}
                                                >
                                                    🗑️
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
                        <div className={styles.modalOverlay} onClick={(e) => {
                            if (e.target === e.currentTarget) setShowModal(false);
                        }}>
                            <div className={styles.modal}>
                                <div className={styles.modalHeader}>
                                    <h3 className={styles.modalTitle}>Nova Empresa</h3>
                                    <button className={styles.closeButton} onClick={() => setShowModal(false)}>×</button>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className={styles.formGroup}>
                                        <label>Nome da Empresa</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            name="nome"
                                            value={formData.nome}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Ex: Minha Loja"
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Email Administrativo</label>
                                        <input
                                            type="email"
                                            className={styles.input}
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="admin@empresa.com"
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Telefone (WhatsApp)</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            name="telefone"
                                            value={formData.telefone}
                                            onChange={handleInputChange}
                                            placeholder="5511999999999"
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Contexto da IA (System Prompt)</label>
                                        <textarea
                                            className={styles.input}
                                            name="contexto_ia"
                                            value={formData.contexto_ia}
                                            onChange={handleInputChange}
                                            rows="3"
                                            placeholder="Descreva como a IA deve se comportar..."
                                            style={{ resize: 'vertical' }}
                                        />
                                    </div>

                                    <div className={styles.modalFooter}>
                                        <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                                            Cancelar
                                        </button>
                                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                                            {submitting ? 'Salvando...' : 'Criar Empresa'}
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
