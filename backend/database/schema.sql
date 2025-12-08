-- Schema do Banco de Dados para Sistema de Atendimento com IA
-- Execute este SQL no Supabase SQL Editor

-- Tabela de Empresas (Multi-tenant)
CREATE TABLE empresas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefone VARCHAR(50),
  contexto_ia TEXT DEFAULT 'Seja cordial, prestativo e profissional no atendimento.',
  whatsapp_instance VARCHAR(100),
  configuracoes JSONB DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Conversas
CREATE TABLE conversas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  cliente_nome VARCHAR(255) NOT NULL,
  cliente_telefone VARCHAR(50),
  cliente_email VARCHAR(255),
  canal VARCHAR(20) DEFAULT 'web', -- web, whatsapp
  status VARCHAR(20) DEFAULT 'ativa', -- ativa, finalizada, aguardando
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Mensagens
CREATE TABLE mensagens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversa_id UUID REFERENCES conversas(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL, -- cliente, bot, humano
  mensagem TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_conversas_empresa ON conversas(empresa_id);
CREATE INDEX idx_conversas_status ON conversas(status);
CREATE INDEX idx_conversas_updated ON conversas(updated_at DESC);
CREATE INDEX idx_mensagens_conversa ON mensagens(conversa_id);
CREATE INDEX idx_mensagens_created ON mensagens(created_at);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para empresas
CREATE TRIGGER update_empresas_updated_at
  BEFORE UPDATE ON empresas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para conversas
CREATE TRIGGER update_conversas_updated_at
  BEFORE UPDATE ON conversas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Inserir empresa de exemplo
INSERT INTO empresas (nome, email, telefone, contexto_ia) 
VALUES (
  'Empresa Demo',
  'contato@empresademo.com',
  '11999999999',
  'Você é um assistente virtual da Empresa Demo. Seja cordial, responda de forma clara e ajude o cliente da melhor forma possível. Se não souber a resposta, seja honesto e ofereça transferir para um atendente humano.'
);

-- Comentários nas tabelas
COMMENT ON TABLE empresas IS 'Empresas clientes do sistema (multi-tenant)';
COMMENT ON TABLE conversas IS 'Conversas entre clientes e o sistema de IA';
COMMENT ON TABLE mensagens IS 'Mensagens individuais dentro de cada conversa';
