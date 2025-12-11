-- =============================================
-- MIGRAÇÃO: Adicionar campos faltantes
-- Execute este SQL no Supabase SQL Editor
-- =============================================

-- 1. Adicionar campo cliente_email na tabela conversas (se não existir)
ALTER TABLE conversas ADD COLUMN IF NOT EXISTS cliente_email TEXT;

-- 2. Adicionar campo mensagem_captura na tabela empresas (para landing page)
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS mensagem_captura TEXT;

-- 3. Verificar se a coluna 'conteudo' existe em mensagens (alguns sistemas usam 'mensagem')
-- Se sua tabela usa 'mensagem' ao invés de 'conteudo', descomente a linha abaixo:
-- ALTER TABLE mensagens RENAME COLUMN mensagem TO conteudo;

-- 4. Criar índices para melhor performance (opcional mas recomendado)
CREATE INDEX IF NOT EXISTS idx_conversas_empresa_id ON conversas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_conversas_cliente_telefone ON conversas(cliente_telefone);
CREATE INDEX IF NOT EXISTS idx_mensagens_conversa_id ON mensagens(conversa_id);

-- 5. Garantir que as tabelas essenciais existam:

-- Tabela EMPRESAS (se não existir)
CREATE TABLE IF NOT EXISTS empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefone TEXT,
    contexto_ia TEXT DEFAULT 'Seja cordial e prestativo.',
    mensagem_captura TEXT,
    configuracoes JSONB DEFAULT '{}',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela CONVERSAS (se não existir)
CREATE TABLE IF NOT EXISTS conversas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    cliente_nome TEXT DEFAULT 'Cliente',
    cliente_telefone TEXT,
    cliente_email TEXT,
    canal TEXT DEFAULT 'web',
    status TEXT DEFAULT 'ativa',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela MENSAGENS (se não existir)
CREATE TABLE IF NOT EXISTS mensagens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversa_id UUID REFERENCES conversas(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL, -- 'cliente' ou 'bot'
    conteudo TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger nas tabelas
DROP TRIGGER IF EXISTS update_empresas_updated_at ON empresas;
CREATE TRIGGER update_empresas_updated_at
    BEFORE UPDATE ON empresas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversas_updated_at ON conversas;
CREATE TRIGGER update_conversas_updated_at
    BEFORE UPDATE ON conversas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Habilitar RLS (Row Level Security) - Opcional mas recomendado para produção
-- ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE conversas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE mensagens ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PRONTO! Seu banco de dados está configurado.
-- =============================================
