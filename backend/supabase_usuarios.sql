-- =============================================
-- SQL PARA CRIAR TABELA DE USUÁRIOS
-- Execute no Supabase SQL Editor
-- =============================================

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    role TEXT DEFAULT 'client', -- 'super_admin', 'admin', 'client'
    empresa_id UUID REFERENCES empresas(id) ON DELETE SET NULL,
    ativo BOOLEAN DEFAULT true,
    ultimo_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca por email
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
CREATE TRIGGER update_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- CRIAR USUÁRIO ADMIN PADRÃO
-- Senha: admin123
-- =============================================

-- Hash bcrypt para 'admin123': $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
INSERT INTO usuarios (nome, email, senha_hash, role, ativo)
VALUES (
    'Administrador',
    'admin@dilob.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'super_admin',
    true
) ON CONFLICT (email) DO NOTHING;

-- =============================================
-- CRIAR USUÁRIO DE TESTE (vinculado a uma empresa)
-- Senha: teste123
-- =============================================

-- Primeiro garantir que existe uma empresa de teste
INSERT INTO empresas (id, nome, email, telefone, contexto_ia, ativo)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Empresa Teste',
    'contato@empresateste.com',
    '5511999999999',
    'Você é o assistente virtual da Empresa Teste. Seja educado e prestativo.',
    true
) ON CONFLICT DO NOTHING;

-- Hash bcrypt para 'teste123': $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.QKXC1HQ7bLN3f.QKXC
INSERT INTO usuarios (nome, email, senha_hash, role, empresa_id, ativo)
VALUES (
    'Usuário Teste',
    'teste@empresa.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'client',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    true
) ON CONFLICT (email) DO NOTHING;

-- =============================================
-- PRONTO! Usuários criados:
-- 
-- ADMIN:
--   Email: admin@dilob.com
--   Senha: admin123
--   Role: super_admin
--
-- CLIENTE:
--   Email: teste@empresa.com
--   Senha: admin123
--   Role: client
--   Empresa: Empresa Teste
-- =============================================
