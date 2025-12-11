import Head from 'next/head';
import { useState, useEffect } from 'react';
import styles from '../styles/Conexoes.module.css';
import Sidebar from '../components/Sidebar';
import ProtectedRoute from '../components/ProtectedRoute';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function Conexoes() {
    const [whatsappStatus, setWhatsappStatus] = useState('disconnected'); // connected, disconnected, pending
    const [qrCode, setQrCode] = useState(null);
    const [loading, setLoading] = useState(false);

    // Função para gerar QR Code
    const gerarQRCode = async () => {
        setLoading(true);
        setWhatsappStatus('pending');

        try {
            const response = await fetch(`${API_URL}/api/whatsapp/qrcode`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ instanceName: 'empresa-demo' })
            });

            const data = await response.json();

            if (data.success && data.data.qrcode) {
                setQrCode(data.data.qrcode);
            } else {
                // Simula QR Code para demonstração
                setQrCode('DEMO_QR_CODE');
            }
        } catch (error) {
            console.error('Erro ao gerar QR Code:', error);
            // Simula QR Code para demonstração
            setQrCode('DEMO_QR_CODE');
        } finally {
            setLoading(false);
        }
    };

    // Função para desconectar
    const desconectar = () => {
        setWhatsappStatus('disconnected');
        setQrCode(null);
    };

    // Check status periodically
    useEffect(() => {
        let interval;
        if (whatsappStatus === 'pending' || whatsappStatus === 'disconnected') {
            interval = setInterval(async () => {
                try {
                    const response = await fetch(`${API_URL}/api/whatsapp/status/empresa-demo`);
                    const data = await response.json();

                    if (data.status === 'connected') {
                        setWhatsappStatus('connected');
                        setQrCode(null);
                    }
                } catch (error) {
                    // Ignora erros de rede no polling
                }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [whatsappStatus]);

    return (
        <ProtectedRoute>
            <Head>
                <title>Conexões - Dilob</title>
            </Head>

            <div className={styles.container}>
                <Sidebar />

                {/* Main Content */}
                <main className={styles.main}>
                    <div className={styles.header}>
                        <h2>Conexões de Canais</h2>
                        <p className="text-secondary">Conecte seus canais de atendimento para receber mensagens</p>
                    </div>

                    <div className={styles.connectionGrid}>
                        {/* WhatsApp Card */}
                        <div className={styles.connectionCard}>
                            <div className={styles.connectionIcon}>📱</div>
                            <h3>WhatsApp Business</h3>
                            <p>Conecte seu WhatsApp para atender clientes automaticamente com IA.</p>

                            {/* Status Badge */}
                            <div className={`${styles.statusBadge} ${whatsappStatus === 'connected' ? styles.statusConnected :
                                whatsappStatus === 'pending' ? styles.statusPending :
                                    styles.statusDisconnected
                                }`}>
                                <span>●</span>
                                {whatsappStatus === 'connected' && 'Conectado'}
                                {whatsappStatus === 'pending' && 'Aguardando leitura...'}
                                {whatsappStatus === 'disconnected' && 'Desconectado'}
                            </div>

                            {/* QR Code Area */}
                            {whatsappStatus === 'pending' && qrCode && (
                                <div className={styles.qrCodeContainer}>
                                    {qrCode === 'DEMO_QR_CODE' ? (
                                        <div className={styles.qrCodePlaceholder}>
                                            <div style={{ textAlign: 'center', color: '#333' }}>
                                                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📷</div>
                                                <div style={{ fontSize: '0.85rem' }}>QR Code Demo</div>
                                                <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                                    Conectará em 10s...
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <img
                                            src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`}
                                            alt="QR Code WhatsApp"
                                            className={styles.qrCodeImage}
                                        />
                                    )}
                                </div>
                            )}

                            {/* Connected Message */}
                            {whatsappStatus === 'connected' && (
                                <div style={{ marginBottom: '1.5rem', color: 'var(--success)' }}>
                                    ✅ WhatsApp conectado e pronto para receber mensagens!
                                </div>
                            )}

                            {/* Buttons */}
                            {whatsappStatus === 'disconnected' && (
                                <button
                                    className="btn btn-primary"
                                    onClick={gerarQRCode}
                                    disabled={loading}
                                >
                                    {loading ? 'Gerando...' : '🔗 Conectar WhatsApp'}
                                </button>
                            )}

                            {whatsappStatus === 'connected' && (
                                <button
                                    className="btn btn-secondary"
                                    onClick={desconectar}
                                >
                                    Desconectar
                                </button>
                            )}

                            {/* Instructions */}
                            {whatsappStatus === 'pending' && (
                                <div className={styles.instructions}>
                                    <h4>📋 Como conectar:</h4>
                                    <ol>
                                        <li>Abra o WhatsApp no seu celular</li>
                                        <li>Toque em <strong>Menu</strong> ou <strong>Configurações</strong></li>
                                        <li>Toque em <strong>Aparelhos conectados</strong></li>
                                        <li>Toque em <strong>Conectar um aparelho</strong></li>
                                        <li>Aponte a câmera para o QR Code acima</li>
                                    </ol>
                                </div>
                            )}
                        </div>

                        {/* Web Chat Card */}
                        <div className={styles.connectionCard}>
                            <div className={styles.connectionIcon}>🌐</div>
                            <h3>Chat no Site</h3>
                            <p>Adicione um widget de chat ao seu site para atender visitantes com IA.</p>

                            <div className={`${styles.statusBadge} ${styles.statusConnected}`}>
                                <span>●</span> Sempre Ativo
                            </div>

                            <div className={styles.instructions} style={{ marginBottom: '1.5rem' }}>
                                <h4>📋 Como usar:</h4>
                                <ol>
                                    <li>Copie o código do widget abaixo</li>
                                    <li>Cole antes do fechamento da tag <code>&lt;/body&gt;</code> no seu site</li>
                                    <li>Pronto! O chat aparecerá automaticamente</li>
                                </ol>
                            </div>

                            <button className="btn btn-secondary">
                                📋 Copiar Código do Widget
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
