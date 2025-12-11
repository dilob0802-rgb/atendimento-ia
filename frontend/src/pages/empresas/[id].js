import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/Dashboard.module.css';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function EditarEmpresa() {
    const router = useRouter();
    const { id } = router.query;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        contexto_ia: '',
        nova_senha: '',
        confirmar_senha: ''
    });

    useEffect(() => {
        if (id) {
            fetchEmpresa();
        }
    }, [id]);

    const fetchEmpresa = async () => {
        try {
            const res = await fetch(`${API_URL}/api/empresas/${id}`);
            const data = await res.json();

            if (data.success) {
                setFormData({
                    nome: data.data.nome || '',
                    email: data.data.email || '',
                    telefone: data.data.telefone || '',
                    contexto_ia: data.data.contexto_ia || '',
                    nova_senha: '',
                    confirmar_senha: ''
                });
            }
        } catch (error) {
            console.error('Erro ao carregar empresa:', error);
            alert('Erro ao carregar dados da empresa.');
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

        // Validar senha se fornecida
        if (formData.nova_senha) {
            if (formData.nova_senha !== formData.confirmar_senha) {
                alert('As senhas não coincidem!');
                return;
            }

            if (formData.nova_senha.length < 6) {
                alert('A senha deve ter no mínimo 6 caracteres.');
                return;
            }
        }

        setSaving(true);

        try {
            const updateData = {
                nome: formData.nome,
                email: formData.email,
                telefone: formData.telefone,
                contexto_ia: formData.contexto_ia
            };

            // Adicionar senha se fornecida
            if (formData.nova_senha) {
                updateData.nova_senha = formData.nova_senha;
            }

            const res = await fetch(`${API_URL}/api/empresas/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            const data = await res.json();

            if (data.success) {
                alert('Empresa atualizada com sucesso!');
                router.push('/empresas');
            } else {
                alert('Erro: ' + data.error);
            }
        } catch (error) {
            console.error('Erro ao atualizar empresa:', error);
            alert('Erro ao atualizar empresa.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <Sidebar />
                <main className={styles.main}>
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando...</div>
                </main>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <Head>
                <title>Editar Empresa - Dilob</title>
            </Head>

            <div className={styles.container}>
                <Sidebar />

                <main className={styles.main}>
                    <div className={styles.header}>
                        <div>
                            <h2>Editar Empresa</h2>
                            <p className="text-secondary">Atualize os dados da empresa e redefina a senha se necessário</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ maxWidth: '800px' }}>
                        {/* Dados da Empresa */}
                        <div className={styles.sectionCard} style={{ marginBottom: '1.5rem' }}>
                            <div className={styles.sectionHeader}>
                                <h3>📋 Dados da Empresa</h3>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                                        Nome da Empresa *
                                    </label>
                                    <input
                                        type="text"
                                        name="nome"
                                        value={formData.nome}
                                        onChange={handleInputChange}
                                        required
                                        className="input"
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                                        WhatsApp
                                    </label>
                                    <input
                                        type="text"
                                        name="telefone"
                                        value={formData.telefone}
                                        onChange={handleInputChange}
                                        placeholder="5511999999999"
                                        className="input"
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                                    Email de Login *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="input"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                                />
                                <small style={{ color: 'var(--text-tertiary)' }}>Este email é usado para login no sistema</small>
                            </div>
                        </div>

                        {/* Redefinir Senha */}
                        <div className={styles.sectionCard} style={{ marginBottom: '1.5rem' }}>
                            <div className={styles.sectionHeader}>
                                <h3>🔒 Redefinir Senha</h3>
                            </div>

                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                Deixe em branco se não quiser alterar a senha
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                                        Nova Senha
                                    </label>
                                    <input
                                        type="password"
                                        name="nova_senha"
                                        value={formData.nova_senha}
                                        onChange={handleInputChange}
                                        placeholder="Mínimo 6 caracteres"
                                        className="input"
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                                        Confirmar Nova Senha
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmar_senha"
                                        value={formData.confirmar_senha}
                                        onChange={handleInputChange}
                                        placeholder="Digite novamente"
                                        className="input"
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Botões */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button
                                type="button"
                                className="btn btn-destructive"
                                onClick={() => router.push('/empresas')}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={saving}
                            >
                                {saving ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </ProtectedRoute>
    );
}
