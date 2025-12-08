import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';

export default function Login() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulação de login por enquanto
        setTimeout(() => {
            setLoading(false);
            router.push('/dashboard');
        }, 1500);
    };

    return (
        <>
            <Head>
                <title>Login - Atendimento IA</title>
                <meta name="description" content="Acesse sua conta no Atendimento IA" />
            </Head>

            <div className={styles.container}>
                <div className={styles.loginWrapper}>
                    {/* Lado Esquerdo - Slogan e Visual */}
                    <div className={styles.loginVisual}>
                        <div className={styles.logo}>
                            <div className={styles.logoIcon}>🤖</div>
                            <h3>Atendimento IA</h3>
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
                                    <input
                                        type="password"
                                        id="password"
                                        className="input"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

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

                        <div className="mt-4 text-center">
                            <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
                                Não tem uma conta? <a href="#" className="text-primary" style={{ fontWeight: '600', textDecoration: 'none' }}>Fale com vendas</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
