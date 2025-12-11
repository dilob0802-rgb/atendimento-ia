import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function ProtectedRoute({ children }) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Apenas no cliente, verificar autenticação
        const token = localStorage.getItem('auth_token');

        if (!token) {
            // Se não estiver logado, redireciona para o login
            router.push('/');
        } else {
            // Se estiver logado, permite acesso
            setIsAuthenticated(true);
        }

        setIsLoading(false);
    }, [router]);

    // Durante o carregamento inicial (SSR + primeira checagem), mostra loading
    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: 'var(--bg-primary)'
            }}>
                <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }}></div>
            </div>
        );
    }

    // Se não está autenticado, não renderiza nada (já está redirecionando)
    if (!isAuthenticated) {
        return null;
    }

    // Se está autenticado, renderiza o conteúdo protegido
    return <>{children}</>;
}
