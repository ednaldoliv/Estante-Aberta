# Estante Aberta

Plataforma web para descobrir livros, publicar resenhas e reunir interações de leitores. Os livros funcionam como uma vitrine pública: a plataforma apresenta informações, resenhas e links externos de compra, sem oferecer download de obras.

## Funcionalidades

- Catálogo público de livros, busca e livros em destaque.
- Resenhas públicas com curtidas, comentários e respostas.
- Favoritos e lista de leituras por usuário.
- Avaliações de 1 a 5 estrelas vinculadas a comentários.
- Média, total e distribuição de avaliações calculados no banco.
- Perfil com foto, biografia, favoritos e leituras.
- Cadastro, login, recuperação de senha e autenticação por JWT.
- Área administrativa para gerenciar livros, resenhas, comentários, denúncias e usuários.
- Upload de capas, galeria de livros e fotos de perfil.

### Regra de avaliações e comentários

Um usuário pode escrever vários comentários em uma mesma resenha, mas tem apenas **uma avaliação em estrelas ativa por resenha**.

- O primeiro comentário pode ter uma nota de 1 a 5.
- Depois que uma nota é registrada, o seletor de estrelas deixa de aparecer para esse usuário naquela resenha.
- Comentários posteriores são enviados sem nota e não alteram a média.
- Para mudar a avaliação, o usuário exclui o comentário que contém a nota. A avaliação é removida, as estatísticas são recalculadas e o seletor volta a aparecer.

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Frontend | React 19, Vite, React Router e CSS Modules |
| Backend | Node.js, Express e Multer |
| Banco de dados | PostgreSQL, Prisma ORM e Neon |
| Autenticação | JWT e bcryptjs |

## Arquitetura

```text
frontend (React/Vite)
        |
        | HTTP /api
        v
backend (Express)
        |
        +-- routes       definição dos endpoints
        +-- controllers  validação e regras HTTP
        +-- services     acesso ao Prisma e regras de dados
        +-- middleware   autenticação e autorização
        +-- prisma       schema e migrations PostgreSQL
        |
        v
PostgreSQL / Neon
```

O frontend usa `VITE_API_URL` para acessar a API. O backend atende sob o prefixo `/api` e expõe arquivos enviados em `/uploads`.

## Requisitos

- Node.js 20 ou superior recomendado.
- npm.
- Banco PostgreSQL acessível; Neon é uma opção suportada.

## Configuração local

1. Instale as dependências.

   ```bash
   npm ci
   ```

2. Crie o arquivo de ambiente a partir do exemplo.

   ```powershell
   Copy-Item .env.example .env
   ```

   Em macOS ou Linux, use `cp .env.example .env`.

3. Preencha o `.env` com credenciais próprias. Nunca envie esse arquivo ao Git.

   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
   JWT_SECRET="uma-chave-aleatoria-com-pelo-menos-32-caracteres"
   PORT=3001
   VITE_API_URL="http://localhost:3001/api"
   ```

   Consulte a tabela de variáveis abaixo e configure também o SMTP para usar a recuperação de senha. Gere uma `JWT_SECRET` única e aleatória com pelo menos 32 caracteres. Credenciais expostas devem ser revogadas e substituídas no provedor.

4. Gere o Prisma Client. Antes de aplicar migrations, confirme que `DATABASE_URL` aponta para um banco de desenvolvimento apropriado: o segundo comando altera esse banco.

   ```bash
   npm run prisma:generate
   npm run prisma:migrate:deploy
   ```

5. Inicie frontend e backend.

   ```bash
   npm run dev
   ```

   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:3001`

> Sempre reinicie o backend depois de alterar arquivos em `backend/src` ou aplicar migrations.

### Variáveis de ambiente

Use [`.env.example`](.env.example) como referência; os valores de SMTP são fictícios.

| Variável | Finalidade |
| --- | --- |
| `DATABASE_URL` | Conexão PostgreSQL usada pelo Prisma; mantenha-a secreta. |
| `JWT_SECRET` | Chave de assinatura dos tokens de autenticação; use um valor aleatório exclusivo de pelo menos 32 caracteres. |
| `PORT` | Porta do backend; padrão `3001`. |
| `VITE_API_URL` | URL da API acessível pelo navegador. Variáveis `VITE_*` são incluídas no frontend e nunca devem conter segredos. |
| `FRONTEND_URL` | Origem do frontend usada nos links de recuperação. Use HTTPS em produção; HTTP é aceito apenas para `localhost` ou `127.0.0.1`. |
| `SMTP_HOST`, `SMTP_PORT` | Servidor e porta do serviço SMTP. |
| `SMTP_SECURE` | `true` para conexão TLS desde o início; `false` para conexão que usa STARTTLS. |
| `SMTP_REQUIRE_TLS` | Com `true`, exige STARTTLS quando não há TLS imediato. Mantenha habilitado em produção. |
| `SMTP_USER`, `SMTP_PASSWORD` | Credenciais SMTP, quando exigidas pelo servidor. Mantenha-as secretas. |
| `SMTP_FROM` | Endereço remetente autorizado pelo provedor SMTP. |

### Recuperação de senha

