# 🚀 Guia de Deploy Gratuito

## 🎯 Visão Geral
Este guia mostra como fazer deploy **100% GRATUITO** do sistema completo.

---

## 📦 Arquitetura de Deploy

```
Frontend (Vercel) ← API calls → Backend (Render.com)
                                      ↓
                              Supabase (PostgreSQL)
                                      ↓
                              Google Gemini AI
                                      ↓
                              Evolution API (Render.com)
```

---

## 🎨 Deploy do Frontend (Vercel)

### Gratuito e Ilimitado! ✅

### Passo 1: Preparar o Projeto

Crie um arquivo `.env.local` na pasta `frontend`:

```env
NEXT_PUBLIC_API_URL=https://SEU-BACKEND.onrender.com
```

### Passo 2: Push para GitHub

```bash
# Na raiz do projeto
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/atendimento-ia.git
git push -u origin main
```

### Passo 3: Deploy na Vercel

1. Acesse: https://vercel.com
2. Faça login com GitHub
3. Clique em **"Add New Project"**
4. Selecione o repositório
5. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Environment Variables**:
     - `NEXT_PUBLIC_API_URL` = URL do backend (configurar depois)
6. Clique em **"Deploy"**

✅ Em ~2 minutos seu frontend estará online!

Exemplo: `https://atendimento-ia.vercel.app`

---

## ⚙️ Deploy do Backend (Render.com)

### Plano Gratuito: 750 horas/mês ✅

### Passo 1: Preparar o Projeto

Crie `backend/package.json` com script de start:

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "node --watch src/server.js"
  }
}
```

### Passo 2: Criar Web Service

1. Acesse: https://render.com
2. Faça login/cadastro (gratuito)
3. Clique em **"New +"** → **"Web Service"**
4. Conecte seu GitHub
5. Selecione o repositório

### Passo 3: Configurar

- **Name**: atendimento-ia-backend
- **Root Directory**: `backend`
- **Environment**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Free

### Passo 4: Variáveis de Ambiente

Adicione no Render:

```env
PORT=3001
SUPABASE_URL=sua_url_supabase
SUPABASE_KEY=sua_chave_supabase
GEMINI_API_KEY=sua_chave_gemini
JWT_SECRET=sua_chave_jwt_aleatoria
NODE_ENV=production
```

**Para WhatsApp (opcional):**
```env
EVOLUTION_API_URL=https://sua-evolution-api.onrender.com
EVOLUTION_API_KEY=sua_chave_evolution
```

### Passo 5: Deploy

Clique em **"Create Web Service"**

⏳ Aguarde 5-10 minutos...

✅ URL gerada: `https://atendimento-ia-backend.onrender.com`

---

## 🔄 Atualizar Frontend com URL do Backend

1. Na Vercel, vá em seu projeto
2. **Settings** → **Environment Variables**
3. Edite `NEXT_PUBLIC_API_URL`:
   ```
   https://atendimento-ia-backend.onrender.com
   ```
4. Clique em **"Save"**
5. Vá em **"Deployments"**
6. Clique nos 3 pontinhos → **"Redeploy"**

---

## 📱 Deploy da Evolution API (Opcional)

### Para WhatsApp

1. No Render, crie outro **Web Service**
2. Use repositório: `EvolutionAPI/evolution-api`
3. Configure:
   - **Name**: evolution-api
   - **Environment**: Docker
   - **Plan**: Free
   - **Environment Variables**:
     - `AUTHENTICATION_API_KEY` = chave_segura_aqui
     - `PORT` = 8080

4. Deploy!

URL: `https://evolution-api-xxx.onrender.com`

---

## 🧪 Testar Deploy

### 1. Testar Backend
```bash
curl https://atendimento-ia-backend.onrender.com
```

Deve retornar JSON com status "online"

### 2. Testar Frontend
Acesse: `https://atendimento-ia.vercel.app`

### 3. Testar Chat
Acesse: `https://atendimento-ia.vercel.app/chat-demo`

---

## 💰 Custos Estimados

| Serviço | Plano | Custo |
|---------|-------|-------|
| Vercel (Frontend) | Free | R$ 0 |
| Render (Backend) | Free | R$ 0 |
| Render (Evolution) | Free | R$ 0 |
| Supabase | Free | R$ 0 |
| Google Gemini | Free | R$ 0 |
| **TOTAL** | | **R$ 0/mês** |

### ⚠️ Limitações do Plano Gratuito

**Render.com:**
- ⏸️ Serviço "dorme" após 15 min de inatividade
- ⏰ Primeira requisição pode demorar ~30 segundos
- 🔄 Solução: use um "ping" a cada 10 minutos

**Vercel:**
- ✅ Sem limitações práticas para projetos pessoais

**Supabase:**
- 📦 500MB de storage
- 📊 50k requisições/mês
- ✅ Suficiente para começar!

---

## 🔧 Manter Backend Ativo (Evitar Sleep)

### Opção 1: Cron Job Gratuito

Use **cron-job.org** (gratuito):

1. Acesse: https://cron-job.org
2. Cadastre-se
3. Crie um job:
   - **URL**: `https://seu-backend.onrender.com`
   - **Interval**: Every 10 minutes
4. Salve!

### Opção 2: UptimeRobot

1. Acesse: https://uptimerobot.com
2. Adicione monitor HTTP
3. URL: seu backend
4. Intervalo: 5 minutos

---

## 🔒 Segurança em Produção

### 1. Variáveis de Ambiente
✅ Nunca commite `.env` para GitHub
✅ Use variáveis de ambiente nos serviços

### 2. CORS
Configure CORS no backend para permitir apenas seu domínio:

```javascript
app.use(cors({
  origin: 'https://atendimento-ia.vercel.app'
}));
```

### 3. Rate Limiting
Implementar limite de requisições (próxima versão)

---

## 📊 Monitoramento

### Logs
- **Render**: Dashboard → Logs
- **Vercel**: Dashboard → Deployment → Logs

### Métricas
- **Supabase**: Dashboard → Database → Stats
- **Render**: Dashboard → Metrics

---

## 🔄 CI/CD Automático

### Já está configurado! ✅

Toda vez que você fizer push para GitHub:
1. Vercel redeploy automaticamente 
2. Render redeploy automaticamente

```bash
git add .
git commit -m "Nova feature"
git push

# Deploy automático!
```

---

## 🆙 Upgrade para Plans Pagos (Futuro)

Quando seu negócio crescer:

| Serviço | Plano Pago | Custo | Benefícios |
|---------|-----------|-------|------------|
| Render | Starter | $7/mês | Sem sleep, mais recursos |
| Supabase | Pro | $25/mês | 8GB storage, 5M requisições |
| Vercel | Pro | $20/mês | Analytics, mais builds |

Mas comece no **gratuito**! 🎉

---

## ✅ Checklist Final

- [ ] Frontend deployado na Vercel
- [ ] Backend deployado no Render
- [ ] Variáveis de ambiente configuradas
- [ ] Banco Supabase criado e populado
- [ ] Chat funcionando
- [ ] (Opcional) Evolution API deployada
- [ ] (Opcional) Uptime monitor configurado

---

## 🎯 Próximos Passos

1. ✅ Compartilhe o link com clientes
2. ✅ Personalize o contexto da IA
3. ✅ Configure domínio próprio (opcional)
4. ✅ Monitore uso e performance

Parabéns pelo deploy! 🚀🎉
