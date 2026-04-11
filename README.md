# MyAgent

Assistente pessoal com IA em arquitetura monorepo, com foco em:
- conversa em linguagem natural
- orquestração via backend próprio
- auditoria de ações
- base para integrações com agenda, e-mail, finanças e notificações

Este repositório já possui um scaffold funcional de:
- backend (`Fastify + Prisma + PostgreSQL`)
- mobile (`React Native + Expo`)
- pacotes compartilhados (`contracts`, `sdk-client`, `domain`, `tool-definitions`)

---

## 1) Visão geral da arquitetura

Fluxo alvo:

`Usuário -> App Mobile -> Backend -> OpenAI / Google / API Financeira / Scheduler / Push`

Princípios implementados no scaffold:
- app mobile fala apenas com o backend
- backend centraliza regras, autenticação e auditoria
- ações sensíveis devem ser confirmadas (a regra está prevista; execução real de tools ainda será evoluída)

Estado atual (MVP técnico inicial):
- endpoint `POST /chat` funcional
- criação automática de thread de conversa
- criação de registro de auditoria por interação
- autenticação mínima de desenvolvimento via header `x-user-id`

---

## 2) Estrutura do monorepo

```txt
myagent/
  apps/
    backend/              # API Fastify + Prisma
    mobile/               # App React Native (Expo)
  packages/
    contracts/            # Schemas e tipos compartilhados (Zod)
    sdk-client/           # Cliente TypeScript para consumir backend
    domain/               # Regras de domínio (base)
    tool-definitions/     # Catálogo de tools (base)
    config/               # Configurações compartilhadas
  infra/
    docker/               # docker-compose (Postgres + Redis)
    migrations/           # espaço para artefatos complementares
    observability/        # espaço para observabilidade
  docs/
    architecture/
    adr/
```

---

## 3) Pré-requisitos

Instale no ambiente local:
- Node.js `>= 22`
- Corepack habilitado (vem com Node moderno)
- Docker Desktop + Docker Compose v2
- Git

Para rodar mobile no celular:
- Expo Go (Android/iOS)

Para rodar iOS localmente:
- macOS + Xcode (opcional)

---

## 4) Setup do ambiente (passo a passo)

### 4.1 Clonar e instalar dependências

```bash
git clone <url-do-repositorio>
cd myagent
corepack pnpm install --ignore-scripts
```

Nota:
- o projeto usa `pnpm` via `corepack`, não `npm`.

### 4.2 Subir infraestrutura local

```bash
docker compose -f infra/docker/docker-compose.yml up -d
```

Serviços esperados:
- PostgreSQL em `localhost:5433`
- Redis em `localhost:6379`

Verificar:

```bash
docker compose -f infra/docker/docker-compose.yml ps
```

### 4.3 Configurar backend

Crie o arquivo de ambiente do backend:

Linux/macOS:
```bash
cp apps/backend/.env.example apps/backend/.env
```

Windows PowerShell:
```powershell
Copy-Item apps/backend/.env.example apps/backend/.env
```

Gerar client Prisma e aplicar migration:

```bash
corepack pnpm --filter @myagent/backend db:generate
corepack pnpm --filter @myagent/backend exec prisma migrate dev --name init
```

### 4.4 Configurar mobile

A configuração atual do mobile está em:
- `apps/mobile/app.json` -> `expo.extra.backendUrl`
- `apps/mobile/app.json` -> `expo.extra.userId`

Por padrão:
- `backendUrl`: `http://localhost:3000`
- `userId`: `demo-user`

Se for testar em dispositivo físico, troque `backendUrl` para o IP da sua máquina na rede local.

---

## 5) Como executar o projeto

### 5.1 Rodar backend

```bash
corepack pnpm --filter @myagent/backend dev
```

Backend disponível em:
- `http://localhost:3000`

Endpoints atuais:
- `GET /health`
- `POST /chat`

### 5.2 Rodar mobile (Expo)

Em outro terminal:

```bash
corepack pnpm --filter @myagent/mobile dev
```

Comandos úteis:

