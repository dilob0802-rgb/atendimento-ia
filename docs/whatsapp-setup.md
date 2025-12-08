# 📱 Guia de Integração WhatsApp

## 🎯 Visão Geral
Este guia explica como integrar o WhatsApp usando **Evolution API** (gratuito e open source).

---

## ⚙️ O que é Evolution API?

A Evolution API é uma solução open source que permite conectar o WhatsApp ao seu sistema via API REST.

**Características:**
- ✅ 100% Gratuito e Open Source
- ✅ Suporta múltiplas instâncias (várias empresas)
- ✅ Webhooks para receber mensagens
- ✅ Fácil de configurar
- ⚠️ Não é oficial do WhatsApp

**GitHub:** https://github.com/EvolutionAPI/evolution-api

---

## 🚀 Opção 1: Rodar Localmente (Desenvolvimento)

### Requisitos
- Docker instalado OU Node.js 18+

### Passo 1: Instalar via Docker (Recomendado)

```bash
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY=minha_chave_secreta_123 \
  atendai/evolution-api:latest
```

### Passo 2: Verificar se está rodando
Acesse: http://localhost:8080

Deve ver: `{"status":"online"}`

### Passo 3: Configurar no Backend

Edite o arquivo `backend/.env`:

```env
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=minha_chave_secreta_123
```

---

## 🌐 Opção 2: Deploy Gratuito (Produção)

### Usando Render.com (Recomendado)

1. **Fork do Projeto**
   - Acesse: https://github.com/EvolutionAPI/evolution-api
   - Clique em **"Fork"**

2. **Criar Serviço no Render**
   - Acesse: https://render.com
   - Faça login/cadastro (gratuito)
   - Clique em **"New +"** → **"Web Service"**
   - Conecte seu GitHub
   - Selecione o repositório da Evolution API

3. **Configurar Variáveis**
   - **Name**: evolution-api
   - **Environment**: Docker
   - **Plan**: Free
   - **Environment Variables**:
     - `AUTHENTICATION_API_KEY` = sua_chave_segura

4. **Deploy**
   - Clique em **"Create Web Service"**
   - Aguarde ~5 minutos
   - Copie a URL gerada (ex: https://evolution-api-xxx.onrender.com)

5. **Configurar no Backend**
   ```env
   EVOLUTION_API_URL=https://evolution-api-xxx.onrender.com
   EVOLUTION_API_KEY=sua_chave_segura
   ```

---

## 📲 Conectando WhatsApp

### Passo 1: Criar Instância

Faça uma requisição POST para criar uma instância:

```bash
curl -X POST http://localhost:8080/instance/create \
  -H "apikey: minha_chave_secreta_123" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "empresa-demo",
    "qrcode": true,
    "integration": "WHATSAPP-BAILEYS"
  }'
```

**Ou use Postman/Insomnia** para fazer a requisição.

### Passo 2: Obter QR Code

```bash
curl http://localhost:8080/instance/connect/empresa-demo \
  -H "apikey: minha_chave_secreta_123"
```

Resposta terá um campo `qrcode` com a imagem base64.

### Passo 3: Escanear QR Code

1. Abra o WhatsApp no celular
2. Vá em **Aparelhos Conectados**
3. Clique em **"Conectar um aparelho"**
4. Escaneie o QR Code retornado pela API

✅ **Conectado!** Seu WhatsApp está integrado.

---

## 🔗 Configurar Webhook

Para receber mensagens automaticamente:

```bash
curl -X POST http://localhost:8080/webhook/set/empresa-demo \
  -H "apikey: minha_chave_secreta_123" \
  -H "Content-Type: application/json" \
  -d '{
    "webhook": {
      "url": "http://SEU-BACKEND/api/whatsapp/webhook",
      "enabled": true,
      "events": ["messages.upsert"]
    }
  }'
```

**Importante:** 
- Substitua `SEU-BACKEND` pela URL pública do seu backend
- Para desenvolvimento local, use **ngrok** ou **localtunnel**

---

## 🧪 Testando Envio de Mensagem

```bash
curl -X POST http://localhost:8080/message/sendText/empresa-demo \
  -H "apikey: minha_chave_secreta_123" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "text": "Olá! Esta é uma mensagem de teste."
  }'
```

---

## 💾 Banco de Dados - Associar Instância à Empresa

No Supabase, atualize a empresa:

```sql
UPDATE empresas 
SET whatsapp_instance = 'empresa-demo'
WHERE nome = 'Empresa Demo';
```

Agora as mensagens do WhatsApp serão associadas a esta empresa!

---

## 🔄 Fluxo Completo

```
1. Cliente envia mensagem WhatsApp
   ↓
2. Evolution API recebe a mensagem
   ↓
3. Webhook chama: POST /api/whatsapp/webhook
   ↓
4. Backend identifica a empresa pela instância
   ↓
5. IA processa e gera resposta
   ↓
6. Backend responde via Evolution API
   ↓
7. Cliente recebe resposta no WhatsApp
```

---

## 📱 Interface Web para QR Code (Próxima Versão)

Planejado: página admin para escanear QR Code diretamente no navegador.

Por enquanto, use:
- Postman
- Insomnia
- Ou endpoint de teste no backend

---

## ⚠️ Avisos Importantes

### Risco de Bloqueio
A Evolution API usa WhatsApp Web (não oficial). Há risco de bloqueio da conta.

**Recomendações:**
- Use número comercial separado
- Evite enviar spam
- Respeite limites de mensagens (max ~100/dia)
- Para produção séria, considere **WhatsApp Business API oficial**

### Alternativa Oficial
**WhatsApp Business API** via:
- Twilio
- 360Dialog
- Meta diretamente

Mais confiável, mas tem custos.

---

## 🆘 Problemas Comuns

### ❌ QR Code expirou
**Solução:** Gere um novo QR Code (Passo 2)

### ❌ WhatsApp desconectou
**Solução:** Reconecte escaneando novo QR Code

### ❌ Webhook não funciona
**Solução:**
1. Verifique se a URL é pública (não localhost)
2. Use ngrok para desenvolvimento local
3. Confirme que o endpoint está respondendo

---

## 🎯 Próximos Passos

1. ✅ Conecte uma instância de teste
2. ✅ Envie mensagens manualmente
3. ✅ Configure webhook
4. ✅ Teste atendimento automático
5. ✅ Adicione múltiplas empresas

Bom desenvolvimento! 📱✨