Configure um servidor SMTP e aplique a migration de tokens no banco correto antes de utilizar o recurso. Para desenvolvimento, pode ser usado um servidor SMTP de teste que capture mensagens. O link é enviado ao endereço cadastrado, expira em 15 minutos e é de uso único; a API não retorna o token.

As rotas de recuperação possuem limites em memória por processo. Em várias instâncias, configure uma solução de limitação compartilhada antes de expor a aplicação. A configuração atual aguarda o envio SMTP e pode apresentar diferenças de tempo entre contas existentes e inexistentes.

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia frontend e backend juntos. |
| `npm run dev:frontend` | Inicia somente o Vite. |
| `npm run dev:backend` | Inicia somente a API Express. |
| `npm run build` | Gera a build de produção do frontend. |
| `npm run preview` | Serve localmente a build gerada. |
| `npm test` | Executa testes isolados da recuperação de senha; não valida a entrega real de e-mail nem transações concorrentes no PostgreSQL. |
| `npm run prisma:generate` | Gera o Prisma Client. |
| `npm run prisma:migrate:deploy` | Aplica migrations pendentes e altera o banco configurado. |
| `npm run prisma:push` | Altera o schema do banco sem criar migration; use apenas em desenvolvimento controlado. |
| `npm run security:hash-passwords` | Altera senhas legadas no banco; use somente após avaliar e autorizar a operação. |

## Modelo de dados principal

- `Usuario`: conta, perfil, papel administrativo e relações de interação.
- `Livro`: dados bibliográficos, capa, galeria e links externos de compra.
- `Resenha`: conteúdo editorial vinculado a um livro e a um usuário.
- `Comentario`: comentário, resposta opcional (`parentId`) e nota opcional.
- `AvaliacaoResenha`: fonte canônica das estatísticas de estrelas; possui unicidade em `usuarioId + resenhaId`.
- `Favorito`, `LeituraUsuario` e `CurtidaResenha`: interações por usuário.
- `DenunciaComentario`: moderação de comentários reportados.

`Comentario.nota` identifica visualmente o comentário avaliado, enquanto `AvaliacaoResenha` armazena a avaliação usada para calcular média, quantidade e distribuição. A criação e a remoção desses dados são feitas de forma transacional.

## Autenticação e permissões

- Senhas são armazenadas com bcrypt.
- O login emite JWT com validade de 8 horas.
- O frontend envia o token como `Authorization: Bearer <token>` nas requisições autenticadas.
- Usuários só podem alterar dados próprios, salvo administradores.
- Endpoints administrativos exigem um token com papel `admin`.

## Rotas principais da API

Base local: `http://localhost:3001/api`

| Grupo | Exemplos |
| --- | --- |
| Autenticação | `POST /registro`, `POST /login`, `POST /auth/forgot-password`, `POST /auth/reset-password` |
| Conta | `GET /me`, `PUT /me`, `POST /upload/foto-perfil` |
| Livros | `GET /livros`, `GET /livros/:id`, `GET /search` |
| Resenhas | `GET /resenhas`, `GET /resenhas/livro/:livroId`, `GET /resenhas/:id` |
| Interações | `/favoritos`, `/leituras`, `/resenhas/:resenhaId/curtir` |
| Comentários | `POST /comentarios`, `GET /resenhas/:resenhaId/comentarios`, `DELETE /comentarios/:comentarioId` |
| Avaliações | `GET /resenhas/:resenhaId/avaliacoes` |
| Administração | `/admin/usuarios`, `/admin/livros`, `/admin/resenhas`, `/admin/comentarios`, `/admin/denuncias` |

Consulte [routes.js](backend/src/routes/routes.js) para a lista completa de métodos, parâmetros e proteções de cada endpoint.

## Uploads

Os arquivos são salvos localmente em `backend/uploads/`:

- `backend/uploads/books/`: capas e galerias, máximo de 5 MB por arquivo.
- `backend/uploads/perfil/`: fotos de perfil, máximo de 10 MB por arquivo.

São aceitos JPEG, JPG, PNG, GIF e WEBP. Em produção, use armazenamento persistente ou um serviço de objetos compatível com o ambiente de hospedagem.

## Estrutura de pastas

```text
.
├── backend/
│   ├── scripts/             # scripts de manutenção
│   └── src/
│       ├── config/          # Multer e configurações de upload
│       ├── controllers/     # camada HTTP
│       ├── middleware/      # JWT e roles
│       ├── prisma/          # schema e migrations
│       ├── routes/          # endpoints Express
│       ├── services/        # regras e consultas Prisma
│       └── index.js         # inicialização da API
├── frontend/
│   └── src/
│       ├── components/      # componentes reutilizáveis
│       ├── pages/           # páginas públicas e administrativas
│       ├── services/        # cliente HTTP
│       └── styles/          # estilos globais e de páginas
├── .env.example
├── package.json
└── vite.config.js
```

## Segurança e versionamento

- `.env`, uploads e dependências não são versionados.
- Use apenas `.env.example` para documentar variáveis, sem valores reais.
- Não registre tokens, senhas ou URLs completas de conexão em issues, commits ou logs.
- Antes de publicar, revise CORS, as variáveis da hospedagem e a persistência dos uploads.

## Equipe

Projeto acadêmico desenvolvido por Ednaldo, Hugo, Lisa e Alonso.
