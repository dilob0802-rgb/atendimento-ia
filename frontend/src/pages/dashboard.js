import Head from 'next/head';
import styles from '../styles/Dashboard.module.css';

export default function Dashboard() {
    return (
        <>
            <Head>
                <title>Dashboard - Atendimento IA</title>
            </Head>

            <div className={styles.container}>
                {/* Sidebar */}
                <aside className={styles.sidebar}>
                    <div className={styles.logo}>
                        <div className={styles.logoIcon}>🤖</div>
                        <h3>Atendimento IA</h3>
                    </div>

                    <nav className={styles.nav}>
                        <a href="/dashboard" className={`${styles.navItem} ${styles.active}`}>
                            <span className={styles.navItemIcon}>📊</span>
                            <span>Dashboard</span>
                        </a>
                        <a href="/chat-demo" className={styles.navItem}>
                            <span className={styles.navItemIcon}>💬</span>
                            <span>Atendimento</span>
                        </a>
                        <a href="#" className={styles.navItem}>
                            <span className={styles.navItemIcon}>👥</span>
                            <span>Contatos</span>
                        </a>
                        <a href="/conexoes" className={styles.navItem}>
                            <span className={styles.navItemIcon}>📱</span>
                            <span>Conexões</span>
                        </a>
                        <a href="#" className={styles.navItem}>
                            <span className={styles.navItemIcon}>⚙️</span>
                            <span>Configurações</span>
                        </a>
                    </nav>

                    <div className={styles.userProfile}>
                        <div className={styles.avatar}>D</div>
                        <div className={styles.userInfo}>
                            <h4>Diogo</h4>
                            <span>Admin</span>
                        </div>
                    </div>
                </aside>

                {/* Área Principal */}
                <main className={styles.main}>
                    <div className={styles.header}>
                        <div>
                            <h2>Visão Geral</h2>
                            <p className="text-secondary">Acompanhe seus atendimentos em tempo real</p>
                        </div>
                        <button className="btn btn-primary">
                            <span>+</span> Novo Atendimento
                        </button>
                    </div>

                    {/* Cards de Estatísticas */}
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statHeader}>
                                <div className={styles.statIcon} style={{ color: 'var(--primary-light)' }}>💬</div>
                                <span className={styles.statChange + ' positive'}>+12%</span>
                            </div>
                            <div className={styles.statValue}>1,234</div>
                            <div className={styles.statTitle}>Total de Mensagens</div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statHeader}>
                                <div className={styles.statIcon} style={{ color: 'var(--success)' }}>⚡</div>
                                <span className={styles.statChange + ' positive'}>+5%</span>
                            </div>
                            <div className={styles.statValue}>98%</div>
                            <div className={styles.statTitle}>Taxa de Resposta</div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statHeader}>
                                <div className={styles.statIcon} style={{ color: 'var(--warning)' }}>👥</div>
                                <span className={styles.statChange + ' positive'}>+28</span>
                            </div>
                            <div className={styles.statValue}>450</div>
                            <div className={styles.statTitle}>Novos Contatos</div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statHeader}>
                                <div className={styles.statIcon} style={{ color: 'var(--accent)' }}>🤖</div>
                                <span className={styles.statChange + ' negative'}>-2%</span>
                            </div>
                            <div className={styles.statValue}>85%</div>
                            <div className={styles.statTitle}>Automação IA</div>
                        </div>
                    </div>

                    {/* Grids de Conteúdo */}
                    <div className={styles.contentGrid}>
                        {/* Atendimentos Recentes */}
                        <div className={styles.sectionCard}>
                            <div className={styles.sectionHeader}>
                                <h3>Atendimentos Recentes</h3>
                                <a href="/chat-demo" className="btn btn-ghost" style={{ fontSize: '0.9rem' }}>Ver todos</a>
                            </div>
                            <div className={styles.recentList}>
                                <div className={styles.listItem}>
                                    <div className={styles.avatar} style={{ background: 'var(--bg-elevated)', width: '32px', height: '32px', fontSize: '0.9rem' }}>JS</div>
                                    <div className={styles.itemInfo}>
                                        <span className={styles.itemName}>João Silva</span>
                                        <span className={styles.itemDesc}>Re: Dúvida sobre preços...</span>
                                    </div>
                                    <span className={styles.itemTime}>2 min</span>
                                </div>
                                <div className={styles.listItem}>
                                    <div className={styles.avatar} style={{ background: 'var(--bg-elevated)', width: '32px', height: '32px', fontSize: '0.9rem' }}>MA</div>
                                    <div className={styles.itemInfo}>
                                        <span className={styles.itemName}>Maria Almeida</span>
                                        <span className={styles.itemDesc}>Agendamento confirmado</span>
                                    </div>
                                    <span className={styles.itemTime}>15 min</span>
                                </div>
                                <div className={styles.listItem}>
                                    <div className={styles.avatar} style={{ background: 'var(--bg-elevated)', width: '32px', height: '32px', fontSize: '0.9rem' }}>CC</div>
                                    <div className={styles.itemInfo}>
                                        <span className={styles.itemName}>Carlos Costa</span>
                                        <span className={styles.itemDesc}>Preciso de ajuda com...</span>
                                    </div>
                                    <span className={styles.itemTime}>1h</span>
                                </div>
                            </div>
                        </div>

                        {/* Status do Sistema */}
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
                    </div>
                </main>
            </div>
        </>
    );
}
