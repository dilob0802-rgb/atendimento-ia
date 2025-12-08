# 🚀 Guia Completo: Testando o Sistema de Verdade

Este guia vai te ajudar a configurar e testar todas as funcionalidades do sistema.

---

## ✅ ETAPA 1: Verificar o Backend

### 1.1 Parar todos os processos antigos
Feche TODOS os terminais abertos e abra um novo.

### 1.2 Iniciar o Backend
```powershell
cd "c:\Users\diogo\Downloads\workspace antigravity\Atendimento\backend"
npm run dev
```

### 1.3 Verificar se está funcionando
Deve aparecer:
```
✅ Supabase conectado com sucesso!
✅ Servidor rodando em http://localhost:3001
```

Se aparecer erro de porta em uso (`EADDRINUSE`), execute:
```powershell
netstat -ano | findstr :3001
# Pegue o número do PID e execute:
taskkill /PID [NUMERO_DO_PID] /F
# Depois tente npm run dev novamente
```

---

## ✅ ETAPA 2: Testar a IA (Gemini)

### 2.1 Testar via terminal
Com o backend rodando, abra OUTRO terminal e execute:

```powershell
$body = @{
    empresa_id = "5746604b-c179-43aa-b633-8002c55fd826"
    cliente_nome = "Teste"
    cliente_telefone = "11999999999"
    mensagem = "Ola, quais servicos voces oferecem?"
    canal = "web"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/chat/mensagem" -Method Post -ContentType "application/json" -Body $body
```

### 2.2 Resultado esperado
Se a IA estiver funcionando, você verá algo como:
```json
{
    "success": true,
    "data": {
        "conversa_id": "...",
        "resposta": "Olá! Fico feliz em ajudar..."
    }
}
```

Se aparecer "Desculpe, tive um problema...", verifique:
- A chave GEMINI_API_KEY está correta no arquivo .env?
- Você reiniciou o backend após alterar o .env?

---

## ✅ ETAPA 3: Iniciar o Frontend

### 3.1 Abrir outro terminal
```powershell
cd "c:\Users\diogo\Downloads\workspace antigravity\Atendimento\frontend"
npm run dev
```

### 3.2 Acessar no navegador
Abra: http://localhost:3000

- Faça login (qualquer email/senha)
- Você será redirecionado para o Dashboard
- Clique em "Atendimento" para testar o chat com IA

---

## ✅ ETAPA 4: Configurar WhatsApp (Evolution API)

### 4.1 Instalar Docker Desktop

1. Acesse: https://www.docker.com/products/docker-desktop/
2. Clique em "Download for Windows"
3. Execute o instalador
4. Reinicie o computador após a instalação
5. Abra o Docker Desktop e aguarde ele iniciar (ícone fica verde)

### 4.2 Instalar Evolution API

Após o Docker estar rodando, abra o PowerShell e execute:

```powershell
docker run -d --name evolution-api `
  -p 8080:8080 `
  -e AUTHENTICATION_API_KEY=sua_chave_super_secreta_aqui `
  atendai/evolution-api:latest
```

### 4.3 Verificar se está rodando
```powershell
docker ps
```
Deve mostrar o container "evolution-api" rodando.

### 4.4 Configurar no .env do backend

Edite o arquivo `backend/.env` e atualize:
```
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=sua_chave_super_secreta_aqui
```

### 4.5 Reiniciar o backend
Pare (Ctrl+C) e inicie novamente:
```powershell
npm run dev
```

---

## ✅ ETAPA 5: Conectar WhatsApp de Verdade

### 5.1 Acessar a página de conexões
1. Vá para http://localhost:3000
2. Faça login
3. Clique em "Conexões" no menu lateral
4. Clique em "Conectar WhatsApp"

### 5.2 Escanear o QR Code
1. Abra o WhatsApp no seu celular
2. Vá em Configurações > Aparelhos Conectados
3. Toque em "Conectar um aparelho"
4. Escaneie o QR Code que apareceu na tela

### 5.3 Pronto!
Após escanear, o status mudará para "Conectado".
Agora as mensagens recebidas no WhatsApp serão respondidas pela IA!

---

## 🔧 Resumo das Portas

| Serviço        | Porta | URL                        |
|----------------|-------|----------------------------|
| Frontend       | 3000  | http://localhost:3000      |
| Backend        | 3001  | http://localhost:3001      |
| Evolution API  | 8080  | http://localhost:8080      |

---

## ❓ Problemas Comuns

### Erro: EADDRINUSE (porta em uso)
```powershell
netstat -ano | findstr :PORTA
taskkill /PID [NUMERO] /F
```

### Erro: IA não responde
1. Verifique a chave GEMINI_API_KEY no .env
2. Reinicie o backend após alterar

### Erro: Docker não inicia
1. Verifique se a virtualização está ativada na BIOS
2. Reinicie o computador

### Erro: WhatsApp não conecta
1. Verifique se o Docker está rodando
2. Verifique se a Evolution API está ativa: `docker ps`
3. Verifique as variáveis no .env

---

## 📞 Ordem de Inicialização

1. Docker Desktop (primeiro, aguarde ficar verde)
2. Evolution API (docker run...)
3. Backend (npm run dev na pasta backend)
4. Frontend (npm run dev na pasta frontend)

Boa sorte! 🎉
