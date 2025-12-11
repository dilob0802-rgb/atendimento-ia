import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function Login() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Timeout de 10 segundos
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha: password }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('auth_token', data.data.token);
                localStorage.setItem('user_role', data.data.user.role === 'super_admin' ? 'super_admin' : 'client');
                localStorage.setItem('user_name', data.data.user.nome);
                localStorage.setItem('user_email', data.data.user.email);

                if (data.data.user.empresa_id) {
                    localStorage.setItem('company_id', data.data.user.empresa_id);
                } else {
                    localStorage.removeItem('company_id');
                }

                window.location.href = '/dashboard';
            } else {
                setError(data.error || 'Email ou senha inválidos');
            }
        } catch (err) {
            clearTimeout(timeoutId);
            console.error('Erro no login:', err);

            if (err.name === 'AbortError') {
                setError('Tempo esgotado. O servidor não respondeu.');
            } else if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
                setError('Servidor indisponível. Tente novamente mais tarde.');
            } else {
                setError('Email ou senha inválidos');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Login - Dilob</title>
                <meta name="description" content="Acesse sua conta no Dilob" />
            </Head>

            <div className={styles.container}>
                <div className={styles.loginWrapper}>
                    {/* Lado Esquerdo - Slogan e Visual */}
                    <div className={styles.loginVisual}>
                        <div className={styles.logo}>
                            <img src="/logo.png" alt="Dilob Logo" style={{ width: '80px', height: 'auto', marginBottom: '1rem' }} />
                            <h3>Dilob</h3>
                        </div>

                        <div className={styles.heroContent}>
                            <h1 className={styles.heroTitle}>
                                Atendimento <span className={styles.gradient}>Inteligente</span>
                                <br />
                                24/7 com IA
                            </h1>
                            <p className={styles.heroSubtitle}>
                                Sistema completo de atendimento automatizado via WhatsApp e Web Chat.
                                Configure em minutos, atenda milhares de clientes simultaneamente.
                            </p>
                        </div>

                        {/* Elementos decorativos de fundo */}
                        <div className={styles.glowEffect}></div>
                    </div>

                    {/* Lado Direito - Formulário de Login */}
                    <div className={styles.loginFormContainer}>
                        <div className="glass-card" style={{ width: '100%', maxWidth: '420px', padding: '3rem' }}>
                            <div className="text-center mb-4">
                                <h2>Bem-vindo de volta</h2>
                                <p className="text-secondary">Acesse seu painel de controle</p>
                            </div>

                            <form onSubmit={handleLogin}>
                                <div className="input-group">
                                    <label htmlFor="email">Email Corporativo</label>
                                    <input
                                        type="email"
                                        id="email"
                                        className="input"
                                        placeholder="seu@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label htmlFor="password">Senha</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            id="password"
                                            className="input"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            style={{ paddingRight: '3rem' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{
                                                position: 'absolute',
                                                right: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                padding: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                color: 'var(--text-secondary)'
                                            }}
                                            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                        >
                                            {showPassword ? (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                                </svg>
                                            ) : (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                    <circle cx="12" cy="12" r="3"></circle>
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <div style={{
                                        padding: '0.75rem 1rem',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        borderRadius: '8px',
                                        color: '#ef4444',
                                        fontSize: '0.9rem',
                                        marginBottom: '0.5rem'
                                    }}>
                                        {error}
                                    </div>
                                )}

                                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                                    {loading ? (
                                        <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                                    ) : (
                                        'Entrar na Plataforma'
                                    )}
                                </button>
                            </form>

                            <div className="mt-4 text-center">
                                <a href="#" className="text-secondary" style={{ fontSize: '0.9rem', textDecoration: 'none' }}>
                                    Esqueceu sua senha?
                                </a>
                            </div>
                        </div>

                        {/* Credenciais de Teste (Visível apenas em Dev) */}
                        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.85rem' }}>
                            <p style={{ fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>🧪 Credenciais de Teste:</p>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <div style={{ cursor: 'pointer' }} onClick={() => { setEmail('admin@dilob.com'); setPassword('admin123'); setError(''); }}>
                                    <span style={{ color: 'var(--primary-light)', fontWeight: '500' }}>Admin:</span> admin@dilob.com
                                </div>
                                <div style={{ cursor: 'pointer' }} onClick={() => { setEmail('teste@empresa.com'); setPassword('admin123'); setError(''); }}>
                                    <span style={{ color: 'var(--success)', fontWeight: '500' }}>Cliente:</span> teste@empresa.com
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 text-center">
                        <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
                            Não tem uma conta? <a href="#" className="text-primary" style={{ fontWeight: '600', textDecoration: 'none' }}>Fale com vendas</a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
