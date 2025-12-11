import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styles from '../styles/Dashboard.module.css';

export default function Sidebar() {
    const router = useRouter();
    const isActive = (path) => router.pathname === path ? styles.active : '';
    const [role, setRole] = useState('client');

    useEffect(() => {
        const userRole = localStorage.getItem('user_role');
        setRole(userRole || 'client');
    }, []);

    const isSuperAdmin = role === 'super_admin';

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <img src="/logo.png" alt="Dilob" style={{ width: '32px', height: 'auto', marginRight: '0.5rem' }} />
                <h3>Dilob</h3>
            </div>

            <nav className={styles.nav}>
                <a href="/dashboard" className={`${styles.navItem} ${isActive('/dashboard')}`}>
                    <span className={styles.navItemIcon}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                    </span>
                    <span>Dashboard</span>
                </a>

                {/* Menu do Super Admin - Apenas Empresas */}
                {isSuperAdmin && (
                    <a href="/empresas" className={`${styles.navItem} ${isActive('/empresas')}`}>
                        <span className={styles.navItemIcon}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"></path><path d="M5 21V7l8-4 8 4v14"></path><path d="M17 21v-8.5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0-.5.5V21"></path><path d="M9 9h0"></path><path d="M9 13h0"></path><path d="M9 17h0"></path></svg>
                        </span>
                        <span>Empresas</span>
                    </a>
                )}

                {/* Menu do Cliente - Painel Individual */}
                {!isSuperAdmin && (
                    <>
                        <a href="/atendimento" className={`${styles.navItem} ${isActive('/atendimento')}`}>
                            <span className={styles.navItemIcon}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                            </span>
                            <span>Atendimento</span>
                        </a>
                        <a href="/contatos" className={`${styles.navItem} ${isActive('/contatos')}`}>
                            <span className={styles.navItemIcon}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            </span>
                            <span>Contatos</span>
                        </a>
                        <a href="/conexoes" className={`${styles.navItem} ${isActive('/conexoes')}`}>
                            <span className={styles.navItemIcon}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                            </span>
                            <span>Conexões</span>
                        </a>
                        <a href="/configuracoes" className={`${styles.navItem} ${isActive('/configuracoes')}`}>
                            <span className={styles.navItemIcon}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                            </span>
                            <span>Configurações</span>
                        </a>
                    </>
                )}
            </nav>

            <div className={styles.userProfile}>
                <div className={styles.avatar}>{isSuperAdmin ? 'A' : 'E'}</div>
                <div className={styles.userInfo}>
                    <h4>{isSuperAdmin ? 'Administrador' : 'Empresa'}</h4>
                    <span>{isSuperAdmin ? 'Super Admin' : 'Cliente'}</span>
                </div>
            </div>
        </aside>
    );
}
