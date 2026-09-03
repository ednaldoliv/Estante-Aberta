# Estante Aberta

Plataforma web para compartilhamento e descoberta de livros e resenhas.

## Visao geral

- Frontend: React + Vite + React Router
- Backend: Node.js + Express + Prisma
- Banco de dados: PostgreSQL

## Requisitos

- Node.js 18+
- PostgreSQL 12+ (Neon recomendado)
- npm

## Instalacao

1. Clone o repositorio:

```bash
git clone https://github.com/EdnaldoBerk/Projeto-Daniel.git
cd Projeto-Daniel
```

2. Instale as dependencias:

```bash
npm install
```

3. Configure o arquivo `.env` na raiz com os valores do seu ambiente. Para Neon, use a URL de conexão fornecida pelo painel do projeto:

```env
DATABASE_URL="postgresql://usuario:senha@ep-exemplo.sa-east-1.aws.neon.tech/neondb?sslmode=require"
ADMIN_ACCESS_KEY="sua-chave-admin"
PORT=3001
VITE_API_URL="http://localhost:3001/api"
```

4. Crie o banco e aplique schema/migracoes:

```bash
npm run prisma:generate
npm run prisma:push
```

O comando `prisma:push` valida a conexão e sincroniza o schema diretamente com o banco Neon configurado em `DATABASE_URL`. Nunca versionar o arquivo `.env`.

## Executando o projeto

Subir frontend e backend juntos (recomendado):

```bash
npm run dev
```

Aplicacao disponivel em:

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Scripts principais

- `npm run dev`: sobe frontend e backend
- `npm run dev:frontend`: sobe somente o frontend
- `npm run dev:backend`: sobe somente o backend
- `npm run build`: gera build do frontend
- `npm run preview`: preview da build do frontend
- `npm run prisma:generate`: gera Prisma Client
- `npm run prisma:push`: sincroniza schema com o banco

## Estrutura resumida

```text
.
|- backend/src/
|  |- index.js
|  |- controllers/
|  |- services/
|  |- routes/
|  |- config/
|  `- prisma/
|- frontend/src/
|  |- App.jsx
|  |- pages/
|  |- components/
|  |- services/
|  `- styles/
|- vite.config.js
`- package.json
```

## Notas

- Uploads ficam em `backend/uploads`.
- Para acesso administrativo, o usuario deve ter `isAdmin = true` e usar a chave definida em `ADMIN_ACCESS_KEY`.
- Projeto academico de uso privado.
- Equipe Ednaldo, Hugo, Lisa e Alonso