```bash
corepack pnpm --filter @myagent/mobile android
corepack pnpm --filter @myagent/mobile ios
corepack pnpm --filter @myagent/mobile web
```

---

## 6) Scripts úteis

Na raiz do monorepo:

```bash
corepack pnpm dev
corepack pnpm build
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm test
```

Scripts por workspace:

```bash
corepack pnpm --filter @myagent/backend dev
corepack pnpm --filter @myagent/backend build
corepack pnpm --filter @myagent/backend db:generate
corepack pnpm --filter @myagent/backend db:migrate
corepack pnpm --filter @myagent/backend db:push

corepack pnpm --filter @myagent/mobile dev
corepack pnpm --filter @myagent/mobile typecheck
```

---

## 7) Validação rápida do setup

### 7.1 Healthcheck

```bash
curl http://localhost:3000/health
```

Resposta esperada (exemplo):

```json
{
  "ok": true,
  "service": "backend",
  "timestamp": "2026-04-11T20:21:59.985Z"
}
```

### 7.2 Chat com auditoria

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -H "x-user-id: demo-user" \
  -d '{"message":"Quais compromissos tenho hoje?"}'
```

Resposta esperada (exemplo):

```json
{
  "threadId": "cmxxxxx",
  "auditId": "cmxxxxx",
  "answer": "Mensagem recebida. Próximo passo: integrar Responses API + ferramentas de agenda/finanças com confirmação para escrita."
}
```

---

## 8) Contratos de API atuais

`POST /chat`

Request:

```json
{
  "threadId": "opcional",
  "message": "texto obrigatório"
}
```

Headers:
- `x-user-id` (obrigatório)

Response:

```json
{
  "threadId": "string",
  "auditId": "string",
  "answer": "string"
}
```

Erros comuns:
- `401 missing_user` (header ausente)
- `400 invalid_request` (payload inválido)
- `400 empty_message` (mensagem vazia)
- `404 thread_not_found` (thread não pertence ao usuário)

---

## 9) Modelo de dados atual (Prisma)

Entidades implementadas:
- `User`
  - `id`, `externalId`, `email`, timestamps
- `ConversationThread`
  - vínculo com `User`, `title`, timestamps
- `AgentAudit`
  - vínculo com `User`/`ConversationThread`, `action`, `status`, `inputPayload`, `outputPayload`, timestamp

Arquivo de referência:
- `apps/backend/prisma/schema.prisma`

---

## 10) Troubleshooting

### Porta 5432 ocupada

O projeto já usa `5433` para evitar conflito:
- `infra/docker/docker-compose.yml`: `5433:5432`
- `apps/backend/.env.example`: `localhost:5433`

### Backend não conecta no banco

Verifique:
1. containers ativos (`docker compose ... ps`)
2. valor de `DATABASE_URL` em `apps/backend/.env`
3. migration aplicada (`prisma migrate dev`)

### Mobile não conecta no backend no dispositivo físico

Use IP local da máquina host em `apps/mobile/app.json`, por exemplo:

```json
"extra": {
  "backendUrl": "http://192.168.0.10:3000",
  "userId": "demo-user"
}
```

### `x-user-id` obrigatório

Sem o header, todas as rotas (exceto `/health`) retornam `401`.

---

## 11) Roadmap técnico imediato

Próximos incrementos recomendados:
1. Integrar OpenAI Responses API no `POST /chat`.
2. Implementar tools de agenda (`calendar.list_events`, `calendar.find_free_slots`).
3. Adicionar confirmação explícita para ações de escrita.
4. Evoluir autenticação de `x-user-id` para fluxo real (JWT/OAuth).
5. Expandir auditoria e observabilidade.

---

## 12) Convenções de desenvolvimento

- Linguagem principal: TypeScript
- Gerenciador de pacotes: `pnpm` (via `corepack`)
- Monorepo com workspaces
- Validação de tipos com `tsc`
- Contratos compartilhados em `packages/contracts`

Antes de abrir PR, execute:

```bash
corepack pnpm typecheck
corepack pnpm build
```
