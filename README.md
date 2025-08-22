# Web Justice UI - Frontend Independente

Frontend independente para o sistema Web Justice, separado do backend FastAPI.

## 🚀 Arquitetura

Este projeto é o **frontend independente** do Web Justice, que se comunica diretamente com o backend FastAPI via HTTP/HTTPS. 

### Separação Completa
- ✅ **Frontend**: Next.js standalone (esta pasta)
- ✅ **Backend**: FastAPI (`web-justice-v0/services/api_gateway_v2/`)
- ✅ **Comunicação**: HTTP direto com autenticação Bearer token
- ✅ **Deploy**: Domínios separados (`ui.seudominio.com` + `api.seudominio.com`)

## 🛠️ Desenvolvimento

### Pré-requisitos
- Node.js 18+
- Backend FastAPI rodando na porta 8000

### Instalação
```bash
npm install
```

### Desenvolvimento Local
```bash
# Frontend apenas
npm run dev
# Acessa: http://localhost:3000

# Backend deve estar rodando em separado:
# cd ../web-justice-v0 && docker-compose up api-gateway-v2
```

### Build
```bash
npm run build
npm start
```

## 🐳 Docker

### Build e Run
```bash
# Build da imagem
docker build -t web-justice-ui .

# Run standalone
docker run -p 3000:3000 web-justice-ui

# Ou usar docker-compose
docker-compose up
```

### Docker Compose
```bash
# Frontend independente
docker-compose up

# Para conectar com backend local, garanta que FastAPI esteja rodando:
# cd ../web-justice-v0 && docker-compose up api-gateway-v2
```

## ⚙️ Configuração

### Variáveis de Ambiente

Copie `.env.example` para `.env.local` e configure:

```env
# Backend FastAPI URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Para produção
# NEXT_PUBLIC_API_URL=https://api.seudominio.com/api
```

### Ambientes

- **Desenvolvimento**: `http://localhost:8000/api`
- **Produção**: `https://api.seudominio.com/api`

## 🔗 APIs Utilizadas

Todas as APIs foram migradas para comunicação direta com FastAPI:

- ✅ `POST /api/auth/login` - Login de usuários
- ✅ `POST /api/auth/register` - Registro de usuários  
- ✅ `GET /api/searches` - Listar buscas
- ✅ `POST /api/searches` - Criar busca
- ✅ `GET /api/searches/{id}/download` - Download de resultados
- ✅ `POST /api/admin/users` - Criar usuários (admin)
- ✅ `POST /api/extract-text` - Extração de texto
- ✅ `GET/POST /api/tokens` - Gerenciar tokens

### Autenticação
```javascript
// Todas as requisições usam Bearer token
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

## 📁 Estrutura do Projeto

```
web-justice-ui/
├── src/
│   ├── app/                     # Páginas Next.js (SEM /api)
│   │   ├── (dashboard)/         # Dashboard protegido
│   │   ├── layout.tsx           # Layout principal
│   │   └── page.tsx             # Página inicial
│   ├── context/                 # Context do React
│   │   └── AuthContext.tsx      # Autenticação
│   └── lib/
│       └── api.ts               # Cliente HTTP para FastAPI
├── public/                      # Assets estáticos
├── package.json                 # Apenas deps frontend
├── Dockerfile                   # Build independente
├── docker-compose.yml           # Container standalone
├── .env.local                   # Configurações locais
└── README.md                    # Esta documentação
```

## 🔄 Migração Realizada

### Removido do Frontend
- ❌ Rotas `/api/*` do Next.js (8 rotas deletadas)
- ❌ Dependências backend: `bcrypt`, `pg`, `npm-run-all`
- ❌ Scripts backend: `dev:api`, `start:api`
- ❌ Comunicação via rede Docker interna

### Adicionado/Modificado
- ✅ Comunicação HTTP direta com FastAPI
- ✅ Autenticação via Bearer token
- ✅ Configuração de ambiente dinâmica
- ✅ Build independente (Dockerfile próprio)
- ✅ CORS configurado no backend

## 🚀 Deploy

### VPS com Domínios Separados

**Frontend** (`ui.seudominio.com`):
```bash
# Build e deploy do frontend
docker build -t web-justice-ui .
docker run -d -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.seudominio.com/api \
  web-justice-ui
```

**Backend** (`api.seudominio.com`):
```bash
# Deploy do FastAPI em separado
cd ../web-justice-v0
docker-compose up api-gateway-v2
```

### Nginx (Proxy Reverso)
```nginx
# Frontend
server {
    listen 80;
    server_name ui.seudominio.com;
    location / {
        proxy_pass http://localhost:3000;
    }
}

# Backend  
server {
    listen 80;
    server_name api.seudominio.com;
    location / {
        proxy_pass http://localhost:8000;
    }
}
```

## 🧪 Testes

### Verificação Local
```bash
# 1. Backend rodando
curl http://localhost:8000/health

# 2. Frontend rodando  
curl http://localhost:3000

# 3. CORS funcionando
# Abra http://localhost:3000 no browser e teste login
```

### Endpoints Testados
- [x] Login/Registro de usuários
- [x] Criação e listagem de buscas
- [x] Download de resultados
- [x] Funcionalidades admin
- [x] Extração de texto

## 🔧 Troubleshooting

### CORS Issues
Se houver problemas de CORS, verifique:
1. Backend FastAPI configurado com origins corretos
2. Frontend usando URLs corretas
3. Headers de Authorization corretos

### Conexão com Backend
```bash
# Verificar se FastAPI está acessível
curl http://localhost:8000/health

# Verificar logs do FastAPI
cd ../web-justice-v0
docker-compose logs api-gateway-v2
```

## 📝 Compatibilidade

### Estrutura Original Preservada
A estrutura original em `web-justice-v0/` continua funcionando:

```bash
cd ../web-justice-v0
docker-compose up  # Todos os serviços incluindo UI original
```

### Transição Gradual
- ✅ Frontend independente: Esta pasta
- ✅ Frontend original: `web-justice-v0/services/nextjs_ui/`
- ✅ Backend único: FastAPI apenas (Flask descontinuado)

---

## 🎯 Próximos Passos

1. **SSL/TLS**: Configurar HTTPS para produção
2. **CDN**: Implementar CDN para assets estáticos  
3. **Monitoramento**: Health checks independentes
4. **CI/CD**: Pipeline de deploy automatizado

---

**Arquitetura FastAPI Exclusiva - Frontend Totalmente Independente** 🚀
