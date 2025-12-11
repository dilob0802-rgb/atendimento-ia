# =============================================
# GUIA DE DEPLOY - Sistema de Atendimento IA
# =============================================

## Opção 1: Render (Backend) + Vercel (Frontend) - GRATUITO

### PASSO 1: Deploy do Backend no Render

1. Acesse https://render.com e crie uma conta
2. Clique em "New +" → "Web Service"
3. Conecte seu GitHub e selecione o repositório
4. Configure:
   - **Name**: atendimento-api
   - **Root Directory**: backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   
5. Adicione as variáveis de ambiente:
   - `SUPABASE_URL` = (sua URL do Supabase)
   - `SUPABASE_KEY` = (sua chave do Supabase)
   - `GEMINI_API_KEY` = (sua chave do Google Gemini)
   - `JWT_SECRET` = (uma chave secreta qualquer)
   - `NODE_ENV` = production

6. Clique em "Create Web Service"
7. Aguarde o deploy e copie a URL gerada (ex: https://atendimento-api.onrender.com)

---

### PASSO 2: Deploy do Frontend na Vercel

1. Acesse https://vercel.com e crie uma conta
2. Clique em "Add New" → "Project"
3. Importe seu repositório do GitHub
4. Configure:
   - **Root Directory**: frontend
   - **Framework Preset**: Next.js
   
5. Adicione a variável de ambiente:
   - `NEXT_PUBLIC_API_URL` = (URL do backend no Render, ex: https://atendimento-api.onrender.com)

6. Clique em "Deploy"
7. Aguarde e você terá sua URL (ex: https://seu-projeto.vercel.app)

---

## Opção 2: Railway - Tudo em um lugar

1. Acesse https://railway.app e crie uma conta
2. Clique em "New Project" → "Deploy from GitHub"
3. Selecione o repositório

### Para o Backend:
- Root Directory: `backend`
- Adicione as variáveis de ambiente (mesmas do Render)

### Para o Frontend:
- Root Directory: `frontend`
- Adicione: `NEXT_PUBLIC_API_URL` = URL do backend

---

## VARIÁVEIS DE AMBIENTE NECESSÁRIAS

### Backend:
```
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua_chave_secreta
GEMINI_API_KEY=sua_chave_gemini
JWT_SECRET=uma_chave_secreta_longa
NODE_ENV=production
PORT=3001
```

### Frontend:
```
NEXT_PUBLIC_API_URL=https://sua-api.onrender.com
```

---

## CHECKLIST ANTES DO DEPLOY

- [ ] Execute o SQL de migração no Supabase (supabase_migration.sql)
- [ ] Execute o SQL de usuários no Supabase (supabase_usuarios.sql)
- [ ] Teste localmente se o login está funcionando
- [ ] Faça commit de todas as alterações
- [ ] Suba para o GitHub

---

## URLs APÓS DEPLOY

| Serviço | URL |
|---------|-----|
| Frontend | https://seu-projeto.vercel.app |
| Backend API | https://seu-projeto.onrender.com |
| Supabase | https://seu-projeto.supabase.co |

---

## TESTANDO O DEPLOY

1. Acesse a URL do frontend
2. Faça login com:
   - **Admin**: admin@dilob.com / admin123
   - **Cliente**: teste@empresa.com / admin123
3. Teste as funcionalidades

---

## PROBLEMAS COMUNS

### "Erro de conexão com o servidor"
- Verifique se a variável NEXT_PUBLIC_API_URL está correta
- Verifique se o backend está rodando (acesse a URL da API diretamente)

### "Email ou senha inválidos"
- Execute o SQL de criação de usuários no Supabase

### "Empresa não encontrada"
- Verifique se SUPABASE_URL e SUPABASE_KEY estão corretos no backend
