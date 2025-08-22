# Dockerfile para Web Justice UI - Frontend Independente
# Baseado no Dockerfile.nextjs original, adaptado para estrutura standalone

# Estágio 1: Instalação de Dependências e Build
FROM node:18-alpine AS deps

# Define o diretório de trabalho
WORKDIR /app

# Copia o package.json e o package-lock.json
COPY package.json package-lock.json* ./

# Instala as dependências
RUN npm install

# --------------------------------------------------------------------------

# Estágio 2: Build da Aplicação
FROM node:18-alpine AS builder

WORKDIR /app

# Copia as dependências instaladas do estágio anterior
COPY --from=deps /app/node_modules ./node_modules

# Copia o código fonte do Next.js
COPY . .

# Constrói a aplicação
RUN npm run build

# --------------------------------------------------------------------------

# Estágio 3: Produção
FROM node:18-alpine AS runner

WORKDIR /app

# Define o ambiente como produção
ENV NODE_ENV=production

# Copia os artefatos do build do estágio anterior
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expõe a porta que o Next.js usa
EXPOSE 3000

# Define o comando para iniciar a aplicação
CMD ["npm", "start"]