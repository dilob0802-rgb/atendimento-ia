import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/Captura.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function Captura() {
    const router = useRouter();
    const { empresaId } = router.query;

    const [empresa, setEmpresa] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ nome: '', telefone: '', email: '' });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (empresaId) {
            fetchEmpresa();
        }
    }, [empresaId]);

    const fetchEmpresa = async () => {
        try {
            const res = await fetch(`${API_URL}/api/empresas/${empresaId}`);
            const data = await res.json();

            if (data.success) {
                setEmpresa(data.data);
            } else {
                setEmpresa(null);
            }
        } catch (error) {
            console.error('Erro ao buscar empresa:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch(`${API_URL}/api/chat/mensagem`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    empresa_id: empresaId,
                    cliente_nome: formData.nome,
                    cliente_telefone: formData.telefone,
                    cliente_email: formData.email,
                    mensagem: 'Olá, gostaria de mais informações.',
                    canal: 'landing'
                })
            });

            const data = await res.json();

            if (data.success) {
                // Salvar dados do lead para usar no chat
                localStorage.setItem('current_lead', JSON.stringify({
                    nome: formData.nome,
                    telefone: formData.telefone,
                    email: formData.email,
                    conversa_id: data.data.conversa_id
                }));
                localStorage.setItem('landing_empresa_id', empresaId);

                setSubmitted(true);

                // Redirecionar para o chat público após 2 segundos
                setTimeout(() => {
                    router.push(`/chat/${empresaId}`);
                }, 2000);
            } else {
                alert('Erro ao enviar: ' + data.error);
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao enviar seus dados. Tente novamente.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Carregando...</p>
            </div>
        );
    }

    if (!empresa) {
        return (
            <div className={styles.errorContainer}>
                <h1>Página não encontrada</h1>
                <p>Esta empresa não existe ou a página está indisponível.</p>
            </div>
        );
    }

    // Mensagem padrão se não configurada
    const welcomeMessage = empresa.mensagem_captura ||
        `Bem-vindo à ${empresa.nome}!\n\nPreencha seus dados abaixo para iniciar uma conversa com nosso assistente virtual.`;

    return (
        <>
            <Head>
                <title>{empresa.nome} - Atendimento</title>
                <meta name="description" content={`Entre em contato com ${empresa.nome}`} />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <div className={styles.container}>
                <div className={styles.background}>
                    <div className={styles.gradientOrb1}></div>
                    <div className={styles.gradientOrb2}></div>
                </div>

                <div className={styles.card}>
                    {/* Logo/Header */}
                    <div className={styles.header}>
                        <div className={styles.logoPlaceholder}>
                            {empresa.nome.charAt(0).toUpperCase()}
                        </div>
                        <h1 className={styles.companyName}>{empresa.nome}</h1>
                    </div>

                    {submitted ? (
                        <div className={styles.successMessage}>
                            <div className={styles.successIcon}>✓</div>
                            <h2>Dados enviados com sucesso!</h2>
                            <p>Você será redirecionado para o atendimento...</p>
                            <div className={styles.spinner}></div>
                        </div>
                    ) : (
                        <>
                            {/* Mensagem de Boas-vindas */}
                            <div className={styles.welcomeMessage}>
                                {welcomeMessage.split('\n').map((line, index) => (
                                    <p key={index}>{line || <br />}</p>
                                ))}
                            </div>

                            {/* Formulário */}
                            <form onSubmit={handleSubmit} className={styles.form}>
                                <div className={styles.inputGroup}>
                                    <label htmlFor="nome">Seu Nome</label>
                                    <input
                                        type="text"
                                        id="nome"
                                        name="nome"
                                        value={formData.nome}
                                        onChange={handleInputChange}
                                        placeholder="Digite seu nome completo"
                                        required
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label htmlFor="telefone">WhatsApp / Telefone</label>
                                    <input
                                        type="tel"
                                        id="telefone"
                                        name="telefone"
                                        value={formData.telefone}
                                        onChange={handleInputChange}
                                        placeholder="(00) 00000-0000"
                                        required
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label htmlFor="email">E-mail</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="seu@email.com"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className={styles.submitBtn}
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <span className={styles.btnSpinner}></span>
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            Iniciar Atendimento
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </form>

                            <p className={styles.privacy}>
                                Seus dados estão seguros e serão usados apenas para atendimento.
                            </p>
                        </>
                    )}
                </div>

                <footer className={styles.footer}>
                    Powered by <strong>Dilob</strong>
                </footer>
            </div>
        </>
    );
}
